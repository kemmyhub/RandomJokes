import jokes from '../../../server/data/jokes.json';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const categoryParam = url.searchParams.get('category')?.toLowerCase();

    let pool = jokes;
    if (categoryParam && categoryParam !== 'all') {
      const filtered = jokes.filter(j => j.category && j.category.toLowerCase() === categoryParam);
      if (filtered.length > 0) {
        pool = filtered;
      }
    }

    if (pool && pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      return Response.json({
        success: true,
        source: 'local',
        data: pool[randomIndex]
      });
    }

    // Fallback to external API if not found
    const targetCat = (categoryParam && categoryParam !== 'all') ? categoryParam : 'Any';
    const response = await fetch(`https://v2.jokeapi.dev/joke/${targetCat}?safe-mode`);
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
