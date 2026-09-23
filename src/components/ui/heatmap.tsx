"use client";

import React, { useState } from "react";
import { HeatmapDayData } from "@/types";
import { formatMinutes } from "@/lib/utils";

interface HeatmapProps {
  data: HeatmapDayData[];
  onDayClick?: (day: HeatmapDayData) => void;
}

export const FocusHeatmap: React.FC<HeatmapProps> = ({ data, onDayClick }) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDayData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Group into Crimson Forge intensity colors
  const intensityColors = {
    0: "bg-[#0D0D0D] border-[#1F1F1F] hover:border-forge/40",
    1: "bg-[#FF2A4D]/20 border-[#FF2A4D]/40",
    2: "bg-[#FF2A4D]/45 border-[#FF2A4D]/60 shadow-[0_0_8px_rgba(255,42,77,0.3)]",
    3: "bg-[#FF2A4D]/75 border-[#FF2A4D]/85 shadow-[0_0_12px_rgba(255,42,77,0.5)]",
    4: "bg-[#FF2A4D] border-[#FFA0AE] shadow-[0_0_18px_rgba(255,42,77,0.85)]",
  };

  const handleMouseEnter = (day: HeatmapDayData, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setHoveredDay(day);
  };

  return (
    <div className="relative w-full">
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-flex flex-col gap-1.5 min-w-full">
          {/* Days Grid */}
          <div className="flex items-center gap-1.5">
            {data.map((day, idx) => (
              <div
                key={day.date}
                onClick={() => onDayClick?.(day)}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-4 h-4 rounded-[4px] border transition-all duration-150 cursor-pointer ${
                  intensityColors[day.intensity]
                }`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-txt-muted pt-3 border-t border-surface-border/40 mt-2">
            <span className="font-mono">Last 60 Days Verified Activity</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-3 h-3 rounded-[3px] bg-[#0D0D0D] border border-[#1F1F1F]" />
              <div className="w-3 h-3 rounded-[3px] bg-[#FF2A4D]/20 border border-[#FF2A4D]/40" />
              <div className="w-3 h-3 rounded-[3px] bg-[#FF2A4D]/45 border border-[#FF2A4D]/60" />
              <div className="w-3 h-3 rounded-[3px] bg-[#FF2A4D]/75 border border-[#FF2A4D]/85" />
              <div className="w-3 h-3 rounded-[3px] bg-[#FF2A4D] border border-[#FFA0AE]" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: "fixed",
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className="bg-surface-card/95 backdrop-blur-md border border-forge/40 p-3 rounded-xl shadow-glow text-xs text-txt-primary w-48 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="font-semibold text-txt-primary border-b border-surface-border/60 pb-1.5 mb-1.5 flex justify-between">
            <span>{new Date(hoveredDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="text-forge font-mono font-bold">{formatMinutes(hoveredDay.minutes)}</span>
          </div>

          <div className="space-y-1">
            <div className="text-txt-secondary flex justify-between">
              <span>Sessions:</span>
              <span className="text-txt-primary font-mono">{hoveredDay.sessionsCount}</span>
            </div>

            {hoveredDay.subjects && hoveredDay.subjects.length > 0 && (
              <div className="pt-1.5 border-t border-surface-border/40 space-y-1">
                <span className="text-[10px] uppercase text-txt-muted tracking-wider">Breakdown</span>
                {hoveredDay.subjects.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sub.color || "#FF2A4D" }} />
                      <span className="truncate max-w-[90px]">{sub.name}</span>
                    </div>
                    <span className="font-mono text-txt-secondary">{formatMinutes(sub.minutes)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
