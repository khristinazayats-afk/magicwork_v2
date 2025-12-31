export default function handler(req, res) {
  res.status(200).json({
    hf_api_key_exists: !!process.env.HF_API_KEY,
    hf_api_key_value: process.env.HF_API_KEY ? 'SET' : 'NOT SET',
    huggingface_api_key_exists: !!process.env.HUGGINGFACE_API_KEY,
    openai_key_exists: !!process.env.OPENAI_API_KEY,
    all_env_keys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY') || k.includes('HF')).map(k => k)
  });
}
