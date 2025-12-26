/**
 * Vercel Serverless Function for Audio Metadata Extraction
 * Fetches an MP3 file and extracts ID3 metadata (title, artist, album, duration)
 * 
 * Usage: /api/audio-metadata?url=https://example.com/song.mp3
 */

import { parseBuffer } from 'music-metadata';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      console.error('[AudioMetadata] Missing or invalid url parameter');
      res.status(400).json({ error: 'Missing url parameter' });
      return;
    }

    console.log('[AudioMetadata] Fetching metadata for:', url);

    // Fetch the MP3 file
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MagicWork/1.0',
        'Accept': '*/*',
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      console.error('[AudioMetadata] Fetch failed:', response.status, response.statusText);
      res.status(502).json({ 
        error: `Failed to fetch audio file: ${response.status} ${response.statusText}`,
        url 
      });
      return;
    }

    // Convert to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('[AudioMetadata] File size:', buffer.length, 'bytes');

    // Parse ID3/metadata
    const metadata = await parseBuffer(buffer, { mimeType: 'audio/mpeg', size: buffer.length });
    const common = metadata.common || {};
    const format = metadata.format || {};

    console.log('[AudioMetadata] Parsed metadata:', {
      title: common.title,
      artist: common.artist,
      duration: format.duration
    });

    // Extract duration in seconds
    const durationSec = Number.isFinite(format.duration) 
      ? Math.round(format.duration) 
      : null;

    // Return structured metadata
    const result = {
      duration_sec: durationSec,
      title: common.title || null,
      artist: common.artist || (common.artists && common.artists[0]) || null,
      album: common.album || null,
      year: common.year || null,
      genre: (common.genre && common.genre[0]) || null
    };

    console.log('[AudioMetadata] Returning metadata:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('[AudioMetadata] Error:', error.message);
    console.error('[AudioMetadata] Stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to parse audio metadata',
      details: error.toString()
    });
  }
}
