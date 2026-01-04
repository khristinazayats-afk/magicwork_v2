export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const token = process.env.HF_API_KEY;
  
  if (!token) {
    return res.status(400).json({ error: 'HF_API_KEY not set' });
  }

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        max_tokens: 10,
      }),
    });

    const data = await response.json();
    
    return res.status(response.status).json({
      status: response.status,
      response_data: data,
      token_length: token.length,
      token_start: token.substring(0, 10),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
