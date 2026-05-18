import React from 'react';
import { 
  TrendingUp, TrendingDown, Crosshair, Activity, Zap, RefreshCw, 
  ChevronUp, ChevronDown, Minus, DollarSign, Wallet,
  ShieldCheck, AlertCircle, BarChart3, Clock, ArrowUpRight,
  Brain, Server, Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Overview({ stats, candidates, lastRefresh, fetchData, globalSettings, activeStrategy, positions, systemInfo }) {
  const closedPositions = positions?.filter(p => p.status === 'closed') || [];
  const recentTrades = closedPositions.slice(0, 8);
  const isLive = globalSettings.trading_mode === 'live' || globalSettings.trading_mode === 'confirm';
  
  const totalInvestedSol = closedPositions.reduce((acc, p) => acc + (Number(p.size_sol) || 0), 0);
  const totalPnLSol = closedPositions.reduce((acc, p) => acc + (Number(p.pnl_sol) || 0), 0);
  const totalPnL = totalInvestedSol > 0 ? (totalPnLSol / totalInvestedSol) * 100 : 0;

  const winners = closedPositions.filter(p => {
    const exit = Number(p.exit_price || 0);
    const entry = Number(p.entry_price || 0);
    return exit > entry;
  }).length;
  const losers = closedPositions.length - winners;

  const solPrice = stats.solPriceUsd || 170;
  const totalPnLUsd = totalPnLSol * solPrice;
  const liveUsd = stats.realWalletBalance ? (Number(stats.realWalletBalance) * solPrice).toFixed(2) : '0.00';
  const dryUsd = globalSettings.dry_run_wallet_balance !== 'off' 
    ? (Number(globalSettings.dry_run_wallet_balance) * solPrice).toFixed(2) 
    : null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── HEADER & BOT STATUS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            System Overview
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
            </div>
          </h1>
          <p className="text-[13px] text-zinc-500 font-mono mt-1">
            Command Center • Last Sync: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Agent: <span className={cn(globalSettings.agent_enabled ? "text-emerald-400" : "text-rose-400")}>
                {globalSettings.agent_enabled ? "ON" : "OFF"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm">
            <Activity size={14} className="text-sky-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              {globalSettings.trading_mode?.toUpperCase() || 'DRY_RUN'}
            </span>
          </div>
          {isLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm animate-fade-in">
              <Wallet size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Live Bal: <span className={cn(
                  "font-bold",
                  stats.realWalletBalance === undefined 
                    ? "text-zinc-500 animate-pulse" 
                    : stats.realWalletBalance === null 
                      ? "text-rose-400 font-bold" 
                      : "text-emerald-400 font-bold"
                )}>
                  {stats.realWalletBalance === undefined 
                    ? 'Loading...' 
                    : stats.realWalletBalance === null 
                      ? 'RPC Error' 
                      : `${Number(stats.realWalletBalance).toFixed(4)} SOL`}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm animate-fade-in">
              <Wallet size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Dry Bal: <span className="text-emerald-400 font-bold">{globalSettings.dry_run_wallet_balance === 'off' ? 'Unlimited' : `${Number(globalSettings.dry_run_wallet_balance).toFixed(4)} SOL`}</span>
              </span>
            </div>
          )}
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <RefreshCw size={14} /> Sync
          </button>
        </div>
      </div>

      {/* ── TOP METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Win Rate" 
          value={`${(stats.winRate || 0).toFixed(1)}%`}
          sub={
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider leading-none">
              <span className="text-emerald-400 font-bold">{winners}W</span>
              <span className="text-zinc-700">·</span>
              <span className="text-rose-400 font-bold">{losers}L</span>
              <span className="text-zinc-500 ml-1">accuracy</span>
            </span>
          }
          icon={TrendingUp}
          accent="emerald"
          delay="delay-[0ms]"
        />
        
        <MetricCard 
          label="Est. ROI" 
          value={`${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(1)}%`}
          sub={
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider leading-none">
              <span className={cn(
                "font-bold",
                totalPnLUsd >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {totalPnLUsd >= 0 ? '+' : ''}{totalPnLSol.toFixed(4)} SOL
              </span>
              <span className="text-zinc-700">·</span>
              <span className={cn(
                "font-bold",
                totalPnLUsd >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {totalPnLUsd >= 0 ? '+' : ''}${totalPnLUsd.toFixed(2)} USD
              </span>
            </span>
          }
          icon={BarChart3}
          accent={totalPnL >= 0 ? "emerald" : "rose"}
          delay="delay-[100ms]"
        />

        {isLive ? (
          <MetricCard 
            label="Live Balance" 
            value={
              stats.realWalletBalance === undefined 
                ? 'Loading...' 
                : stats.realWalletBalance === null 
                  ? 'RPC Error' 
                  : `${Number(stats.realWalletBalance).toFixed(4)} SOL`
            }
            sub={
              stats.realWalletBalance === undefined ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-pulse" />
                  Querying blockchain...
                </span>
              ) : stats.realWalletBalance === null ? (
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  RPC connection failed
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected · ${liveUsd} USD
                </span>
              )
            }
            icon={Wallet}
            accent={stats.realWalletBalance === null ? 'rose' : 'emerald'}
            delay="delay-[200ms]"
          />
        ) : (
          <MetricCard 
            label="SOL Balance" 
            value={globalSettings.dry_run_wallet_balance === 'off' ? 'Unlimited' : `${Number(globalSettings.dry_run_wallet_balance).toFixed(4)} SOL`}
            sub={
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                {dryUsd ? `Simulated · $${dryUsd} USD` : 'Simulated paper budget'}
              </span>
            }
            icon={Wallet}
            accent="sky"
            delay="delay-[200ms]"
          />
        )}

        <MetricCard 
          label="Positions" 
          value={stats.totalTrades || 0}
          sub={
            <span className="flex items-center gap-1.5">
              Active: <span className="text-amber-400 font-bold">{stats.openPositions || 0}</span>
            </span>
          }
          icon={Crosshair}
          accent="amber"
          delay="delay-[300ms]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: CANDIDATE STREAM ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20">
              <h2 className="text-[13px] font-bold text-zinc-100 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Live Candidate Stream
              </h2>
              <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono font-bold">
                {candidates.length} SIGNALS
              </div>
            </div>
            
            <div className="p-2 flex flex-col gap-1 max-h-[500px] overflow-y-auto custom-scrollbar">
              {candidates.length > 0 ? candidates.map((cand, i) => (
                <CandidateRow key={cand.id || i} cand={cand} />
              )) : (
                <div className="py-24 flex flex-col items-center gap-4 text-center">
                  <div className="relative">
                    <Zap size={40} className="text-zinc-800 animate-pulse" />
                    <div className="absolute inset-0 blur-xl bg-amber-500/10 rounded-full" />
                  </div>
                  <div className="font-mono text-[11px] text-zinc-600 uppercase tracking-widest">
                    Scanning market waves...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: STRATEGY & RECENT HISTORY ── */}
        <div className="flex flex-col gap-6">
          {/* Active Strategy Card */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group backdrop-blur-md">
            <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 rotate-12">
              <Brain size={120} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Brain size={16} />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">Current Strategy</span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-100 tracking-tight">{activeStrategy?.name || 'Manual'}</h3>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-zinc-500">Analysis Engine</span>
                <span className="text-zinc-300 font-mono font-bold">{activeStrategy?.use_llm ? 'Claude 3.5' : 'Rule-based'}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-zinc-500">Risk Profile</span>
                <span className="text-amber-400 font-mono font-bold">Aggressive</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%]" />
              </div>
            </div>
          </div>

          {/* API Connections & System Info Card */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Server size={16} />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">API Connection Status</span>
            </div>

            <div className="space-y-2.5">
              <ApiStatusRow label="Solana RPC" status={systemInfo?.solanaRpc} />
              <ApiStatusRow label="Jupiter Swap" status={systemInfo?.jupiterApi} />
              <ApiStatusRow label="GMGN Meme Api" status={systemInfo?.gmgnApi} />
              <ApiStatusRow label="LLM Claude Engine" status={systemInfo?.llmApi} />
              <ApiStatusRow label="Signal Server" status={systemInfo?.signalServer} />
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/60 flex flex-col gap-1.5 text-[9px] font-mono text-zinc-600">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-zinc-500">{systemInfo?.dbPath}</span>
              </div>
              <div className="flex justify-between">
                <span>Node Environment:</span>
                <span className="text-zinc-500">{systemInfo?.nodeVersion} ({systemInfo?.platform})</span>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/10 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-zinc-100 flex items-center gap-2">
                <Clock size={16} className="text-sky-400" />
                Recent Exits
              </h2>
              <ArrowUpRight size={14} className="text-zinc-600" />
            </div>
            <div className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              {recentTrades.length > 0 ? recentTrades.map((trade, i) => (
                <RecentTradeRow key={trade.id || i} trade={trade} />
              )) : (
                <div className="py-12 text-center text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
                  No trade history
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, accent, delay }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className={cn(
      "bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all duration-500 backdrop-blur-sm animate-fade-up",
      delay
    )}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</span>
        <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-lg", colors[accent])}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-display font-bold text-zinc-100 tracking-tighter leading-none">{value}</div>
        <div className="text-[11px] text-zinc-500 mt-3 font-mono flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-zinc-700" />
          {sub}
        </div>
      </div>
    </div>
  );
}

function CandidateRow({ cand }) {
  const sym = cand.candidate?.token?.symbol || 'UNK';
  const age = cand.candidate?.filters?.ageMin;
  const mcap = cand.candidate?.filters?.mcapUsd;
  const status = cand.status?.toLowerCase();
  
  return (
    <div className="flex items-center justify-between p-3 px-4 rounded-xl hover:bg-zinc-800/40 border border-transparent hover:border-zinc-800/50 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-[11px] text-zinc-400 font-bold group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-500">
            {sym.slice(0, 3)}
          </div>
          {status === 'buy' && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0e1318]" />
          )}
        </div>
        <div>
          <div className="font-bold text-zinc-100 text-[15px] tracking-tight group-hover:text-emerald-400 transition-colors">
            {sym}
          </div>
          <div className="font-mono text-[11px] text-zinc-500 flex gap-3 mt-1">
            {age != null && <span className="flex items-center gap-1"><Clock size={10} /> {age.toFixed(1)}m</span>}
            {mcap != null && <span>${(mcap / 1000).toFixed(0)}K</span>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={cn(
          "text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border",
          status === 'buy' ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : 
          status === 'candidate' ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
          "text-zinc-600 bg-zinc-800/50 border-zinc-700/50"
        )}>
          {status || 'watching'}
        </div>
      </div>
    </div>
  );
}

function RecentTradeRow({ trade }) {
  const pnl = trade.exit_price ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 : 0;
  const isWin = pnl > 0;

  return (
    <div className="flex items-center justify-between p-3 px-4 rounded-xl hover:bg-zinc-800/40 transition-all group border border-transparent hover:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-95",
          isWin ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          {isWin ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
        <div>
          <div className="text-[13px] font-bold text-zinc-100">{trade.symbol}</div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
            {new Date(trade.opened_at_ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className={cn(
        "text-[13px] font-mono font-bold px-2 py-1 rounded",
        isWin ? "text-emerald-400 bg-emerald-500/5" : "text-rose-400 bg-rose-500/5"
      )}>
        {isWin ? '+' : ''}{pnl.toFixed(1)}%
      </div>
    </div>
  );
}

function ApiStatusRow({ label, status }) {
  const isOk = status === 'Connected' || status === 'Active';
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-zinc-400 font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          isOk ? "bg-emerald-400 animate-pulse" : "bg-rose-500 animate-pulse"
        )} />
        <span className={cn(
          "font-mono font-bold uppercase text-[9px] tracking-wider",
          isOk ? "text-emerald-400" : "text-rose-500"
        )}>
          {status || 'Disconnected'}
        </span>
      </div>
    </div>
  );
}

