// @ts-nocheck
// /api/ingest.js — ESM, Node runtime, S3-based feed read/write (no CDN dependency)

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const config = { runtime: "nodejs" };

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const FEED_SPACES = [
  "Slow Morning",
  "Gentle De-Stress",
  "Take a Walk",
  "Draw Your Feels",
  "Move and Cool",
  "Tap to Ground",
  "Breathe to Relax",
  "Get in the Flow State",
  "Drift into Sleep",
];

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET || process.env.AUDIO_BUCKET;
const CDN_HOST =
  process.env.CDN_HOST ||
  (process.env.CDN_DOMAIN ? `https://${process.env.CDN_DOMAIN}` : "https://cdn.magicwork.app");

// Optional ACL toggle (use only if bucket has ACLs enabled)
const USE_ACL = process.env.S3_USE_ACL === "1";
const ACL_VALUE = "bucket-owner-full-control";

const s3 = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
    : undefined,
});

async function getJsonFromS3(key) {
  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const text = await obj.Body.transformToString();
    return JSON.parse(text);
  } catch {
    return null; // not found or not readable -> treat as empty
  }
}

async function putJsonToS3(key, obj) {
  const body = Buffer.from(JSON.stringify(obj, null, 2));
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: "application/json",
    CacheControl: "public, max-age=60",
  };
  if (USE_ACL) params.ACL = ACL_VALUE;
  await s3.send(new PutObjectCommand(params));
}

async function appendToFeed({ space, entry }) {
  const feedKey = `feeds/${space}.json`;
  console.log("appendToFeed writing:", feedKey, "to bucket:", BUCKET);

  // Read existing feed directly from S3 (no CDN)
  const existing = (await getJsonFromS3(feedKey)) || [];

  // Upsert by uuid
  const i = existing.findIndex((x) => x.uuid === entry.uuid);
  if (i >= 0) existing[i] = entry;
  else existing.push(entry);

  // Write back to S3
  await putJsonToS3(feedKey, existing);
}

export default async function handler(req, res) {
  // CORS / preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!REGION || !BUCKET) {
      return res.status(500).json({ error: "Missing AWS_REGION or S3_BUCKET env vars" });
    }

    // Parse body
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const {
      url,
      directMp3Url,
      pixabayUrl,
      title,
      author,
      space,
      duration_sec,
      license,
    } = body || {};
    const sourceUrl = directMp3Url || url || pixabayUrl;

    if (!sourceUrl) return res.status(400).json({ error: "Missing source URL. Provide { url } or { directMp3Url }." });
    if (!space || !FEED_SPACES.includes(space))
      return res.status(400).json({ error: "Invalid or missing `space`", allowed: FEED_SPACES });

    // Validate URL type
    const isMp3 = /\.mp3($|\?)/i.test(sourceUrl);
    const isPixabayDownload = /cdn\.pixabay\.com\/download\/audio\//i.test(sourceUrl);
    const isPixabayMusicPage = /pixabay\.com\/music\//i.test(sourceUrl);
    if (isPixabayMusicPage && !isMp3 && !isPixabayDownload) {
      return res
        .status(400)
        .json({ error: "Only direct .mp3 or S3 URLs allowed. Provide a cdn.pixabay.com/download/... .mp3 or an S3 URL." });
    }

    // Prepare S3 key for track
    const uuid = uuidv4();
    const key = `tracks/${uuid}/original.mp3`;

    // Presign PUT for S3 upload (add ACL only if enabled)
    const putCmdParams = {
      Bucket: BUCKET,
      Key: key,
      ContentType: "audio/mpeg",
      CacheControl: "public, max-age=31536000, immutable",
    };
    if (USE_ACL) putCmdParams.ACL = ACL_VALUE;

    const putCmd = new PutObjectCommand(putCmdParams);
    const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 900 });

    // Download source MP3
    const headers = { "User-Agent": "magicwork-ingest/1.0", Accept: "audio/mpeg,*/*" };
    if (/pixabay\.com|cdn\.pixabay\.com/i.test(sourceUrl)) headers.Referer = "https://pixabay.com/";
    const fetchOpts = { headers };
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      fetchOpts.signal = AbortSignal.timeout(30000);
    }
    const mp3Resp = await fetch(sourceUrl, fetchOpts);
    if (!mp3Resp || !mp3Resp.ok) {
      return res.status(502).json({
        error: `MP3 download failed: ${mp3Resp ? mp3Resp.status : "no-response"}`,
        url: sourceUrl,
      });
    }
    const bodyBuf = await mp3Resp.arrayBuffer();

    // Upload to S3
    const putResp = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "audio/mpeg" },
      body: bodyBuf,
    });
    if (!putResp.ok) {
      let details = "";
      try {
        details = await putResp.text();
      } catch {}
      return res.status(502).json({ error: `S3 upload failed: ${putResp.status}`, details });
    }

    // Build entry and update feed (via S3)
    const cdnUrl = `${CDN_HOST}/${key}`;
    const entry = {
      uuid,
      title: title || "Unknown Track",
      duration_sec: duration_sec ?? null,
      author: author || "Unknown Artist",
      license: license ?? null,
      space,
      s3_key: key,
      cdn_url: cdnUrl,
      added_at: new Date().toISOString(),
    };

    try {
      await appendToFeed({ space, entry });
    } catch (e) {
      console.error("appendToFeed error:", e?.name, e?.message);
      // do not fail ingestion if feed write fails
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({
      version: "ingest-2025-10-28a",
      mode: "direct",
      uuid,
      key,
      cdnUrl,
      title: entry.title,
      author: entry.author,
      space,
      status: "OK",
      sourceUrl,
    });
  } catch (e) {
    return res.status(500).json({
      error: e?.message || "Server error",
      type: e?.name,
      details: e?.toString?.(),
    });
  }
}
