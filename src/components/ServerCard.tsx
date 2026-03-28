"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Wifi, Server, AlertCircle } from "lucide-react";

interface ServerCardProps {
    name: string;
    ip: string;
    color: "cyan" | "purple";
    latestData?: {
        online: number;
        max: number;
        timestamp: string;
    };
    isLoading?: boolean;
    isError?: boolean;
}

export default function ServerCard({ name, ip, color, latestData, isLoading, isError }: ServerCardProps) {
    // If player count > 0, it's online. If no data, it's offline or loading.
    const isOnline = latestData && latestData.online >= 0;
    const hasData = !!latestData;

    const colorClasses =
        color === "cyan"
            ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            : "text-purple-400 bg-purple-500/10 border-purple-500/20";

    return (
        <Card className="relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-md transition-all hover:border-white/10">
            {/* Decorative Glow */}
            <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 bg-${color}-500`} />

            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{name}</h2>
                        <p className="text-sm text-neutral-400 mt-1 font-mono">{ip}</p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full border flex items-center gap-2 text-sm font-medium ${
                        isOnline && latestData?.online! > 0 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" :
                        isLoading ? "text-neutral-400 border-neutral-500/20 bg-neutral-500/10" :
                        isError ? "text-red-400 border-red-500/20 bg-red-500/10" :
                        "text-red-400 border-red-500/20 bg-red-500/10"
                    }`}>
                        <span className="relative flex h-2 w-2">
                            {isOnline && latestData?.online! > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                isOnline && latestData?.online! > 0 ? 'bg-emerald-500' : 
                                isLoading ? 'bg-neutral-500' : 
                                'bg-red-500'
                            }`}></span>
                        </span>
                        {isOnline && latestData?.online! > 0 ? "Online" : isLoading ? "Pinging..." : "Offline"}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg flex flex-col gap-1 border ${colorClasses}`}>
                        <div className="flex items-center gap-2 text-sm opacity-80">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Players
                            </div>
                        </div>
                        <div className="text-2xl font-bold">
                            {isLoading ? (
                                <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                            ) : hasData ? (
                                <span>{latestData?.online || 0} <span className="text-sm font-normal opacity-50">/ {latestData?.max || 0}</span></span>
                            ) : (
                                <span className="text-sm font-medium opacity-50 italic">Collecting data...</span>
                            )}
                        </div>
                    </div>

                    <div className="p-4 rounded-lg flex flex-col gap-1 border border-white/5 bg-white/5">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Wifi className="w-4 h-4" />
                            Status
                        </div>
                        <div className="text-xl font-bold text-white">
                            {isLoading ? (
                                <div className="h-8 w-12 bg-white/10 rounded animate-pulse" />
                            ) : hasData ? (
                                <span className={latestData?.online! > 0 ? "text-emerald-400" : "text-neutral-500 opacity-50"}>
                                    {latestData?.online! > 0 ? "STABLE" : "IDLE"}
                                </span>
                            ) : (
                                <span className="text-neutral-600">---</span>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2 p-4 rounded-lg flex flex-col gap-1 border border-white/5 bg-white/5">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Server className="w-4 h-4" />
                            System Health
                        </div>
                        <div className="text-sm font-medium text-white truncate flex items-center gap-2">
                            {isLoading ? (
                                <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
                            ) : hasData ? (
                                <>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400`} 
                                            style={{ width: `${Math.min((latestData?.online! / (latestData?.max! || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="opacity-40 text-[10px] font-mono whitespace-nowrap">
                                        {(latestData?.online! / (latestData?.max! || 1) * 100).toFixed(0)}% LOAD
                                    </span>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <AlertCircle className="w-3 h-3" />
                                    No live data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
