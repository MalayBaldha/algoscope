"use client";

import React, { useState } from "react";
import {
  Network,
  Cpu,
  RotateCcw,
  Play,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

interface PacketState {
  seq: number;
  status: "acked" | "in_flight" | "usable" | "locked";
  label: string;
}

interface StreamBucket {
  timestamp: string;
  eventsCount: number;
  label: string;
}

export const RealWorldInspiration: React.FC = () => {
  // TCP Sliding Window state
  const [windowStart, setWindowStart] = useState<number>(2);
  const windowSize = 4; // Window span (rwnd)
  const totalPackets = 10;

  // Stream Processing (Kafka/Flink) Sliding Window state
  const [streamStart, setStreamStart] = useState<number>(2);
  const streamWindowSpan = 3; // 15-minute span (3 buckets of 5m)

  const streamBuckets: StreamBucket[] = [
    { timestamp: "00:00", eventsCount: 142, label: "Bucket 0" },
    { timestamp: "00:05", eventsCount: 230, label: "Bucket 1" },
    { timestamp: "00:10", eventsCount: 315, label: "Bucket 2" },
    { timestamp: "00:15", eventsCount: 188, label: "Bucket 3" },
    { timestamp: "00:20", eventsCount: 420, label: "Bucket 4" },
    { timestamp: "00:25", eventsCount: 295, label: "Bucket 5" },
    { timestamp: "00:30", eventsCount: 160, label: "Bucket 6" },
    { timestamp: "00:35", eventsCount: 210, label: "Bucket 7" },
  ];

  const handleStepForward = () => {
    if (windowStart < totalPackets - windowSize) {
      setWindowStart((prev) => prev + 1);
    } else {
      setWindowStart(0);
    }
  };

  const handleReset = () => {
    setWindowStart(2);
  };

  const handleStepStreamForward = () => {
    if (streamStart < streamBuckets.length - streamWindowSpan) {
      setStreamStart((prev) => prev + 1);
    } else {
      setStreamStart(0);
    }
  };

  const handleResetStream = () => {
    setStreamStart(2);
  };

  // Derive packet states based on windowStart
  const packets: PacketState[] = Array.from({ length: totalPackets }, (_, i) => {
    if (i < windowStart) {
      return { seq: i, status: "acked", label: "ACKed & Freed" };
    } else if (i < windowStart + 2) {
      return { seq: i, status: "in_flight", label: "Sent / In-Flight" };
    } else if (i < windowStart + windowSize) {
      return { seq: i, status: "usable", label: "Usable Window" };
    } else {
      return { seq: i, status: "locked", label: "Blocked by rwnd" };
    }
  });

  return (
    <div className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
      {/* Title & Introduction */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
          <Network className="h-3.5 w-3.5" />
          <span>Real-World Systems Inspiration</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Where Arrays &amp; Sliding Windows Power the Internet
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-3xl">
          The sliding window is not merely an algorithmic trick for coding
          challenges — it is the heartbeat of transmission control and real-time
          event stream processing. Below are two architectural visualizations
          demonstrating how sliding arrays operate inside operating system kernels
          and distributed stream engines.
        </p>
      </div>

      {/* DIAGRAM 1: Interactive TCP Sliding Window Diagram */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-400" />
              <span>
                1. Kernel Buffer Mechanics: TCP Sender Sliding Window (RFC 793)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Window bounds [snd_una = {windowStart}, snd_nxt ={" "}
              {windowStart + 2}, snd_wnd = {windowStart + windowSize}]
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStepForward}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-500"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Slide Window (ACK Received)</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* SVG Visualization: TCP */}
        <div className="overflow-x-auto py-4">
          <svg
            className="w-full min-w-[680px] h-48 select-none"
            viewBox="0 0 760 180"
          >
            <defs>
              <linearGradient
                id="windowHighlight"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Background Grid Box for Buffer */}
            <rect
              x="20"
              y="50"
              width="720"
              height="65"
              rx="8"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Active Sliding Window Box overlay */}
            <rect
              x={30 + windowStart * 70}
              y="45"
              width={windowSize * 70}
              height="75"
              rx="6"
              fill="url(#windowHighlight)"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Window Bracket & Label */}
            <text
              x={30 + windowStart * 70 + (windowSize * 70) / 2}
              y="30"
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              Active Receiver Window (rwnd = {windowSize} packets)
            </text>

            {/* Packet Slots */}
            {packets.map((pkt, idx) => {
              const xPos = 35 + idx * 70;
              const yPos = 56;
              const isInsideWindow =
                idx >= windowStart && idx < windowStart + windowSize;
              const isSentUnacked =
                idx >= windowStart && idx < windowStart + 2;

              let fill = "#1e293b";
              let stroke = "#475569";
              let textFill = "#94a3b8";

              if (pkt.status === "acked") {
                fill = "#1e293b";
                stroke = "#334155";
                textFill = "#64748b";
              } else if (isSentUnacked) {
                fill = "#78350f";
                stroke = "#f59e0b";
                textFill = "#fef3c7";
              } else if (isInsideWindow) {
                fill = "#1e1b4b";
                stroke = "#6366f1";
                textFill = "#c7d2fe";
              }

              return (
                <g key={pkt.seq}>
                  <rect
                    x={xPos}
                    y={yPos}
                    width="60"
                    height="52"
                    rx="6"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                  />
                  <text
                    x={xPos + 30}
                    y={yPos + 22}
                    fill={textFill}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Seq #{pkt.seq}
                  </text>
                  <text
                    x={xPos + 30}
                    y={yPos + 40}
                    fill={textFill}
                    fontSize="8.5"
                    textAnchor="middle"
                  >
                    {pkt.status === "acked"
                      ? "ACKed"
                      : isSentUnacked
                      ? "In Flight"
                      : isInsideWindow
                      ? "Usable"
                      : "Blocked"}
                  </text>
                </g>
              );
            })}

            {/* Left pointer cursor: snd_una */}
            <g transform={`translate(${35 + windowStart * 70 + 30}, 125)`}>
              <polygon points="0,0 -5,8 5,8" fill="#38bdf8" />
              <line x1="0" y1="8" x2="0" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
              <text
                x="0"
                y="40"
                fill="#38bdf8"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                left (snd_una)
              </text>
            </g>

            {/* Right pointer cursor: snd_nxt */}
            <g
              transform={`translate(${
                35 + (windowStart + windowSize) * 70 - 40
              }, 125)`}
            >
              <polygon points="0,0 -5,8 5,8" fill="#818cf8" />
              <line x1="0" y1="8" x2="0" y2="28" stroke="#818cf8" strokeWidth="1.5" />
              <text
                x="0"
                y="40"
                fill="#818cf8"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                right (snd_wnd)
              </text>
            </g>
          </svg>
        </div>

        {/* Legend: TCP */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-800 border border-slate-700" />
            <span className="text-xs text-slate-400">Sent &amp; ACKed (Freed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-amber-500/30 border border-amber-500" />
            <span className="text-xs text-amber-300">Sent (UnACKed in flight)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-indigo-500/30 border border-indigo-500" />
            <span className="text-xs text-indigo-300">Usable (Can transmit now)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-900 border border-slate-800" />
            <span className="text-xs text-slate-500">Outside Window (Blocked)</span>
          </div>
        </div>
      </div>

      {/* DIAGRAM 2: Real-Time Stream Processing (Kafka/Flink Sliding Event-Time Window) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>
                2. Distributed Stream Processing: Sliding Event-Time Window (Kafka / Flink)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              15-minute sliding window sliding every 5 minutes. Active slice: [
              {streamBuckets[streamStart].timestamp} →{" "}
              {
                streamBuckets[
                  Math.min(
                    streamBuckets.length - 1,
                    streamStart + streamWindowSpan - 1
                  )
                ].timestamp
              }
              ]
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStepStreamForward}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Advance Time Hop (+5m)</span>
            </button>
            <button
              onClick={handleResetStream}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* SVG Visualization: Stream Processing */}
        <div className="overflow-x-auto py-4">
          <svg
            className="w-full min-w-[680px] h-48 select-none"
            viewBox="0 0 760 180"
          >
            <defs>
              <linearGradient
                id="streamWindowHighlight"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Timeline Stream Axis Line */}
            <line
              x1="30"
              y1="82"
              x2="730"
              y2="82"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Active Sliding Window Box overlay */}
            <rect
              x={40 + streamStart * 85}
              y="38"
              width={streamWindowSpan * 85}
              height="85"
              rx="8"
              fill="url(#streamWindowHighlight)"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Window Bracket & Label */}
            <text
              x={40 + streamStart * 85 + (streamWindowSpan * 85) / 2}
              y="26"
              fill="#10b981"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              Active Aggregation Window (RocksDB State: 15 min Span)
            </text>

            {/* Stream Event Buckets */}
            {streamBuckets.map((bucket, idx) => {
              const xPos = 45 + idx * 85;
              const yPos = 48;
              const isInsideWindow =
                idx >= streamStart && idx < streamStart + streamWindowSpan;
              const isEmitted = idx < streamStart;

              let fill = "#0f172a";
              let stroke = "#334155";
              let textFill = "#64748b";

              if (isEmitted) {
                fill = "#1e293b";
                stroke = "#475569";
                textFill = "#94a3b8";
              } else if (isInsideWindow) {
                fill = "#064e3b";
                stroke = "#10b981";
                textFill = "#a7f3d0";
              }

              return (
                <g key={bucket.timestamp}>
                  {/* Bucket Rect */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width="75"
                    height="62"
                    rx="6"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                  />
                  {/* Time label */}
                  <text
                    x={xPos + 37.5}
                    y={yPos + 18}
                    fill={textFill}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {bucket.timestamp}
                  </text>
                  {/* Event Count */}
                  <text
                    x={xPos + 37.5}
                    y={yPos + 36}
                    fill={textFill}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {bucket.eventsCount} events
                  </text>
                  {/* State badge */}
                  <text
                    x={xPos + 37.5}
                    y={yPos + 52}
                    fill={textFill}
                    fontSize="8.5"
                    textAnchor="middle"
                  >
                    {isEmitted
                      ? "Emitted"
                      : isInsideWindow
                      ? "Aggregating"
                      : "Pending"}
                  </text>
                </g>
              );
            })}

            {/* Watermark Threshold Marker */}
            <g transform={`translate(${45 + streamStart * 85}, 132)`}>
              <polygon points="0,0 -5,8 5,8" fill="#38bdf8" />
              <line x1="0" y1="8" x2="0" y2="22" stroke="#38bdf8" strokeWidth="1.5" />
              <text
                x="0"
                y="34"
                fill="#38bdf8"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                Watermark (Lateness Cutoff)
              </text>
            </g>

            {/* Current Event-Time Ingestion Front */}
            <g
              transform={`translate(${
                45 + (streamStart + streamWindowSpan) * 85
              }, 132)`}
            >
              <polygon points="0,0 -5,8 5,8" fill="#f59e0b" />
              <line x1="0" y1="8" x2="0" y2="22" stroke="#f59e0b" strokeWidth="1.5" />
              <text
                x="0"
                y="34"
                fill="#f59e0b"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                Ingestion Head (Current t)
              </text>
            </g>
          </svg>
        </div>

        {/* Legend: Stream Processing */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-800 border border-slate-700" />
            <span className="text-xs text-slate-400">Emitted / Evicted (Watermarked)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-500/30 border border-emerald-500" />
            <span className="text-xs text-emerald-300">Active State Window (In-Memory)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-sky-500/30 border border-sky-400" />
            <span className="text-xs text-sky-300">Watermark Boundary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-900 border border-slate-800" />
            <span className="text-xs text-slate-500">Pending Ingestion Queue</span>
          </div>
        </div>
      </div>

      {/* Systems Architecture Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-sky-400">
            <ShieldCheck className="h-5 w-5" />
            <h4 className="text-sm font-semibold text-slate-100">
              TCP Flow Control
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Without sliding windows, TCP would need Stop-and-Wait (sending 1
            packet and idling an entire RTT for an ACK). With sliding windows,
            the sender keeps the transmission pipe completely filled while
            respecting the receiver buffer size (<code>rwnd</code>).
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap className="h-5 w-5" />
            <h4 className="text-sm font-semibold text-slate-100">
              Real-Time Rate Limiting
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cloud gateways (Cloudflare, AWS WAF, Envoy) utilize sliding-log and
            sliding-window counters to throttle API requests. By tracking events
            in a moving time slice, burst attacks are flattened without the
            edge-reset vulnerabilities of fixed-window counters.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Layers className="h-5 w-5" />
            <h4 className="text-sm font-semibold text-slate-100">
              Stream Analytics (Flink/Kafka)
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Distributed engines process gigabytes per second by maintaining
            hopping and sliding state windows across unbounded streams. Stateful
            aggregations (e.g. 5-minute rolling average updated every 10s) map
            directly to two-pointer buffer reductions.
          </p>
        </div>
      </div>
    </div>
  );
};
