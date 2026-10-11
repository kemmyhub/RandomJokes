export async function onRequestPost(context) {
  try {
    const apiKey = context.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({
        success: false,
        error: 'AI joke generation is not configured. Add OPENAI_API_KEY in Cloudflare Pages settings.'
      }, { status: 503 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a comedian. Generate a short, clean, and funny joke. Return only the joke text, nothing else.'
          },
          {
            role: 'user',
            content: 'Tell me a funny joke.'
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const joke = data.choices[0]?.message?.content?.trim();

    return Response.json({
      success: true,
      source: 'ai',
      data: {
        type: 'single',
        joke: joke,
        category: 'ai-generated'
      }
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Unable to generate AI joke'
    }, { status: 500 });
  }
}
