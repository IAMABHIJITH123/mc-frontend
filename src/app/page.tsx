"use client";

import { useEffect, useState, useMemo } from "react";
import { Shield, ChevronDown } from "lucide-react";
import { backendService, ServerStats } from "@/services/backend-service";
import ServerCard from "@/components/ServerCard";
import PlayerGraph from "@/components/PlayerGraph";
import StatsPanel from "@/components/StatsPanel";
import ComparisonBanner from "@/components/ComparisonBanner";
import SoftAurora from "@/components/Background/SoftAurora";
import BackendStatusCard from "@/components/BackendStatusCard";

export default function Home() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [allData, setAllData] = useState<ServerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const SERVER_1 = { name: "Primex Anarchy", ip: "play.primexanarchy.net", color: "cyan" as const };
  const SERVER_2 = { name: "Spadikam Fun", ip: "play.spadikam.fun", color: "purple" as const };

  const fetchAllStats = async () => {
    try {
      setIsError(false);
      const data = await backendService.getStats();
      setAllData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
    // 60 second refresh interval
    const interval = setInterval(fetchAllStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Normalize legacy API fields: some entries use players/maxPlayers instead of online/max
  const normalize = (d: ServerStats): ServerStats => ({
    ...d,
    online: typeof d.players === 'number' ? d.players : d.online,
    max: typeof d.maxPlayers === 'number' ? d.maxPlayers : (d.max || 0),
    timestamp: d.timestamp || d.time || new Date().toISOString(),
  });

  // Process data for components
  const { primexData, spadikamData } = useMemo(() => {
    const pData = allData
      .filter(d => d.server.toLowerCase().includes("primex"))
      .map(normalize)
      .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const sData = allData
      .filter(d => d.server.toLowerCase().includes("spadikam"))
      .map(normalize)
      .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return { primexData: pData, spadikamData: sData };
  }, [allData]);

  const latestPrimex = primexData[primexData.length - 1];
  const latestSpadikam = spadikamData[spadikamData.length - 1];

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Interactive Aurora Background */}
      <SoftAurora
        color1="#22d3ee" // Cyan
        color2="#c084fc" // Purple
        speed={0.5}
        brightness={0.8}
      />

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center z-10 animate-fade-in relative">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl tracking-tight">MC Analytics</span>
        </div>

        <nav className="mt-4 md:mt-0 flex gap-1 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
          {['Dashboard', 'History', 'Players', 'Settings'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === item ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'Dashboard' ? (
        <>
          {/* Hero Section */}
          <div className="w-full max-w-5xl mx-auto px-6 pt-20 pb-12 flex flex-col items-center text-center z-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neutral-300 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live Network Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Server Activity <br /> at a Glance
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
              Monitor real-time player counts, historical trends, and uptime across the network. Built for extreme precision and minimal latency.
            </p>

            <ComparisonBanner
              server1Ip={SERVER_1.ip} server2Ip={SERVER_2.ip}
              server1Name={SERVER_1.name} server2Name={SERVER_2.name}
            />

            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 mt-4 opacity-50">
              <ChevronDown className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="w-full max-w-7xl mx-auto px-6 pb-24 z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            
            {/* Backend Status Section */}
            <div className="mb-8">
              <BackendStatusCard />
            </div>

            {/* Server Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative">
              <ServerCard 
                name={SERVER_1.name} 
                ip={SERVER_1.ip} 
                color={SERVER_1.color} 
                latestData={latestPrimex}
                isLoading={isLoading}
                isError={isError}
              />
              <ServerCard 
                name={SERVER_2.name} 
                ip={SERVER_2.ip} 
                color={SERVER_2.color} 
                latestData={latestSpadikam}
                isLoading={isLoading}
                isError={isError}
              />
            </div>

            {/* Graph and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <PlayerGraph
                  server1Name={SERVER_1.name} 
                  server2Name={SERVER_2.name}
                  primexData={primexData}
                  spadikamData={spadikamData}
                  isLoading={isLoading}
                />
              </div>
              <div className="col-span-1">
                <StatsPanel
                  server1Name={SERVER_1.name} 
                  server2Name={SERVER_2.name}
                  primexData={primexData}
                  spadikamData={spadikamData}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full max-w-5xl mx-auto px-6 pt-32 pb-12 flex flex-col items-center text-center z-10 animate-fade-in relative flex-1">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md mb-8">
            <Shield className="w-10 h-10 text-white/30" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">{activeTab}</h2>
          <p className="text-neutral-400 max-w-md mx-auto text-lg leading-relaxed">
            This module is currently under construction. Check back later for detailed {activeTab.toLowerCase()} analytics, tools, and configurations.
          </p>
        </div>
      )}
    </main>
  );
}
