import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serverIp = searchParams.get('server');

    if (!serverIp) {
        return NextResponse.json({ error: "Server IP is required" }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.minetools.eu/ping/${serverIp}`);
        const data = await res.json();

        if (data.error) {
            return NextResponse.json({ error: "Failed to fetch server data", details: data.error }, { status: 500 });
        }

        // Minetools provides players, version, latency
        return NextResponse.json({
            ip: serverIp,
            online: true,
            players: data.players.online,
            maxPlayers: data.players.max,
            ping: data.latency,
            version: data.version.name,
        });
    } catch (error) {
        console.error(`Error fetching status for ${serverIp}:`, error);
        return NextResponse.json({
            ip: serverIp,
            online: false,
            players: 0,
            maxPlayers: 0,
            ping: -1,
            version: 'Unknown'
        });
    }
}
