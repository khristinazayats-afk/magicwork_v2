export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const hf_token = process.env.HF_API_KEY || '';
  const masked_hf = hf_token ? `${hf_token.substring(0, 8)}...${hf_token.substring(hf_token.length - 4)}` : 'not set';
  
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hf_configured: !!process.env.HF_API_KEY,
      hf_token_masked: masked_hf,
      openai_configured: !!process.env.OPENAI_API_KEY,
      elevenlabs_configured: !!process.env.ELEVENLABS_API_KEY,
    },
    node_version: process.version,
  });
}
