import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, Server, Settings, Wallet, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import './index.css';

// Components
import { LiveClock } from '@/components/ui/LiveClock';

// Pages
import { Overview } from '@/pages/Overview';
import { Positions } from '@/pages/Positions';
import { Strategies } from '@/pages/Strategies';
import { Wallets } from '@/pages/Wallets';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalTrades: 0, winRate: 0, openPositions: 0 });
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [pnlData, setPnlData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [newWalletLabel, setNewWalletLabel] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, posRes, candRes, setRes, pnlRes] = await Promise.all([
        fetch(`${API_BASE}/stats`).then(r => r.json()),
        fetch(`${API_BASE}/positions`).then(r => r.json()),
        fetch(`${API_BASE}/candidates`).then(r => r.json()),
        fetch(`${API_BASE}/settings`).then(r => r.json()),
        fetch(`${API_BASE}/pnl`).then(r => r.json()),
      ]);
      setStats(statsRes);
      setPositions(posRes || []);
      setCandidates(candRes || []);
      setStrategies(setRes.strategies || []);
      setPnlData(pnlRes.pnlData || []);
      const active = setRes.strategies?.find(s => s.enabled);
      if (active && !activeStrategy) setActiveStrategy(active);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, [activeTab]);

  const handleClosePosition = async (id) => {
    if (!window.confirm(`Close position #${id}?`)) return;
    try {
      await fetch(`${API_BASE}/positions/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual web close' }),
      });
      fetchData();
    } catch { alert('Failed to close position'); }
  };

  const handleSaveStrategy = async () => {
    if (!activeStrategy) return;
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId: activeStrategy.id, config: activeStrategy, isActive: true }),
      });
      alert('Strategy saved and activated!');
      fetchData();
    } catch { alert('Failed to save strategy'); }
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();
    if (!newWalletLabel || !newWalletAddress) return;
    try {
      await fetch(`${API_BASE}/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newWalletLabel, address: newWalletAddress }),
      });
      setNewWalletLabel('');
      setNewWalletAddress('');
      fetchData();
    } catch { alert('Failed to add wallet'); }
  };

  const handleDeleteWallet = async (label) => {
    if (!window.confirm(`Delete wallet ${label}?`)) return;
    try {
      await fetch(`${API_BASE}/wallets/${label}`, { method: 'DELETE' });
      fetchData();
    } catch { alert('Failed to delete wallet'); }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', Icon: BarChart2 },
    { id: 'positions', label: 'Positions', Icon: Target },
    { id: 'strategy', label: 'Strategies', Icon: Settings },
    { id: 'wallets', label: 'Wallets & PnL', Icon: Wallet },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <header className="h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-[100] bg-gradient-to-b from-[#0e1318fa] to-[#090c10f2] border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-brand-dim border border-brand/30 flex items-center justify-center text-brand shadow-accent">
            <Activity size={16} />
          </div>
          <span className="text-xl font-extrabold text-foreground tracking-tight">
            Char<span className="text-brand">on</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block"><LiveClock /></div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono tracking-wider uppercase bg-status-greenDim text-status-green border border-status-green/25">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
            Bot Active
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* SIDEBAR */}
        <aside className="fixed bottom-0 left-0 right-0 z-[100] md:sticky md:top-16 w-full md:w-[220px] bg-base md:border-r border-t md:border-t-0 border-white/5 md:px-3 md:py-6 h-14 md:h-[calc(100vh-64px)] flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
          <span className="hidden md:block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground px-3 mb-1 mt-2">Navigation</span>
          
          {navItems.map(({ id, label, Icon }) => (
            <div
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex md:flex-row flex-col items-center justify-center md:justify-start gap-1 md:gap-3 px-3 py-2 md:py-2.5 rounded-md cursor-pointer transition-all duration-150 text-muted-foreground text-[10px] md:text-sm font-semibold md:font-medium border border-transparent flex-1 md:flex-none relative",
                activeTab === id ? "text-brand bg-brand-dim border-brand/30" : "hover:text-foreground hover:bg-raised"
              )}
            >
              <Icon size={18} className={cn("shrink-0 transition-all duration-150", activeTab === id && "text-brand drop-shadow-[0_0_6px_rgba(0,255,170,1)]")} />
              <span>{label}</span>
              {id === 'positions' && stats.openPositions > 0 && (
                <span className="absolute md:static top-1 right-1 md:ml-auto font-mono text-[9px] md:text-[11px] bg-brand-dim text-brand px-1 md:px-1.5 py-0.5 rounded-full border border-brand/30">
                  {stats.openPositions}
                </span>
              )}
            </div>
          ))}

          <span className="hidden md:block text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground px-3 mb-1 mt-auto">System</span>
          <div className="hidden md:flex items-center gap-3 px-3.5 py-2.5 rounded-md text-muted-foreground text-sm font-medium">
            <Server size={16} className="shrink-0" />
            Server
            <span className="ml-auto font-mono text-[11px] bg-brand-dim text-brand px-1.5 py-0.5 rounded-full border border-brand/30">OK</span>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 min-w-0 overflow-x-hidden md:pb-8 pb-20">
          {activeTab === 'overview' && (
            <Overview stats={stats} candidates={candidates} lastRefresh={lastRefresh} fetchData={fetchData} />
          )}
          {activeTab === 'positions' && (
            <Positions positions={positions} handleClosePosition={handleClosePosition} />
          )}
          {activeTab === 'strategy' && (
            <Strategies strategies={strategies} activeStrategy={activeStrategy} setActiveStrategy={setActiveStrategy} handleSaveStrategy={handleSaveStrategy} />
          )}
          {activeTab === 'wallets' && (
            <Wallets 
              pnlData={pnlData} 
              newWalletLabel={newWalletLabel} 
              setNewWalletLabel={setNewWalletLabel} 
              newWalletAddress={newWalletAddress} 
              setNewWalletAddress={setNewWalletAddress} 
              handleAddWallet={handleAddWallet} 
              handleDeleteWallet={handleDeleteWallet} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;