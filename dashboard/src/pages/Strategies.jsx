import React from 'react';
import { Settings, Target, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/Toggle';

export function Strategies({ strategies, activeStrategy, setActiveStrategy, handleSaveStrategy }) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Strategies</h1>
          <p className="text-[13px] text-muted-foreground font-mono mt-0.5">Configure and activate your trading strategy</p>
        </div>
        <button 
          onClick={handleSaveStrategy} 
          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-brand text-black border border-brand hover:bg-[#00e596] hover:shadow-[0_0_20px_rgba(0,255,170,0.35)] hover:-translate-y-[1px] transition-all font-bold text-sm"
        >
          <Save size={14} /> Save & Activate
        </button>
      </div>

      <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-6 shadow-card animate-fade-up">
        <div className="flex items-center justify-between mb-0">
          <h2 className="text-[15px] text-foreground font-bold flex items-center gap-2">
            <Settings size={16} className="text-brand" /> Select Strategy
          </h2>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-white/5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Available</span>
          <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {strategies.length > 0 ? strategies.map(strat => (
            <div
              key={strat.id}
              onClick={() => setActiveStrategy(strat)}
              className={cn(
                "p-4 rounded-xl border border-white/10 bg-raised cursor-pointer transition-all duration-150 relative overflow-hidden flex-1",
                activeStrategy?.id === strat.id ? "border-brand bg-brand-dim shadow-accent" : "hover:border-white/20 hover:bg-overlay"
              )}
            >
              {activeStrategy?.id === strat.id && <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand" />}
              <div className={cn("text-[15px] font-bold mb-1.5", activeStrategy?.id === strat.id ? "text-brand" : "text-foreground")}>
                {strat.name}
              </div>
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] border",
                strat.enabled ? "bg-status-greenDim text-status-green border-status-green/20" : "bg-status-blueDim text-status-blue border-status-blue/20"
              )}>
                {strat.enabled ? 'Running' : 'Idle'}
              </span>
            </div>
          )) : (
            <div className="w-full text-center text-muted-foreground p-12 font-mono text-[13px]">No strategies found</div>
          )}
        </div>
      </div>

      {activeStrategy && (
        <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-6 shadow-card animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] text-foreground font-bold flex items-center gap-2">
              <Target size={16} className="text-brand" /> {activeStrategy.name} — Parameters
            </h2>
          </div>

          {/* Position Sizing */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Position Sizing</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Position Size (SOL)</label>
              <input type="number" step="0.01" 
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                value={activeStrategy.position_size_sol || 0}
                onChange={e => setActiveStrategy({ ...activeStrategy, position_size_sol: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Max Open Positions</label>
              <input type="number" 
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                value={activeStrategy.max_open_positions || 0}
                onChange={e => setActiveStrategy({ ...activeStrategy, max_open_positions: Number(e.target.value) })} />
            </div>
          </div>

          {/* Risk Management */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Risk Management</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Take Profit (%)</label>
              <input type="number" 
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                value={activeStrategy.tp_percent || 0}
                onChange={e => setActiveStrategy({ ...activeStrategy, tp_percent: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Stop Loss (%)</label>
              <input type="number" 
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                value={activeStrategy.sl_percent || 0}
                onChange={e => setActiveStrategy({ ...activeStrategy, sl_percent: Number(e.target.value) })} />
            </div>
          </div>

          {/* Market Cap Filter */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Market Cap Filter</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Min MCap (USD)</label>
              <input type="number" 
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                value={activeStrategy.min_mcap_usd || 0}
                onChange={e => setActiveStrategy({ ...activeStrategy, min_mcap_usd: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Max MCap (USD)</label>
              <input type="number" 
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                value={activeStrategy.max_mcap_usd || 0}
                onChange={e => setActiveStrategy({ ...activeStrategy, max_mcap_usd: Number(e.target.value) })} />
            </div>
          </div>

          {/* AI Screening */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">AI Screening</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          <div className="flex flex-col gap-3">
            <Toggle
              checked={activeStrategy.use_llm || false}
              onChange={e => setActiveStrategy({ ...activeStrategy, use_llm: e.target.checked })}
              label="Use LLM for Screening"
              desc="AI-powered candidate evaluation"
            />
            {activeStrategy.use_llm && (
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">LLM Min Confidence (0–1)</label>
                <input type="number" step="0.01" min="0" max="1" 
                  className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                  value={activeStrategy.llm_min_confidence || 0}
                  onChange={e => setActiveStrategy({ ...activeStrategy, llm_min_confidence: Number(e.target.value) })} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
