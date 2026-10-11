import jokes from '../../../server/data/jokes.json';

export async function onRequestGet(context) {
  return Response.json({
    success: true,
    count: jokes.length,
    data: jokes
  });
}
