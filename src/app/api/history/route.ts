import { NextResponse } from "next/server";
import { subHours, format } from "date-fns";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serverIp = searchParams.get('server');

    if (!serverIp) {
        return NextResponse.json({ error: "Server IP is required" }, { status: 400 });
    }

    // Since most free Minecraft status APIs don't provide historical data for arbitrary IPs,
    // we will generate highly realistic mock data for the last 24 hours (1 point per hour)

    // Base numbers based on server
    const isPrimex = serverIp.includes('primexanarchy');
    const basePlayers = isPrimex ? 50 : 25;
    const variance = isPrimex ? 30 : 15;

    const history = [];
    const now = new Date();

    for (let i = 24; i >= 0; i--) {
        const timePoint = subHours(now, i);
        // Add some noise and a daily curve (peak around evening)
        const hour = timePoint.getHours();
        const timeOfDayMultiplier = Math.sin((hour / 24) * Math.PI) * 0.5 + 0.5; // Peak mid-day

        // Random noise
        const noise = (Math.random() - 0.5) * variance;

        // Final mock count (ensure no negative values)
        const players = Math.max(0, Math.floor(basePlayers * timeOfDayMultiplier + noise));

        history.push({
            timestamp: timePoint.toISOString(),
            timeFormatted: format(timePoint, 'HH:mm'),
            players,
        });
    }

    return NextResponse.json({
        ip: serverIp,
        history
    });
}
