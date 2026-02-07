"use client";

import { useEffect, useState } from "react";
import { 
  FaRobot, 
  FaServer, 
  FaNetworkWired, 
  FaCog, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaMicrochip, 
  FaMemory, 
  FaHdd,
  FaWhatsapp,
  FaExclamationTriangle,
  FaStar
} from "react-icons/fa";

interface Stats {
  timestamp: string;
  system: {
    hostname: string;
    uptime: string;
    cpu: { usage: number };
    memory: { used: string; total: string; percent: number };
    disk: { used: string; total: string; percent: string };
    network: { localIp: string; tailscaleIp: string };
  };
  openclaw: {
    status: string;
    running: boolean;
    pid: string;
    cpu: string;
    memory: string;
    model: string;
    whatsapp: boolean;
  };
}

const mockData: Stats = {
  timestamp: new Date().toISOString(),
  system: {
    hostname: "homebot",
    uptime: "up 18 hours",
    cpu: { usage: 15.3 },
    memory: { used: "1.2G", total: "16G", percent: 7.5 },
    disk: { used: "20G", total: "98G", percent: "21%" },
    network: { localIp: "192.168.1.223", tailscaleIp: "100.100.81.11" },
  },
  openclaw: {
    status: "active",
    running: true,
    pid: "1033",
    cpu: "8.2",
    memory: "2.3",
    model: "anthropic/claude-3-5-haiku-20241022",
    whatsapp: true,
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [time, setTime] = useState(new Date());
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        
        // Check if API returned valid data
        if (data.error || !data.system) {
          console.log("Using mock data for local development");
          setStats(mockData);
          setIsLocal(true);
        } else {
          setStats(data);
          setIsLocal(false);
        }
      } catch (error) {
        console.error("Failed to fetch stats, using mock data:", error);
        setStats(mockData);
        setIsLocal(true);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    const timeInterval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <FaRobot className="text-purple-400" />
              OpenClaw Server Dashboard
            </h1>
            <p className="text-purple-300 text-xl">{stats.system.hostname.toUpperCase()}</p>
            <p className="text-gray-400">{time.toLocaleString()}</p>
          </div>
          {isLocal && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-yellow-400 font-semibold">MOCK DATA (Local Dev)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* OpenClaw Status Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaRobot className="text-purple-400" />
            OpenClaw Gateway
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${stats.openclaw.running ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {stats.openclaw.running ? <><FaCheckCircle /> RUNNING</> : <><FaTimesCircle /> STOPPED</>}
              </span>
            </div>
            {stats.openclaw.running && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">PID:</span>
                  <span className="text-white font-mono">{stats.openclaw.pid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-purple-400 font-semibold">{stats.openclaw.cpu}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Memory:</span>
                  <span className="text-purple-400 font-semibold">{stats.openclaw.memory}%</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Model:</span>
              <span className="text-white text-sm font-mono">{stats.openclaw.model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">WhatsApp:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${stats.openclaw.whatsapp ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                {stats.openclaw.whatsapp ? <><FaWhatsapp /> Connected</> : <><FaExclamationTriangle /> Disconnected</>}
              </span>
            </div>
          </div>
        </div>

        {/* System Resources Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaServer className="text-blue-400" />
            System Resources
          </h2>
          <div className="space-y-4">
            {/* CPU */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 flex items-center gap-2">
                  <FaMicrochip className="text-blue-400" />
                  CPU Usage
                </span>
                <span className="text-white font-semibold">{stats.system.cpu.usage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.system.cpu.usage}%` }}
                />
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 flex items-center gap-2">
                  <FaMemory className="text-purple-400" />
                  Memory
                </span>
                <span className="text-white font-semibold">{stats.system.memory.used} / {stats.system.memory.total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.system.memory.percent}%` }}
                />
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">{stats.system.memory.percent.toFixed(1)}%</div>
            </div>

            {/* Disk */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 flex items-center gap-2">
                  <FaHdd className="text-green-400" />
                  Disk Space
                </span>
                <span className="text-white font-semibold">{stats.system.disk.used} / {stats.system.disk.total}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: stats.system.disk.percent }}
                />
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">{stats.system.disk.percent}</div>
            </div>
          </div>
        </div>

        {/* Network Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaNetworkWired className="text-green-400" />
            Network
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm mb-1">Local IP</div>
              <div className="text-white font-mono text-lg bg-gray-900/50 px-3 py-2 rounded">{stats.system.network.localIp}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Tailscale IP</div>
              <div className="text-white font-mono text-lg bg-gray-900/50 px-3 py-2 rounded">{stats.system.network.tailscaleIp}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Dashboard URL</div>
              <div className="text-green-400 font-mono text-sm bg-gray-900/50 px-3 py-2 rounded break-all">
                https://homebot.tail76d480.ts.net/
              </div>
            </div>
          </div>
        </div>

        {/* System Info Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 shadow-2xl lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCog className="text-yellow-400" />
            System Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Hostname</div>
              <div className="text-white text-xl font-semibold">{stats.system.hostname}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Uptime</div>
              <div className="text-white text-xl font-semibold">{stats.system.uptime}</div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-2xl">
          <div className="text-center">
            <FaStar className="text-6xl mb-3 text-green-400 mx-auto" />
            <div className="text-white text-2xl font-bold mb-2">All Systems Online</div>
            <div className="text-green-400">Dashboard auto-refreshes every 3 seconds</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500">
        <p>Last updated: {new Date(stats.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
