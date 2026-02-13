"use client";

import { useEffect, useState } from "react";
import NetworkBlobVisualization from "./components/NetworkBlobVisualization";

interface Stats {
  timestamp: string;
  system: {
    hostname: string;
    uptime: string;
    cpu: { usage: number };
    memory: { used: string; total: string; percent: number };
    disk: { used: string; total: string; percent: string };
    network: {
      localIp: string;
      tailscaleIp: string;
      usage?: number;
    };
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
    network: {
      localIp: "192.168.1.223",
      tailscaleIp: "100.100.81.11",
      usage: Math.random() * 40 + 10,
    },
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

/* ── tiny arc bar for the HUD corners ── */
function ArcGauge({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(value / max, 1);
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dashLen = circ * 0.75; // 270 degrees
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle
        cx="22" cy="22" r={r}
        fill="none" stroke="currentColor" strokeWidth="2.5"
        className="text-white/[0.06]"
        strokeDasharray={`${dashLen} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(135 22 22)"
      />
      <circle
        cx="22" cy="22" r={r}
        fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={`${dashLen * pct} ${circ}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform="rotate(135 22 22)"
        className="transition-all duration-700"
      />
      <text
        x="22" y="24" textAnchor="middle"
        className="fill-white font-mono text-[9px] font-bold"
      >
        {Math.round(value)}%
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.error || !data.system) {
          setStats(mockData);
        } else {
          setStats(data);
        }
      } catch {
        setStats(mockData);
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
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <span className="text-neutral-600 font-mono text-sm tracking-widest animate-pulse">
          INITIALIZING...
        </span>
      </div>
    );
  }

  const diskPct = parseFloat(stats.system.disk.percent);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-[var(--font-geist-mono)] select-none">

      {/* ── subtle radial vignette ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_black_100%)] z-10" />

      {/* ── grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── blob (fills entire viewport) ── */}
      <div className="absolute inset-0 z-0">
        <NetworkBlobVisualization activity={stats.system.cpu.usage} />
      </div>

      {/* ── center label ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <p className="text-white/20 text-[10px] tracking-[0.35em] uppercase mb-1">cpu load</p>
        <p className="text-white/60 text-3xl font-bold tabular-nums tracking-tight">
          {stats.system.cpu.usage.toFixed(1)}<span className="text-lg text-white/30 ml-0.5">%</span>
        </p>
        <p className="text-white/10 text-[10px] tracking-[0.25em] uppercase mt-2">
          processor activity
        </p>
      </div>

      {/* ══════════  CORNER HUDs  ══════════ */}

      {/* ── TOP LEFT : CPU ── */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-start gap-3">
          <ArcGauge value={stats.system.cpu.usage} color="#00ffaa" />
          <div>
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase">cpu</p>
            <p className="text-white/80 text-lg font-bold tabular-nums leading-tight">
              {stats.system.cpu.usage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* ── TOP RIGHT : Memory ── */}
      <div className="absolute top-6 right-6 z-20 text-right">
        <div className="flex items-start gap-3 flex-row-reverse">
          <ArcGauge value={stats.system.memory.percent} color="#00ddff" />
          <div>
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase">mem</p>
            <p className="text-white/80 text-lg font-bold tabular-nums leading-tight">
              {stats.system.memory.percent.toFixed(1)}%
            </p>
            <p className="text-white/20 text-[10px] font-mono mt-0.5">
              {stats.system.memory.used} / {stats.system.memory.total}
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM LEFT : Disk + System ── */}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="flex items-end gap-3">
          <ArcGauge value={diskPct} color="#a855f7" />
          <div>
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase">disk</p>
            <p className="text-white/80 text-lg font-bold tabular-nums leading-tight">
              {stats.system.disk.percent}
            </p>
            <p className="text-white/20 text-[10px] font-mono mt-0.5">
              {stats.system.disk.used} / {stats.system.disk.total}
            </p>
          </div>
        </div>
        {/* tiny system info */}
        <div className="mt-3 space-y-0.5">
          <p className="text-white/15 text-[10px] font-mono">
            {stats.system.hostname.toUpperCase()} &middot; {stats.system.uptime}
          </p>
        </div>
      </div>

      {/* ── BOTTOM RIGHT : OpenClaw / Services ── */}
      <div className="absolute bottom-6 right-6 z-20 text-right">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-white/30 tracking-[0.2em] uppercase">openclaw</span>
            <span className={`w-1.5 h-1.5 rounded-full ${stats.openclaw.running ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"}`} />
          </div>
          {stats.openclaw.running && (
            <p className="text-white/20 text-[10px] font-mono">
              PID {stats.openclaw.pid} &middot; {stats.openclaw.cpu}% cpu &middot; {stats.openclaw.memory}% mem
            </p>
          )}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] text-white/30 tracking-[0.2em] uppercase">whatsapp</span>
            <span className={`w-1.5 h-1.5 rounded-full ${stats.openclaw.whatsapp ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"}`} />
          </div>
          <p className="text-white/10 text-[10px] font-mono mt-1 max-w-[240px] truncate">
            {stats.openclaw.model}
          </p>
        </div>
      </div>

      {/* ── TOP CENTER : hostname + clock ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase">
          {stats.system.hostname}
        </p>
        <p className="text-white/40 text-xs font-mono tabular-nums mt-0.5">
          {time.toLocaleTimeString()}
        </p>
      </div>

      {/* ── BOTTOM CENTER : tailscale ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center">
        <p className="text-white/10 text-[10px] tracking-[0.2em] uppercase">tailscale</p>
        <p className="text-white/20 text-[10px] font-mono mt-0.5">
          {stats.system.network.tailscaleIp}
        </p>
      </div>

    </div>
  );
}
