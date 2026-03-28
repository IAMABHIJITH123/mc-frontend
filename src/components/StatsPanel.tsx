"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Activity, Clock } from "lucide-react";
import { ServerStats } from "@/services/backend-service";

interface StatsPanelProps {
    server1Name: string;
    server2Name: string;
    primexData: ServerStats[];
    spadikamData: ServerStats[];
    isLoading?: boolean;
}

export default function StatsPanel({ server1Name, server2Name, primexData, spadikamData, isLoading }: StatsPanelProps) {

    const calculateStats = (history: ServerStats[]) => {
        if (!history || history.length === 0) return { peak: 0, avg: 0 };
        const players = history.map(h => h.online);
        const peak = Math.max(...players);
        const avg = Math.round(players.reduce((a, b) => a + b, 0) / players.length);
        return { peak, avg };
    };

    const stats1 = calculateStats(primexData);
    const stats2 = calculateStats(spadikamData);

    // Requirement: Uptime assume 100% for now
    const uptime1 = primexData.length > 0 ? 100 : 0;
    const uptime2 = spadikamData.length > 0 ? 100 : 0;

    const renderStatCard = (title: string, icon: React.ReactNode, val1: number, val2: number, suffix: string = "") => {
        const hasData = primexData.length > 0 || spadikamData.length > 0;
        
        return (
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                    {icon}
                    {title}
                </div>
                <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-cyan-400/70 truncate font-semibold" title={server1Name}>
                            {server1Name.split(' ')[0]}
                        </div>
                        <div className="text-lg font-bold text-white shrink-0 leading-none">
                            {isLoading && !hasData ? "..." : (val1 || 0)}{suffix}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-purple-400/70 truncate font-semibold" title={server2Name}>
                            {server2Name.split(' ')[0]}
                        </div>
                        <div className="text-lg font-bold text-white shrink-0 leading-none">
                            {isLoading && !hasData ? "..." : (val2 || 0)}{suffix}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="border-white/5 bg-black/40 backdrop-blur-md">
            <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Analytics (Last 24h)</h3>
                <div className="grid grid-cols-1 gap-4">
                    {renderStatCard("Peak Players", <Trophy className="w-3.5 h-3.5 text-yellow-500" />, stats1.peak, stats2.peak)}
                    {renderStatCard("Average Players", <Activity className="w-3.5 h-3.5 text-blue-400" />, stats1.avg, stats2.avg)}
                    {renderStatCard("Uptime Status", <Clock className="w-3.5 h-3.5 text-emerald-400" />, uptime1, uptime2, "%")}
                </div>
            </CardContent>
        </Card>
    );
}
