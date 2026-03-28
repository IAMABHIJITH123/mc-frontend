"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { ServerStats } from "@/services/backend-service";

interface PlayerGraphProps {
    server1Name: string;
    server2Name: string;
    primexData: ServerStats[];
    spadikamData: ServerStats[];
    isLoading?: boolean;
}

export default function PlayerGraph({ server1Name, server2Name, primexData, spadikamData, isLoading }: PlayerGraphProps) {
    
    // Merge datasets for Recharts
    const chartData = React.useMemo(() => {
        if (primexData.length === 0 && spadikamData.length === 0) return [];

        // Create a map of timestamps to player counts
        const dataMap: Record<string, { time: string; primex: number | null; spadikam: number | null }> = {};

        // Helper to format timestamp for X-axis (Local Time HH:mm)
        const formatTime = (ts: string) => {
            const date = new Date(ts);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        // Fill map with Primex data
        primexData.forEach(d => {
            const time = formatTime(d.timestamp);
            if (!dataMap[time]) {
                dataMap[time] = { time, primex: d.online, spadikam: null };
            } else {
                dataMap[time].primex = d.online;
            }
        });

        // Fill map with Spadikam data
        spadikamData.forEach(d => {
            const time = formatTime(d.timestamp);
            if (!dataMap[time]) {
                dataMap[time] = { time, primex: null, spadikam: d.online };
            } else {
                dataMap[time].spadikam = d.online;
            }
        });

        // Convert map to sorted array
        return Object.values(dataMap).sort((a, b) => {
            // Sorting by HH:mm string works roughly but better to use actual timestamps if possible
            // For now, since they are sorted by backend, this aggregation is mostly safe
            return 0; // The map preserves insertion order mostly, but let's be safe
        });
        
        /* 
           REFINED APPROACH:
           Since the source arrays are ALREADY sorted by timestamp ascending, 
           we can just use the primexData as the master timeline and look up or interpolate spadikam.
           But simple aggregation is usually better for dual-lines if timestamps differ slightly.
        */
    }, [primexData, spadikamData]);

    const finalData = React.useMemo(() => {
        // Just use primex timestamps as the "master" timeline for simplicity
        // and find the closest spadikam value
        return primexHistoryToChartData(primexData, spadikamData, server1Name, server2Name);
    }, [primexData, spadikamData, server1Name, server2Name]);

    return (
        <Card className="border-white/5 bg-black/40 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white italic tracking-tight underline decoration-cyan-500/30">Network Traffic (Real-time)</h3>
                    {(primexData.length > 0 || spadikamData.length > 0) && (
                        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                            {formatUpdateRange(primexData, spadikamData)}
                        </div>
                    )}
                </div>

                <div className="h-[400px] w-full">
                    {isLoading && finalData.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                            <span className="text-neutral-500 text-sm italic">Connecting to API...</span>
                        </div>
                    ) : finalData.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-50">
                            <span className="text-neutral-400 text-lg font-bold">Collecting data...</span>
                            <span className="text-neutral-500 text-xs">Waiting for backend snapshots</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={finalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#ffffff50"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#ffffff50"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    isAnimationActive={false}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                        borderColor: 'rgba(255, 255, 255, 0.15)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#aaa', fontSize: '11px', marginBottom: '4px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                <Area
                                    type="monotone"
                                    dataKey={server1Name}
                                    stroke="#22d3ee"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCyan)"
                                    isAnimationActive={true}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={server2Name}
                                    stroke="#c084fc"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPurple)"
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Helper to align data
function primexHistoryToChartData(primex: ServerStats[], spadikam: ServerStats[], n1: string, n2: string) {
    if (primex.length === 0) return [];
    
    return primex.map(p => {
        const time = new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Find closest spadikam data point (within 1 min)
        const s = spadikam.find(sd => {
            const diff = Math.abs(new Date(sd.timestamp).getTime() - new Date(p.timestamp).getTime());
            return diff < 65000; // 65 seconds
        });

        return {
            time,
            [n1]: p.online,
            [n2]: s ? s.online : 0
        };
    });
}

function formatUpdateRange(p: ServerStats[], s: ServerStats[]) {
    const all = [...p, ...s].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (all.length === 0) return "";
    const start = new Date(all[0].timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const end = new Date(all[all.length-1].timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    return `${start} - ${end}`;
}
