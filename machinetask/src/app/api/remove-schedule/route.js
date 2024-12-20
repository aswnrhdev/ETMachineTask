import redis from "../../../../lib/redis";

export async function POST(req) {
  const { date, index } = await req.json();

  try {
    const keys = await redis.keys(`schedule:*:${date}`);
    for (const key of keys) {
      const slots = await redis.lrange(key, 0, -1);

      if (index >= 0 && index < slots.length) {
        const slotToRemove = slots[index];

        await redis.lrem(key, 0, slotToRemove);
      }
    }

    return new Response(JSON.stringify({ message: 'Slot removed successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to remove schedule', details: error.message }), { status: 500 });
  }
}
