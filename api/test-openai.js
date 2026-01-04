export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Test 1: Check OpenAI key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({
        error: 'OpenAI key not set',
        tests_passed: 0
      });
    }

    // Test 2: Try OpenAI request
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say test' }],
          max_tokens: 5,
        }),
      }
    );

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content || '';

    return res.status(200).json({
      openai_works: openaiResponse.ok,
      openai_status: openaiResponse.status,
      content_preview: content.substring(0, 50),
      full_response: openaiData,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
