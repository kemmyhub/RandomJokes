import jokes from '../../../server/data/jokes.json';

export async function onRequestGet(context) {
  try {
    if (jokes && jokes.length > 0) {
      const randomIndex = Math.floor(Math.random() * jokes.length);
      return Response.json({
        success: true,
        source: 'local',
        data: jokes[randomIndex]
      });
    }

    // Fallback to external API
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode');
    if (!response.ok) {
      throw new Error('External API failed');
    }
    const data = await response.json();
    const jokeData = {
      type: data.type === 'single' ? 'single' : 'twopart',
      category: data.category || 'general'
    };
    if (data.type === 'single') {
      jokeData.joke = data.joke;
    } else {
      jokeData.setup = data.setup;
      jokeData.delivery = data.delivery;
    }

    return Response.json({
      success: true,
      source: 'external',
      data: jokeData
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Unable to fetch joke. Please try again later.'
    }, { status: 500 });
  }
}
