import React, { useState } from 'react';
import {
  BarChart2, ChevronUp, ChevronDown, Minus, Target, ExternalLink, Copy,
  Settings2, Save, X, TrendingUp, TrendingDown, Clock, Zap, Shield,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TokenAvatar } from '@/components/ui/TokenAvatar';
import { Toggle } from '@/components/ui/Toggle';

export const pnlColor = (v) =>
  v > 0 ? 'text-emerald-400' : v < 0 ? 'text-rose-400' : 'text-zinc-500';

export const pnlIcon = (v) =>
  v > 0 ? <ArrowUpRight size={14} /> : v < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />;

const formatTime = (ms) => {
  if (!ms) return '';
  const d = new Date(ms);
  const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return `${dateStr} ${timeStr}`;
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
  const d2 = Math.floor(h / 24);
  return `${d2}d ${h % 24}h`;
};

const formatMcap = (v) => {
  if (!v) return '—';
  return v > 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${(v / 1000).toFixed(1)}K`;
};

const formatPrice = (v) => {
  if (!v) return '—';
  if (v >= 1) return `$${Number(v).toFixed(2)}`;
  if (v >= 0.01) return `$${Number(v).toFixed(4)}`;
  return `$${Number(v).toFixed(8)}`;
};

// Compact PnL bar strip
function PnlBar({ value }) {
  const capped = Math.max(-100, Math.min(100, value));
  const isPos = capped >= 0;
  return (
    <div className="relative w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden">
      {isPos ? (
        <div
          className="absolute left-1/2 top-0 h-full rounded-full bg-emerald-400/80"
          style={{ width: `${(capped / 100) * 50}%` }}
        />
      ) : (
        <div
          className="absolute top-0 h-full rounded-full bg-rose-500/80"
          style={{ right: '50%', width: `${(Math.abs(capped) / 100) * 50}%` }}
        />
      )}
      <div className="absolute left-1/2 top-0 w-px h-full bg-zinc-600" />
    </div>
  );
}

// Status badge
function StatusBadge({ status, exitReason }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  }
  const label = exitReason ? exitReason.replace(/_/g, ' ') : 'Closed';
  const isTP = label.toLowerCase().includes('take') || label.toLowerCase().includes('profit') || label.toLowerCase().includes('tp');
  const isSL = label.toLowerCase().includes('stop') || label.toLowerCase().includes('loss') || label.toLowerCase().includes('sl');
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
      isTP ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : isSL ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
          : "bg-zinc-800 text-zinc-400 border-zinc-700"
    )}>
      {isTP ? <TrendingUp size={9} /> : isSL ? <TrendingDown size={9} /> : null}
      {label}
    </span>
  );
}

// Summary bar at top
function SummaryBar({ positions }) {
  const open = positions.filter(p => p.status === 'open');
  const closed = positions.filter(p => p.status === 'closed');
  const totalPnl = [...open, ...closed].reduce((acc, p) => acc + (p.pnl_percent || 0), 0);
  const winners = closed.filter(p => (p.pnl_percent || 0) > 0).length;
  const losers = closed.length - winners;
  const wr = closed.length ? ((winners / closed.length) * 100).toFixed(1) : '—';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {/* Positions Card */}
      <div className="relative overflow-hidden rounded-xl border px-5 py-4 bg-zinc-900/60 border-zinc-800 backdrop-blur-sm flex flex-col justify-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Positions</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-emerald-400" />
            <span className="text-[11px] font-mono text-zinc-400 mr-1">Active:</span>
            <span className="text-[14px] font-bold font-mono text-zinc-100">{open.length}</span>
          </div>
          <div className="flex items-center gap-2 border-t border-zinc-800/50 pt-2">
            <Clock size={12} className="text-zinc-500" />
            <span className="text-[11px] font-mono text-zinc-400 mr-1">Closed:</span>
            <span className="text-[14px] font-bold font-mono text-zinc-100">{closed.length}</span>
          </div>
        </div>
      </div>

      {/* Win Rate Card */}
      <div className="relative overflow-hidden rounded-xl border px-5 py-4 bg-zinc-900/60 border-zinc-800 backdrop-blur-sm flex flex-col justify-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Win Rate</div>
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold font-mono text-sky-400 leading-tight">
            {wr === '—' ? '—' : `${wr}%`}
          </span>
          {closed.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-emerald-400 font-bold">{winners}W</span>
              <span className="text-zinc-700">·</span>
              <span className="text-rose-400 font-bold">{losers}L</span>
            </div>
          )}
        </div>
      </div>

      {/* Total PnL Card */}
      <div className="relative overflow-hidden rounded-xl border px-5 py-4 bg-zinc-900/60 border-zinc-800 backdrop-blur-sm flex flex-col justify-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Total PnL</div>
        <div className={cn(
          "text-xl font-bold font-mono leading-tight",
          totalPnl > 0 ? "text-emerald-400" : totalPnl < 0 ? "text-rose-400" : "text-zinc-100"
        )}>
          {totalPnl > 0 ? '+' : ''}{totalPnl.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

export function Positions({ positions, handleClosePosition, stats }) {
  const [filter, setFilter] = useState('open');
  const [editingRule, setEditingRule] = useState(null);
  const [copied, setCopied] = useState(null);
  const filteredPositions = positions
    .filter(p => p.status === filter)
    .sort((a, b) => {
      if (filter === 'closed') {
        return (b.closed_at_ms || 0) - (a.closed_at_ms || 0);
      }
      return (b.opened_at_ms || 0) - (a.opened_at_ms || 0);
    });

  const handleCopy = (mint, id) => {
    navigator.clipboard.writeText(mint);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

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
          trailing_percent: Number(editingRule.trailing_percent),
        }),
      });
      setEditingRule(null);
    } catch { alert('Failed to update rules'); }
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Target size={20} className="text-emerald-400" />
            Positions
          </h1>
          <p className="text-[12px] text-zinc-500 font-mono mt-0.5">Real-time trade monitor · auto-refresh 5s</p>
        </div>
      </div>

      {/* ── Summary ── */}
      <SummaryBar positions={positions} />

      {/* Tab Toggle Outside */}
      <div className="flex items-center justify-start">
        <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 w-fit gap-1">
          {['open', 'closed'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "relative px-5 py-1.5 text-xs font-bold rounded-md transition-all duration-150 uppercase tracking-widest",
                filter === tab
                  ? tab === 'open'
                    ? "bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                    : "bg-zinc-800 text-zinc-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab === 'open' ? 'Active' : 'Closed'}
              {tab === 'open' && positions.filter(p => p.status === 'open').length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono">
                  {positions.filter(p => p.status === 'open').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/60">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              filter === 'open' ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
            )} />
            {filter === 'open' ? 'Active Positions' : 'Closed Positions'}
          </span>
          <span className="text-[11px] font-mono text-zinc-600">{filteredPositions.length} trade{filteredPositions.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {(filter === 'open'
                  ? ['Token', 'Mode', 'Entry', 'Size', 'Age', 'TP / SL', 'PnL', 'Action']
                  : ['Token', 'Mode', 'Entry', 'Size', 'Age', 'TP / SL', 'PnL', 'Status']
                ).map(col => (
                  <th key={col} className="px-4 py-2.5 text-left font-mono text-[9px] font-normal uppercase tracking-[0.15em] text-zinc-600 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPositions.length > 0 ? filteredPositions.map((pos, i) => {
                const pnlPct = pos.pnl_percent != null
                  ? pos.pnl_percent
                  : pos.entry_mcap && pos.high_water_mcap
                    ? (pos.high_water_mcap / pos.entry_mcap - 1) * 100
                    : 0;

                const pnlSol = pos.status === 'closed'
                  ? (pos.pnl_sol || 0)
                  : (pos.size_sol || 0) * (pnlPct / 100);
                const solPrice = stats?.solPriceUsd || 170;
                const pnlUsd = pnlSol * solPrice;

                return (
                  <tr
                    key={pos.id || i}
                    className={cn(
                      "border-b border-zinc-800/40 transition-all duration-100 group",
                      "hover:bg-zinc-800/30"
                    )}
                  >
                    {/* Token */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <TokenAvatar symbol={pos.symbol} />
                          {pos.status === 'open' && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-zinc-900" />
                          )}
                        </div>
                        <div>
                          <div className="font-mono text-[13px] font-bold text-zinc-100 leading-none">{pos.symbol || 'UNKNOWN'}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <a
                              href={`https://gmgn.ai/sol/token/${pos.mint}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-600 hover:text-sky-400 transition-colors"
                              title="View on GMGN"
                            >
                              <ExternalLink size={11} />
                            </a>
                            <button
                              onClick={() => handleCopy(pos.mint, pos.id)}
                              className={cn("transition-colors", copied === pos.id ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-300")}
                              title="Copy CA"
                            >
                              {copied === pos.id ? <span className="text-[9px] font-mono text-emerald-400">✓</span> : <Copy size={11} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Mode (Execution + Strategy) */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                          pos.execution_mode === 'live'
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
                            : pos.execution_mode === 'confirm'
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/50"
                              : "bg-zinc-800 text-zinc-100 border-zinc-700"
                        )}>
                          {pos.execution_mode ? pos.execution_mode.replace('_', ' ') : 'dry run'}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                          {pos.strategy_id ? pos.strategy_id.replace('_', ' ') : 'default'}
                        </span>
                      </div>
                    </td>

                    {/* Entry */}
                    <td className="px-4 py-3 align-middle">
                      <div className="font-mono text-[12px] text-zinc-200 font-semibold leading-none">
                        {formatMcap(pos.entry_mcap)}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 mt-1 leading-none">
                        {formatPrice(pos.entry_price)}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3 align-middle">
                      <div className="font-mono text-[12px] text-zinc-200 font-semibold leading-none">
                        {pos.size_sol ? `${pos.size_sol.toFixed(3)} SOL` : '—'}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 mt-1 leading-none">
                        {pos.size_sol ? `~$${(pos.size_sol * solPrice).toFixed(2)}` : '—'}
                      </div>
                    </td>

                    {/* Age */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1 font-mono text-[12px] text-zinc-300 font-semibold">
                        <Clock size={10} className="text-zinc-600 shrink-0" />
                        {formatDuration(pos.opened_at_ms, pos.closed_at_ms)}
                      </div>
                      <div className="flex flex-col font-mono text-[9px] text-zinc-600 mt-1 leading-relaxed">
                        <span className="flex items-center gap-1">
                          <span className="text-[8px] text-zinc-700">OPEN:</span> {formatTime(pos.opened_at_ms)}
                        </span>
                        {pos.status === 'closed' && (
                          <span className="flex items-center gap-1">
                            <span className="text-[8px] text-zinc-700">EXIT:</span> {formatTime(pos.closed_at_ms)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* TP / SL */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1 min-w-[80px]">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                              <TrendingUp size={9} />+{pos.tp_percent}%
                            </span>
                            <span className="text-zinc-700">·</span>
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-rose-400">
                              <TrendingDown size={9} />{pos.sl_percent}%
                            </span>
                          </div>
                          {pos.trailing_enabled && (
                            <span className="font-mono text-[9px] text-sky-400 flex items-center gap-1">
                              <Zap size={8} />Trail {pos.trailing_percent}%
                            </span>
                          )}
                        </div>
                        {pos.status === 'open' && (
                          <button
                            onClick={() => setEditingRule(pos)}
                            className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150 bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-emerald-500/40 hover:text-emerald-400 shrink-0"
                            title="Edit TP/SL"
                          >
                            <Settings2 size={11} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* PnL */}
                    <td className="px-4 py-3 align-middle">
                      <div className={cn("flex items-center gap-1 font-mono text-[13px] font-bold leading-none", pnlColor(pnlPct))}>
                        {pnlIcon(pnlPct)}
                        {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 mt-1 flex flex-col gap-0.5 leading-none">
                        <span className={cn(pnlSol > 0 ? 'text-emerald-500/80' : pnlSol < 0 ? 'text-rose-500/80' : 'text-zinc-500')}>
                          {pnlSol > 0 ? '+' : ''}{pnlSol.toFixed(4)} SOL
                        </span>
                        <span className="text-[9px] text-zinc-600">
                          {pnlUsd > 0 ? '+' : ''}${pnlUsd.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="mt-1.5 w-20">
                        <PnlBar value={pnlPct} />
                      </div>
                    </td>

                    {/* Action / Status (Closed) */}
                    <td className="px-4 py-3 align-middle">
                      {filter === 'open' ? (
                        <button
                          onClick={() => handleClosePosition(pos.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 border border-rose-500/25 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 hover:-translate-y-px active:translate-y-0"
                        >
                          <X size={11} /> Close
                        </button>
                      ) : (
                        <StatusBadge status={pos.status} exitReason={pos.exit_reason} />
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-zinc-700">
                      <Target size={32} strokeWidth={1} className="opacity-40" />
                      <span className="font-mono text-[12px] uppercase tracking-widest">
                        No {filter} positions
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Rule Modal ── */}
      {editingRule && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setEditingRule(null)}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
              <div>
                <h2 className="text-[14px] font-bold text-zinc-100 flex items-center gap-2">
                  <Shield size={15} className="text-emerald-400" />
                  Risk Rules
                </h2>
                <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                  #{editingRule.id} · {editingRule.symbol || 'Position'}
                </p>
              </div>
              <button
                onClick={() => setEditingRule(null)}
                className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleUpdateRules} className="p-5 flex flex-col gap-4">
              {/* TP / SL row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 flex items-center gap-1">
                    <TrendingUp size={9} /> Take Profit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-sm focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 pr-8"
                      value={editingRule.tp_percent}
                      onChange={e => setEditingRule({ ...editingRule, tp_percent: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-rose-400/80 flex items-center gap-1">
                    <TrendingDown size={9} /> Stop Loss
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-sm focus:border-rose-500/60 focus:outline-none focus:ring-2 focus:ring-rose-500/10 pr-8"
                      value={editingRule.sl_percent}
                      onChange={e => setEditingRule({ ...editingRule, sl_percent: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">%</span>
                  </div>
                </div>
              </div>

              {/* Trailing toggle */}
              <div className="flex items-center justify-between bg-zinc-800/40 px-4 py-3 rounded-xl border border-zinc-800">
                <div>
                  <div className="text-[12px] font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Zap size={12} className="text-sky-400" /> Trailing Stop
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Dinamis, lock in profits</div>
                </div>
                <Toggle
                  checked={editingRule.trailing_enabled}
                  onChange={e => setEditingRule({ ...editingRule, trailing_enabled: e.target.checked })}
                />
              </div>

              {editingRule.trailing_enabled && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-sky-400/80 flex items-center gap-1">
                    <Zap size={9} /> Trailing %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-3 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-sm focus:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/10 pr-8"
                      value={editingRule.trailing_percent}
                      onChange={e => setEditingRule({ ...editingRule, trailing_percent: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">%</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-[13px] hover:bg-emerald-400 transition-all duration-150 shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_28px_rgba(52,211,153,0.35)] active:scale-[0.98]"
              >
                <Save size={14} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}