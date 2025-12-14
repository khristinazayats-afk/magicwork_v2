// @ts-nocheck
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const config = { runtime: "nodejs" };

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET || process.env.AUDIO_BUCKET;

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
  } catch (e) {
    console.error("feed read failed:", key, e?.name || e?.message || e);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const space = req.query.space;
  if (!space || typeof space !== "string") {
    return res.status(400).json({ error: "space required" });
  }

  // Try unencoded key first (standard format)
  let key = `feeds/${space}.json`;
  let items = await getJsonFromS3(key);
  
  // Fallback to encoded key if not found
  if (!items) {
    key = `feeds/${encodeURIComponent(space)}.json`;
    items = await getJsonFromS3(key);
  }
  
  if (!items) {
    return res.status(404).json({ error: "space not found", space });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    space,
    count: Array.isArray(items) ? items.length : 0,
    items: Array.isArray(items) ? items : [],
  });
}
