import redis from "../../../../lib/redis";

export async function GET() {
  try {
    const allSchedules = {};

    const keys = await redis.keys('schedule:*:*');
    
    for (const key of keys) {
      const [_, day, date] = key.split(':');
      const slots = await redis.lrange(key, 0, -1);

      const parsedSlots = slots.map((slot) => JSON.parse(slot));

      if (!allSchedules[day]) {
        allSchedules[day] = {};
      }

      allSchedules[day][date] = parsedSlots;
    }

    return new Response(JSON.stringify({ schedules: allSchedules }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch schedules', details: error.message }), { status: 500 });
  }
}
