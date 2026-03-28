"use client";

import useSWR from "swr";
import { Sparkles } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ComparisonBannerProps {
    server1Ip: string;
    server2Ip: string;
    server1Name: string;
    server2Name: string;
}

export default function ComparisonBanner({ server1Ip, server2Ip, server1Name, server2Name }: ComparisonBannerProps) {
    const { data: data1 } = useSWR(`/api/status?server=${server1Ip}`, fetcher, { refreshInterval: 15000 });
    const { data: data2 } = useSWR(`/api/status?server=${server2Ip}`, fetcher, { refreshInterval: 15000 });

    if (!data1 || !data2) return null;

    const players1 = data1.players || 0;
    const players2 = data2.players || 0;

    let leadingServer = null;
    let difference = 0;
    let colorClass = "";

    if (players1 > players2) {
        leadingServer = server1Name;
        difference = players1 - players2;
        colorClass = "text-cyan-400 bg-cyan-950/50 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]";
    } else if (players2 > players1) {
        leadingServer = server2Name;
        difference = players2 - players1;
        colorClass = "text-purple-400 bg-purple-950/50 border-purple-500/30 shadow-[0_0_20px_rgba(192,132,252,0.2)]";
    } else {
        return (
            <div className="flex items-center justify-center p-3 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-sm animate-fade-in mb-8 w-fit mx-auto backdrop-blur-md">
                Servers are currently tied in player count!
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border text-sm font-medium animate-fade-in mb-10 w-fit mx-auto backdrop-blur-md transition-all duration-500 ${colorClass}`}>
            <Sparkles className="w-4 h-4" />
            <span>
                <strong className="font-bold">{leadingServer}</strong> is currently leading by {difference} player{difference !== 1 ? 's' : ''}
            </span>
        </div>
    );
}
