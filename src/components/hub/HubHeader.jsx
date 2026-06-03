import React from "react";
import BrandIcon from "../brand/BrandIcon";

const HubHeader = ({ street, isDemo, eventCount = 0, boardCount = 0, neighborCount = 0 }) => (
  <header className="hub-header relative border-b border-white/10 overflow-hidden text-white">
    <div className="liquid-blob w-72 h-72 bg-violet-400/30 top-[-20%] right-[-5%] opacity-50" />
    <div className="liquid-blob w-48 h-48 bg-indigo-300/20 bottom-0 left-[-10%] opacity-40" />
    <div className="relative w-full max-w-6xl mx-auto px-5 lg:px-8 py-10 lg:py-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex gap-4 min-w-0">
          <div className="hub-header-mark shrink-0" aria-hidden>
            <BrandIcon name="block-mark" size={28} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`hub-status-pill ${
                  isDemo
                    ? "bg-white/12 text-white/95 border-white/25"
                    : "bg-emerald-400/15 text-emerald-50 border-emerald-400/35"
                }`}
              >
                {isDemo ? "Preview" : "Verified block"}
              </span>
              <span className="text-xs text-white/50 font-medium tracking-wide">
                BlockParty hub
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight truncate">
              {street?.name}
            </h1>
            <p className="text-indigo-200/90 text-sm mt-1 font-medium">
              {street?.city}, {street?.state}
            </p>
            <p className="text-slate-300/90 text-sm mt-4 max-w-lg leading-relaxed">
              Plan parties, chip in together, and coordinate on one private board for your street.
            </p>
          </div>
        </div>
        <div className="flex gap-5 sm:gap-6 shrink-0 sm:pt-1">
          <HubStat label="Events" value={String(eventCount)} />
          <HubStat label="Board" value={String(boardCount)} />
          <HubStat label="Neighbors" value={String(neighborCount)} />
        </div>
      </div>
    </div>
  </header>
);

const HubStat = ({ label, value }) => (
  <div className="text-center sm:text-right">
    <p className="text-[10px] uppercase tracking-widest text-white/45 font-semibold">{label}</p>
    <p className="text-sm font-semibold text-white/90 mt-0.5">{value}</p>
  </div>
);

export default HubHeader;
