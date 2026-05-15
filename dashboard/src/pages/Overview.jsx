import React from 'react';
import { TrendingUp, Crosshair, Activity, Zap, RefreshCw, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Overview({ stats, candidates, lastRefresh, fetchData }) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Overview</h1>
          <p className="text-[13px] text-muted-foreground font-mono mt-0.5">
            Live dashboard · auto-refresh 5s · last {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-raised text-foreground border border-white/10 hover:bg-overlay hover:border-white/20 transition-all font-semibold text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-5 flex flex-col gap-3.5 relative overflow-hidden transition-all duration-200 hover:border-white/10 hover:-translate-y-[1px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] animate-fade-up [animation-delay:50ms] col-span-1">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-status-green to-transparent opacity-70" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Win Rate</span>
            <div className="w-8 h-8 rounded bg-status-greenDim text-status-green flex items-center justify-center"><TrendingUp size={16} /></div>
          </div>
          <div className="font-display text-3xl md:text-4xl font-extrabold text-foreground leading-none tracking-tight">
            {(stats.winRate || 0).toFixed(1)}%
          </div>
          <div className="font-mono text-xs flex items-center gap-1 text-status-green">
            <ChevronUp size={14} /> Live tracking
          </div>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-5 flex flex-col gap-3.5 relative overflow-hidden transition-all duration-200 hover:border-white/10 hover:-translate-y-[1px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] animate-fade-up [animation-delay:100ms] col-span-1">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-70" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Total Trades</span>
            <div className="w-8 h-8 rounded bg-brand-dim text-brand flex items-center justify-center"><Crosshair size={16} /></div>
          </div>
          <div className="font-display text-3xl md:text-4xl font-extrabold text-foreground leading-none tracking-tight">
            {stats.totalTrades || 0}
          </div>
          <div className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
            <Minus size={14} /> All time
          </div>
        </div>

        <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-5 flex flex-col gap-3.5 relative overflow-hidden transition-all duration-200 hover:border-white/10 hover:-translate-y-[1px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] animate-fade-up [animation-delay:150ms] col-span-2 md:col-span-1">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-status-yellow to-transparent opacity-70" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Open Positions</span>
            <div className="w-8 h-8 rounded bg-status-yellowDim text-status-yellow flex items-center justify-center"><Activity size={16} /></div>
          </div>
          <div className="font-display text-3xl md:text-4xl font-extrabold text-foreground leading-none tracking-tight">
            {stats.openPositions || 0}
          </div>
          <div className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
            <Minus size={14} /> Right now
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-5">
        {/* Candidate stream */}
        <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-6 shadow-card flex flex-col animate-fade-up [animation-delay:200ms]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] text-foreground font-bold flex items-center gap-2">
              <Zap size={16} className="text-brand" /> Candidate Stream
            </h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] bg-brand-dim text-brand border border-brand/30">
              {candidates.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] md:max-h-[480px]">
            {candidates.length > 0 ? candidates.map((cand, i) => {
              const sym = cand.candidate?.token?.symbol || 'UNK';
              const age = cand.candidate?.filters?.ageMin;
              const mcap = cand.candidate?.filters?.mcapUsd;
              return (
                <div key={cand.id || i} className="flex items-center justify-between p-3 px-4 rounded-md bg-raised border border-white/5 transition-all duration-150 hover:bg-overlay hover:border-white/10 cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-brand-dim border border-brand/30 flex items-center justify-center font-mono text-[10px] text-brand font-bold shrink-0">
                      {sym.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-mono text-[14px] font-bold text-foreground">{sym}</div>
                      <div className="font-mono text-[12px] text-muted-foreground flex gap-3 mt-[2px]">
                        {age != null && <span>{age.toFixed(1)}m</span>}
                        {mcap != null && <span>${(mcap / 1000).toFixed(0)}K</span>}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] border",
                    cand.status === 'buy' ? "bg-status-greenDim text-status-green border-status-green/20" : 
                    cand.status === 'candidate' ? "bg-brand-dim text-brand border-brand/30" : 
                    "bg-status-redDim text-status-red border-status-red/20"
                  )}>
                    {cand.status}
                  </span>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground font-mono text-[13px]">
                <Activity size={24} className="opacity-30 text-brand" />
                <span>Scanning for candidates…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
