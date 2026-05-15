import React, { useState, useEffect, useRef } from 'react';
import { Activity, BarChart2, Server, Settings, Wallet, Target, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import './index.css';

// Components
import { LiveClock } from '@/components/ui/LiveClock';

// Pages
import { Overview } from '@/pages/Overview';
import { Positions } from '@/pages/Positions';
import { Settings as SettingsPage } from './pages/Settings';
import { Wallets } from '@/pages/Wallets';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalTrades: 0, winRate: 0, openPositions: 0 });
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [globalSettings, setGlobalSettings] = useState({ 
    trading_mode: 'dry_run', 
    agent_enabled: true,
    override_tpsl_enabled: false,
    default_tp_percent: 50,
    default_sl_percent: -25,
    default_trailing_percent: 20,
    default_trailing_enabled: true
  });
  const [pnlData, setPnlData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedStrategyRef = useRef(null);
  const lastSavedGlobalRef = useRef(null);

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
      const currentGlobal = setRes.global || { 
        trading_mode: 'dry_run', 
        agent_enabled: true,
        override_tpsl_enabled: false,
        default_tp_percent: 50,
        default_sl_percent: -25,
        default_trailing_percent: 20,
        default_trailing_enabled: true
      };

      // Baseline for global
      if (!lastSavedGlobalRef.current) {
        lastSavedGlobalRef.current = JSON.stringify(currentGlobal);
      }

      // ONLY update global if no pending edits
      if (JSON.stringify(globalSettings) === lastSavedGlobalRef.current) {
        setGlobalSettings(currentGlobal);
        lastSavedGlobalRef.current = JSON.stringify(currentGlobal);
      }

      // ONLY update strategy if no pending edits
      if (active && (!activeStrategy || JSON.stringify(activeStrategy) === lastSavedStrategyRef.current)) {
        setActiveStrategy(active);
        lastSavedStrategyRef.current = JSON.stringify(active);
      }
      
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

  // Auto-save Global Settings
  useEffect(() => {
    const current = JSON.stringify(globalSettings);
    if (current === lastSavedGlobalRef.current) return;

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true);
        await fetch(`${API_BASE}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ global: globalSettings }),
        });
        lastSavedGlobalRef.current = current;
        setTimeout(() => setIsSaving(false), 1500);
      } catch (err) {
        console.error('Global save error:', err);
        setIsSaving(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [globalSettings]);

  // Auto-save Strategy Changes (Parameters only)
  useEffect(() => {
    if (!activeStrategy) return;
    
    // Only save if parameters changed, not the enabled status
    // We compare a version without the 'enabled' field
    const { enabled: _, ...params } = activeStrategy;
    const currentParams = JSON.stringify(params);
    
    if (lastSavedStrategyRef.current === currentParams) return;

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true);
        await fetch(`${API_BASE}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            strategyId: activeStrategy.id, 
            config: activeStrategy,
            // Don't send isActive here to avoid collision with handleToggleStrategy
          }),
        });
        lastSavedStrategyRef.current = currentParams;
        setTimeout(() => setIsSaving(false), 1500);
      } catch (err) {
        console.error('Strategy save error:', err);
        setIsSaving(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeStrategy]);

  // Handler to switch strategy view without triggering auto-save
  const handleSelectStrategy = (strat) => {
    const { enabled: _, ...params } = strat;
    lastSavedStrategyRef.current = JSON.stringify(params);
    setActiveStrategy(strat);
  };

  const handleToggleStrategy = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      console.log(`[UI] Toggling strategy ${id} to ${newStatus}`);

      // OPTIMISTIC UI: Update the local strategies list immediately
      setStrategies(prev => prev.map(s => ({
        ...s,
        enabled: s.id === id ? newStatus : (newStatus ? false : s.enabled)
      })));

      // If we are viewing this strategy, update its active view state too
      if (activeStrategy?.id === id) {
        setActiveStrategy(prev => ({ ...prev, enabled: newStatus }));
      }

      // Send to server
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          strategyId: id, 
          isActive: newStatus 
        }),
      });
      
      // Give server time to update, then refresh
      setTimeout(fetchData, 800);
    } catch (err) {
      console.error('Toggle error:', err);
      fetchData(); 
    }
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
    { id: 'settings', label: 'Settings', Icon: Settings },
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
            <Overview 
              stats={stats} 
              candidates={candidates} 
              lastRefresh={lastRefresh} 
              fetchData={fetchData} 
              globalSettings={globalSettings}
              activeStrategy={activeStrategy}
              positions={positions}
            />
          )}
          {activeTab === 'positions' && (
            <Positions positions={positions} handleClosePosition={handleClosePosition} />
          )}
          {activeTab === 'settings' && (
            <SettingsPage 
              strategies={strategies} 
              activeStrategy={activeStrategy} 
              setActiveStrategy={handleSelectStrategy} 
              globalSettings={globalSettings}
              setGlobalSettings={setGlobalSettings}
              handleToggleStrategy={handleToggleStrategy}
            />
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

      {/* Auto-save Notification */}
      <div className={cn(
        "fixed bottom-6 right-6 z-[200] transition-all duration-500 transform",
        isSaving ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-900 border border-brand/30 text-brand shadow-[0_8px_32px_rgba(0,255,170,0.15)] backdrop-blur-md">
          <CheckCircle2 size={18} className="animate-bounce" />
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-tight">Configuration Saved</span>
            <span className="text-[10px] text-zinc-500 font-mono">Strategy auto-updated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;