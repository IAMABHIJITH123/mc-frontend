"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Activity, Globe, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { backendService, ServerStats } from "@/services/backend-service";

export default function BackendStatusCard() {
    const [stats, setStats] = useState<ServerStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await backendService.getStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError("Unable to connect to backend services.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-xl animate-fade-in group">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                <Database size={120} />
            </div>

            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Backend Status</h2>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">Core Services</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />}
                        <button 
                            onClick={fetchData} 
                            disabled={isLoading}
                            className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all disabled:opacity-30"
                            title="Refresh Status"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${
                            error ? "text-red-400 border-red-500/20 bg-red-500/10" : 
                            isLoading && stats.length === 0 ? "text-neutral-500 border-white/10 bg-white/5" :
                            "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${error ? "bg-red-500" : isLoading && stats.length === 0 ? "bg-neutral-500" : "bg-emerald-500 animate-pulse"}`} />
                            {error ? "Service Error" : isLoading && stats.length === 0 ? "Connecting..." : "Operational"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Primary Status Card */}
                    <div className="col-span-1 md:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                            <Globe className="w-4 h-4" />
                            Live Response
                        </div>
                        <div className="text-lg font-medium text-white min-h-[1.75rem] flex items-center">
                            {error ? (
                                <span className="text-red-400/80 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </span>
                            ) : isLoading && stats.length === 0 ? (
                                <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
                            ) : (
                                <span>Systems Operational</span>
                            )}
                        </div>
                    </div>

                    {/* Future Placeholder: Users */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                        <div className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-tighter">Total Users</div>
                        <div className="text-2xl font-bold text-white/50 italic">Coming Soon</div>
                    </div>
                </div>

                {/* Footer / Meta */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-neutral-600 font-mono uppercase tracking-[0.2em]">
                    <span>Node.js Backend v1.0</span>
                    <span>Endpoint: /stats</span>
                </div>
            </CardContent>
        </Card>
    );
}
