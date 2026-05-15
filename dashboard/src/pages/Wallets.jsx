import React from 'react';
import { Wallet, Trash2, Shield, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pnlColor, pnlIcon } from './Positions';

export function Wallets({ pnlData, newWalletLabel, setNewWalletLabel, newWalletAddress, setNewWalletAddress, handleAddWallet, handleDeleteWallet }) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Wallets & PnL</h1>
          <p className="text-[13px] text-muted-foreground font-mono mt-0.5">Track external wallets and analyse performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        {/* PnL Table */}
        <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-6 shadow-card animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] text-foreground font-bold flex items-center gap-2">
              <Wallet size={16} className="text-brand" /> Tracked Wallets
            </h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] bg-brand-dim text-brand border border-brand/30">
              {pnlData.length} wallets
            </span>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Label</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Address</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Win Rate</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap">Total PnL</th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                {pnlData.length > 0 ? pnlData.map(({ wallet, pnl }, i) => {
                  const pnlPct = pnl ? pnl.totalPnlPercent * 100 : null;
                  return (
                    <tr key={i} className="border-b border-white/5 transition-colors duration-100 hover:bg-white/5">
                      <td className="px-4 py-3.5 align-middle font-bold">{wallet.label}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-mono text-xs text-muted-foreground bg-raised px-2 py-1 rounded-sm border border-white/5">
                          {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle font-mono text-[13px]">
                        {pnl ? `${(pnl.winRate * 100).toFixed(1)}% (${pnl.wins}/${pnl.totalTrades})` : <span className="text-muted-foreground">No data</span>}
                      </td>
                      <td className={cn("px-4 py-3.5 align-middle font-mono text-[13px]", pnlPct != null ? pnlColor(pnlPct) : '')}>
                        {pnlPct != null ? (
                          <span className="flex items-center gap-1">
                            {pnlIcon(pnlPct)}
                            {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <button 
                          onClick={() => handleDeleteWallet(wallet.label)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 border bg-status-redDim text-status-red border-status-red/25 hover:bg-status-red hover:text-white hover:-translate-y-[1px]"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted-foreground font-mono text-[13px] py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Wallet size={24} className="opacity-30 text-brand" />
                        <span>No wallets tracked yet</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add wallet */}
        <div className="bg-surface border border-white/10 rounded-xl p-4 md:p-6 shadow-card h-fit animate-fade-up [animation-delay:100ms]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] text-foreground font-bold flex items-center gap-2">
              <Shield size={16} className="text-brand" /> Add Wallet
            </h2>
          </div>

          <form onSubmit={handleAddWallet} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Label (Name)</label>
              <input
                type="text"
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                placeholder="e.g. Smart Money #1"
                value={newWalletLabel}
                onChange={e => setNewWalletLabel(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em]">Wallet Address (SOL)</label>
              <input
                type="text"
                className="px-3.5 py-2.5 bg-raised border border-white/10 rounded-md text-foreground font-mono text-sm transition-all focus:border-brand focus:bg-overlay focus:outline-none focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted"
                placeholder="9HZjPCe…"
                value={newWalletAddress}
                onChange={e => setNewWalletAddress(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="mt-1 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-brand text-black border border-brand hover:bg-[#00e596] hover:shadow-[0_0_20px_rgba(0,255,170,0.35)] hover:-translate-y-[1px] transition-all font-bold text-sm">
              <ArrowUpRight size={14} /> Add Wallet
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
