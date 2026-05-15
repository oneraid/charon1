import React, { useState } from 'react';
import { BarChart2, ChevronUp, ChevronDown, Minus, Target, ExternalLink, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TokenAvatar } from '@/components/ui/TokenAvatar';
import { Toggle } from '@/components/ui/Toggle';
import { Settings2, Save, X } from 'lucide-react';

export const pnlColor = (v) => v > 0 ? 'text-status-green' : v < 0 ? 'text-status-red' : 'text-muted-foreground';
export const pnlIcon = (v) => v > 0 ? <ChevronUp size={14} /> : v < 0 ? <ChevronDown size={14} /> : <Minus size={14} />;

const formatTime = (ms) => {
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDuration = (start, end) => {
  if (!start) return '—';
  const diff = Math.max(0, (end || Date.now()) - start);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  const m2 = m % 60;
  if (h < 24) return `${h}h ${m2}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
};

export function Positions({ positions, handleClosePosition }) {
  const [filter, setFilter] = useState('open');
  const [editingRule, setEditingRule] = useState(null);
  const filteredPositions = positions.filter(p => p.status === filter);

  const handleUpdateRules = async (e) => {
    e.preventDefault();
    if (!editingRule) return;
    try {
      await fetch(`http://localhost:3000/api/positions/${editingRule.id}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tp_percent: Number(editingRule.tp_percent),
          sl_percent: Number(editingRule.sl_percent),
          trailing_enabled: Boolean(editingRule.trailing_enabled),
          trailing_percent: Number(editingRule.trailing_percent)
        }),
      });
      setEditingRule(null);
    } catch { alert('Failed to update rules'); }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Positions</h1>
          <p className="text-[13px] text-muted-foreground font-mono mt-0.5">Manage and monitor your trades</p>
        </div>
        <div className="flex bg-raised rounded-md p-1 border border-white/5 w-fit">
          <button 
            onClick={() => setFilter('open')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded transition-colors", filter === 'open' ? "bg-status-greenDim text-status-green" : "text-muted-foreground hover:text-foreground")}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('closed')}
            className={cn("px-4 py-1.5 text-xs font-semibold rounded transition-colors", filter === 'closed' ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Closed
          </button>
        </div>
      </div>

      <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-6 shadow-card transition-colors duration-200 hover:border-white/10 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center justify-start gap-6 mb-5">
          <h2 className="text-[15px] text-foreground font-bold flex items-center gap-2 shrink-0">
            <BarChart2 size={16} className="text-brand" /> {filter === 'open' ? 'Active Positions' : 'Closed Positions'}
          </h2>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Token</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Status</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Entry / Size</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Age</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">TP / SL / TS</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">PnL</th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.length > 0 ? filteredPositions.map((pos, i) => {
                const pnlPct = pos.pnl_percent != null 
                  ? pos.pnl_percent 
                  : pos.entry_mcap && pos.high_water_mcap
                    ? (pos.high_water_mcap / pos.entry_mcap - 1) * 100
                    : 0;
                return (
                  <tr key={pos.id || i} className="border-b border-white/5 transition-colors duration-100 hover:bg-white/5">
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <TokenAvatar symbol={pos.symbol} />
                        <div>
                          <div className="font-mono text-sm font-bold text-foreground">{pos.symbol || 'UNKNOWN'}</div>
                          <div className="flex items-center gap-2 mt-[2px]">
                            <a 
                              href={`https://gmgn.ai/sol/token/${pos.mint}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-brand transition-colors"
                              title="View on GMGN"
                            >
                              <ExternalLink size={12} />
                            </a>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(pos.mint);
                                alert('Contract Address copied!');
                              }}
                              className="text-muted-foreground hover:text-brand transition-colors"
                              title="Copy CA"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col items-start gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] whitespace-nowrap border",
                            pos.status === 'open' ? "bg-status-greenDim text-status-green border-status-green/20" : 
                            pos.status === 'closed' ? "bg-brand-dim text-brand border-brand/30" : 
                            "bg-status-yellowDim text-status-yellow border-status-yellow/20"
                          )}>
                            {pos.status || 'open'}
                          </span>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-[4px] font-mono text-[9px] font-bold uppercase tracking-widest border",
                            pos.execution_mode === 'live' ? "bg-brand-dim text-brand border-brand/30" : 
                            pos.execution_mode === 'confirm' ? "bg-status-yellowDim text-status-yellow border-status-yellow/20" :
                            "bg-white/5 text-muted-foreground border-white/10"
                          )}>
                            {pos.execution_mode ? pos.execution_mode.replace('_', ' ') : 'dry run'}
                          </span>
                        </div>
                        {pos.strategy_id && (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                            Strat: {pos.strategy_id.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-mono text-[13px] text-foreground">
                          {pos.entry_mcap ? `$${pos.entry_mcap > 1000000 ? (pos.entry_mcap / 1000000).toFixed(2) + 'M' : (pos.entry_mcap / 1000).toFixed(1) + 'K'}` : '—'}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {pos.size_sol ? `${pos.size_sol.toFixed(3)} SOL` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-mono text-[13px] text-foreground font-bold">
                          {formatDuration(pos.opened_at_ms, pos.closed_at_ms)}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatTime(pos.opened_at_ms)}
                          {pos.closed_at_ms && ` → ${formatTime(pos.closed_at_ms)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-mono text-[11px] text-foreground">
                            TP: <span className="text-status-green">+{pos.tp_percent}%</span> · SL: <span className="text-status-red">{pos.sl_percent}%</span>
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {pos.trailing_enabled ? `Trail: ${pos.trailing_percent}%` : 'Trail: off'}
                          </span>
                        </div>
                        {pos.status === 'open' && (
                          <button 
                            onClick={() => setEditingRule(pos)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 border bg-brand-dim text-brand border-brand/30 hover:bg-brand hover:text-black hover:-translate-y-[1px] shrink-0"
                            title="Edit TP/SL"
                          >
                            <Settings2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className={cn("px-4 py-3.5 align-middle font-mono text-[13px] flex items-center gap-1", pnlColor(pnlPct))}>
                      {pnlIcon(pnlPct)}
                      {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        {pos.status === 'open' ? (
                          <button 
                            onClick={() => handleClosePosition(pos.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-150 border bg-status-redDim text-status-red border-status-red/25 hover:bg-status-red hover:text-white hover:-translate-y-[1px]"
                            title="Close Position"
                          >
                            Close
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap bg-raised px-2 py-1 rounded-sm border border-white/5">
                            {pos.exit_reason ? pos.exit_reason.replace(/_/g, ' ') : 'Manual'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted-foreground font-mono text-[13px] py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Target size={28} className="opacity-30 text-brand" />
                      <span>No positions yet</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-white/10 rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Settings2 size={18} className="text-brand" /> Edit Rules #{editingRule.id}
              </h2>
              <button 
                onClick={() => setEditingRule(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateRules} className="p-4 md:p-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Take Profit (%)</label>
                  <input type="number" 
                    className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/10"
                    value={editingRule.tp_percent}
                    onChange={e => setEditingRule({ ...editingRule, tp_percent: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Stop Loss (%)</label>
                  <input type="number" 
                    className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/10"
                    value={editingRule.sl_percent}
                    onChange={e => setEditingRule({ ...editingRule, sl_percent: e.target.value })} />
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-raised p-4 rounded-lg border border-white/5">
                <Toggle
                  checked={editingRule.trailing_enabled}
                  onChange={e => setEditingRule({ ...editingRule, trailing_enabled: e.target.checked })}
                  label="Trailing Stop"
                  desc="Dynamically lock in profits"
                />
              </div>

              {editingRule.trailing_enabled && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Trailing Percent (%)</label>
                  <input type="number" 
                    className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/10"
                    value={editingRule.trailing_percent}
                    onChange={e => setEditingRule({ ...editingRule, trailing_percent: e.target.value })} />
                </div>
              )}
              
              <button type="submit" className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-brand text-black border border-brand hover:bg-[#00e596] hover:shadow-[0_0_20px_rgba(0,255,170,0.35)] transition-all font-bold text-sm">
                <Save size={16} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
