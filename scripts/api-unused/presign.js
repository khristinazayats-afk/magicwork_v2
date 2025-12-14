// pages/api/presign.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// helper to create UUID v4
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const REGION = process.env.AWS_REGION;
    const BUCKET = process.env.AUDIO_BUCKET;
    const CDN_DOMAIN = process.env.CDN_DOMAIN;

    const s3 = new S3Client({ region: REGION });
    const uuid = uuidv4();
    const Key = `tracks/${uuid}/original.mp3`;

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key,
      ContentType: "audio/mpeg",
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 15 * 60 });
    const cdnUrl = `https://${CDN_DOMAIN}/${Key}`;

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({
      uuid,
      key: Key,
      uploadUrl,
      cdnUrl,
    });
  } catch (err) {
    console.error("Presign error:", err);
    res.status(500).json({ error: "Failed to create presigned URL" });
  }
}
