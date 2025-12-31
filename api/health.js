export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hf_configured: !!process.env.HF_API_KEY,
      openai_configured: !!process.env.OPENAI_API_KEY,
      elevenlabs_configured: !!process.env.ELEVENLABS_API_KEY,
    },
    node_version: process.version,
  });
}
