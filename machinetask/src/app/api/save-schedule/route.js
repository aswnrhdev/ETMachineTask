import redis from "../../../../lib/redis";

export async function POST(req) {
  const { date, slots } = await req.json();

  try {
    const day = new Date(date).toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); 

    if (slots.length === 0) {
        await redis.lpush(`schedule:${day}:${date}`, ...defaultSlots.map(slot => JSON.stringify(slot)));
    } else {
        const key = `schedule:${day}:${date}`;
        for (const slot of slots) {
            await redis.lpush(key, JSON.stringify(slot));
        }
    }

    return new Response(JSON.stringify({ message: 'Schedule saved successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save schedule', details: error.message }), { status: 500 });
  }
}
