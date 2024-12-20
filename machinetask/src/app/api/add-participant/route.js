import redis from "../../../../lib/redis";

export async function POST(req) {
    try {
        const { name } = await req.json();
        console.log("POST request received. Name:", name);

        if (!name) {
            return new Response(JSON.stringify({ error: "Participant name is required" }), { status: 400 });
        }

        await redis.lpush("participants", JSON.stringify({ name }));
        console.log("Participant added to Redis:", name);

        return new Response(JSON.stringify({ message: "Participant added successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error in POST handler:", error);
        return new Response(
            JSON.stringify({ error: "Failed to add participant", details: error.message }),
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const participants = await redis.lrange("participants", 0, -1);
        console.log("Participants fetched from Redis:", participants);

        const parsedParticipants = participants.map((p) => JSON.parse(p));
        return new Response(JSON.stringify({ participants: parsedParticipants }), { status: 200 });
    } catch (error) {
        console.error("Error fetching participants:", error.message);
        return new Response(
            JSON.stringify({ error: "Failed to fetch participants", details: error.message }),
            { status: 500 }
        );
    }
}
