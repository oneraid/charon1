import React, { useState, useEffect } from 'react';
import {
  Activity, TrendingUp, Crosshair, BarChart2, Server, Power,
  Settings, Wallet, Trash2, Save, Zap, Shield, Target,
  ChevronUp, ChevronDown, Minus, ArrowUpRight, Clock, RefreshCw
} from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:3000/api';

/* ───────────────────────────────────────────
   LIVE CLOCK
─────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="header-time">
      {time.toUTCString().slice(17, 25)} UTC
    </span>
  );
}

/* ───────────────────────────────────────────
   TOGGLE SWITCH
─────────────────────────────────────────── */
function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <div className="toggle-label">{label}</div>
        {desc && <div className="toggle-desc">{desc}</div>}
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="toggle-track" />
      </label>
    </div>
  );
}

/* ───────────────────────────────────────────
   TOKEN AVATAR (initials)
─────────────────────────────────────────── */
function TokenAvatar({ symbol }) {
  const s = (symbol || '??').slice(0, 3).toUpperCase();
  return <div className="token-avatar">{s}</div>;
}

/* ───────────────────────────────────────────
   MAIN APP
─────────────────────────────────────────── */
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

  const pnlColor = (v) => v > 0 ? 'trend-up' : v < 0 ? 'trend-down' : 'trend-neutral';
  const pnlIcon = (v) => v > 0 ? <ChevronUp size={14} /> : v < 0 ? <ChevronDown size={14} /> : <Minus size={14} />;

  /* ── NAV ITEMS ── */
  const navItems = [
    { id: 'overview', label: 'Overview', Icon: BarChart2 },
    { id: 'strategy', label: 'Strategies', Icon: Settings },
    { id: 'wallets', label: 'Wallets & PnL', Icon: Wallet },
  ];

  return (
    <div className="app-container">

      {/* ══════════════ HEADER ══════════════ */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo-icon">
            <Activity size={16} />
          </div>
          <span className="header-logo">Char<span>on</span></span>
        </div>

        <div className="header-right">
          <LiveClock />
          <div className="status-pill online">
            <span className="status-dot" />
            Bot Active
          </div>
        </div>
      </header>

      {/* ══════════════ BODY ══════════════ */}
      <div className="app-body">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <span className="sidebar-label">Navigation</span>
          {navItems.map(({ id, label, Icon }) => (
            <div
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
              style={{ position: 'relative' }}
            >
              <Icon size={18} className="nav-icon" />
              <span>{label}</span>
              {id === 'overview' && stats.openPositions > 0 && (
                <span className="nav-badge">{stats.openPositions}</span>
              )}
            </div>
          ))}

          <span className="sidebar-label" style={{ marginTop: 'auto' }}>System</span>
          <div className="nav-item">
            <Server size={16} className="nav-icon" />
            Server
            <span className="nav-badge" style={{ marginLeft: 'auto' }}>OK</span>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content">

          {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
          {activeTab === 'overview' && (
            <>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Overview</h1>
                  <p className="page-subtitle">
                    Live dashboard · auto-refresh 5s ·
                    last {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={fetchData}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {/* STATS */}
              <div className="stats-grid">
                <div
                  className="stat-card animate-in delay-1"
                  style={{ '--stat-color': 'var(--green)', '--stat-bg': 'var(--green-dim)' }}
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Win Rate</span>
                    <div className="stat-card-icon"><TrendingUp size={16} /></div>
                  </div>
                  <div className="stat-card-value">{(stats.winRate || 0).toFixed(1)}%</div>
                  <div className="stat-card-trend trend-up">
                    <ChevronUp size={14} /> Live tracking
                  </div>
                </div>

                <div
                  className="stat-card animate-in delay-2"
                  style={{ '--stat-color': 'var(--accent)', '--stat-bg': 'var(--accent-dim)' }}
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Total Trades</span>
                    <div className="stat-card-icon"><Crosshair size={16} /></div>
                  </div>
                  <div className="stat-card-value">{stats.totalTrades || 0}</div>
                  <div className="stat-card-trend trend-neutral">
                    <Minus size={14} /> All time
                  </div>
                </div>

                <div
                  className="stat-card animate-in delay-3"
                  style={{ '--stat-color': 'var(--yellow)', '--stat-bg': 'var(--yellow-dim)' }}
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">Open Positions</span>
                    <div className="stat-card-icon"><Activity size={16} /></div>
                  </div>
                  <div className="stat-card-value">{stats.openPositions || 0}</div>
                  <div className="stat-card-trend trend-neutral">
                    <Minus size={14} /> Right now
                  </div>
                </div>
              </div>

              {/* GRID */}
              <div className="dashboard-grid">
                {/* Positions table */}
                <div className="card animate-in delay-4">
                  <div className="card-header">
                    <h2 className="card-title">
                      <BarChart2 size={16} className="card-icon" />
                      Active &amp; Recent Positions
                    </h2>
                  </div>

                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Status</th>
                          <th>Entry Price</th>
                          <th>Size (SOL)</th>
                          <th>PnL</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.length > 0 ? positions.map((pos, i) => {
                          const pnlPct = pos.pnlPercent || 0;
                          return (
                            <tr key={pos.id || i}>
                              <td>
                                <div className="token-cell">
                                  <TokenAvatar symbol={pos.symbol} />
                                  <div>
                                    <div className="token-name">{pos.symbol || 'UNKNOWN'}</div>
                                    <div className="token-id">#{pos.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${pos.status === 'open' ? 'badge-success' : pos.status === 'closed' ? 'badge-primary' : 'badge-warning'}`}>
                                  {pos.status || 'open'}
                                </span>
                              </td>
                              <td className="mono">{pos.entryPrice ? `$${pos.entryPrice.toFixed(6)}` : '—'}</td>
                              <td className="mono">{pos.sizeSol ? pos.sizeSol.toFixed(3) : '—'}</td>
                              <td className={`mono ${pnlColor(pnlPct)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                {pnlIcon(pnlPct)}
                                {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                              </td>
                              <td>
                                {pos.status === 'open' && (
                                  <button className="btn btn-danger btn-sm" onClick={() => handleClosePosition(pos.id)}>
                                    Close
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="6">
                              <div className="empty-state">
                                <Target size={28} className="empty-state-icon" />
                                <span className="empty-state-text">No positions yet</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Candidate stream */}
                <div className="card animate-in delay-5" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header">
                    <h2 className="card-title">
                      <Zap size={16} className="card-icon" />
                      Candidate Stream
                    </h2>
                    <span className="badge badge-primary">{candidates.length}</span>
                  </div>

                  <div className="feed-list" style={{ overflowY: 'auto', maxHeight: 480, gap: '0.5rem' }}>
                    {candidates.length > 0 ? candidates.map((cand, i) => {
                      const sym = cand.candidate?.token?.symbol || 'UNK';
                      const age = cand.candidate?.filters?.ageMin;
                      const mcap = cand.candidate?.filters?.mcapUsd;
                      return (
                        <div className="feed-item" key={cand.id || i}>
                          <div className="feed-item-left">
                            <div className="feed-item-icon">{sym.slice(0, 3)}</div>
                            <div>
                              <div className="feed-item-symbol">{sym}</div>
                              <div className="feed-item-meta">
                                {age != null && <span>{age.toFixed(1)}m</span>}
                                {mcap != null && <span>${(mcap / 1000).toFixed(0)}K</span>}
                              </div>
                            </div>
                          </div>
                          <span className={`badge ${cand.status === 'buy' ? 'badge-success' : cand.status === 'candidate' ? 'badge-primary' : 'badge-error'}`}>
                            {cand.status}
                          </span>
                        </div>
                      );
                    }) : (
                      <div className="empty-state">
                        <Activity size={24} className="empty-state-icon" />
                        <span className="empty-state-text">Scanning for candidates…</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════ STRATEGY TAB ═══════════════ */}
          {activeTab === 'strategy' && (
            <>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Strategies</h1>
                  <p className="page-subtitle">Configure and activate your trading strategy</p>
                </div>
                <button className="btn btn-primary" onClick={handleSaveStrategy}>
                  <Save size={14} /> Save &amp; Activate
                </button>
              </div>

              <div className="card animate-in">
                <div className="card-header" style={{ marginBottom: 0 }}>
                  <h2 className="card-title"><Settings size={16} className="card-icon" /> Select Strategy</h2>
                </div>

                <div className="section-divider">
                  <div className="section-divider-line" />
                  <span className="section-divider-label">Available</span>
                  <div className="section-divider-line" />
                </div>

                <div className="strategy-grid">
                  {strategies.length > 0 ? strategies.map(strat => (
                    <div
                      key={strat.id}
                      className={`strategy-card ${activeStrategy?.id === strat.id ? 'active' : ''}`}
                      onClick={() => setActiveStrategy(strat)}
                    >
                      <div className="strategy-card-name">{strat.name}</div>
                      <span className={`badge ${strat.enabled ? 'badge-success' : 'badge-blue'}`}>
                        {strat.enabled ? 'Running' : 'Idle'}
                      </span>
                    </div>
                  )) : (
                    <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                      <span className="empty-state-text">No strategies found</span>
                    </div>
                  )}
                </div>
              </div>

              {activeStrategy && (
                <div className="card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">
                      <Target size={16} className="card-icon" />
                      {activeStrategy.name} — Parameters
                    </h2>
                  </div>

                  {/* Trade size / limits */}
                  <div className="section-divider">
                    <div className="section-divider-line" />
                    <span className="section-divider-label">Position Sizing</span>
                    <div className="section-divider-line" />
                  </div>
                  <div className="form-row" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Position Size (SOL)</label>
                      <input type="number" step="0.01" className="form-control"
                        value={activeStrategy.position_size_sol || 0}
                        onChange={e => setActiveStrategy({ ...activeStrategy, position_size_sol: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Open Positions</label>
                      <input type="number" className="form-control"
                        value={activeStrategy.max_open_positions || 0}
                        onChange={e => setActiveStrategy({ ...activeStrategy, max_open_positions: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* TP / SL */}
                  <div className="section-divider">
                    <div className="section-divider-line" />
                    <span className="section-divider-label">Risk Management</span>
                    <div className="section-divider-line" />
                  </div>
                  <div className="form-row" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Take Profit (%)</label>
                      <input type="number" className="form-control"
                        value={activeStrategy.tp_percent || 0}
                        onChange={e => setActiveStrategy({ ...activeStrategy, tp_percent: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stop Loss (%)</label>
                      <input type="number" className="form-control"
                        value={activeStrategy.sl_percent || 0}
                        onChange={e => setActiveStrategy({ ...activeStrategy, sl_percent: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* Market Cap filters */}
                  <div className="section-divider">
                    <div className="section-divider-line" />
                    <span className="section-divider-label">Market Cap Filter</span>
                    <div className="section-divider-line" />
                  </div>
                  <div className="form-row" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Min MCap (USD)</label>
                      <input type="number" className="form-control"
                        value={activeStrategy.min_mcap_usd || 0}
                        onChange={e => setActiveStrategy({ ...activeStrategy, min_mcap_usd: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max MCap (USD)</label>
                      <input type="number" className="form-control"
                        value={activeStrategy.max_mcap_usd || 0}
                        onChange={e => setActiveStrategy({ ...activeStrategy, max_mcap_usd: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* LLM */}
                  <div className="section-divider">
                    <div className="section-divider-line" />
                    <span className="section-divider-label">AI Screening</span>
                    <div className="section-divider-line" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Toggle
                      checked={activeStrategy.use_llm || false}
                      onChange={e => setActiveStrategy({ ...activeStrategy, use_llm: e.target.checked })}
                      label="Use LLM for Screening"
                      desc="AI-powered candidate evaluation"
                    />
                    {activeStrategy.use_llm && (
                      <div className="form-group" style={{ marginTop: '0.5rem' }}>
                        <label className="form-label">LLM Min Confidence (0–1)</label>
                        <input type="number" step="0.01" min="0" max="1" className="form-control"
                          value={activeStrategy.llm_min_confidence || 0}
                          onChange={e => setActiveStrategy({ ...activeStrategy, llm_min_confidence: Number(e.target.value) })} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════ WALLETS TAB ═══════════════ */}
          {activeTab === 'wallets' && (
            <>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Wallets &amp; PnL</h1>
                  <p className="page-subtitle">Track external wallets and analyse performance</p>
                </div>
              </div>

              <div className="dashboard-grid">
                {/* PnL Table */}
                <div className="card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">
                      <Wallet size={16} className="card-icon" />
                      Tracked Wallets
                    </h2>
                    <span className="badge badge-primary">{pnlData.length} wallets</span>
                  </div>

                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Label</th>
                          <th>Address</th>
                          <th>Win Rate</th>
                          <th>Total PnL</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pnlData.length > 0 ? pnlData.map(({ wallet, pnl }, i) => {
                          const pnlPct = pnl ? pnl.totalPnlPercent * 100 : null;
                          return (
                            <tr key={i}>
                              <td>
                                <div style={{ fontWeight: 700 }}>{wallet.label}</div>
                              </td>
                              <td>
                                <span className="address-pill">
                                  {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                                </span>
                              </td>
                              <td className="mono">
                                {pnl
                                  ? `${(pnl.winRate * 100).toFixed(1)}% (${pnl.wins}/${pnl.totalTrades})`
                                  : <span style={{ color: 'var(--text-muted)' }}>No data</span>}
                              </td>
                              <td className={`mono ${pnlPct != null ? pnlColor(pnlPct) : ''}`}>
                                {pnlPct != null ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    {pnlIcon(pnlPct)}
                                    {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                                  </span>
                                ) : '—'}
                              </td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteWallet(wallet.label)}>
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="5">
                              <div className="empty-state">
                                <Wallet size={24} className="empty-state-icon" />
                                <span className="empty-state-text">No wallets tracked yet</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add wallet */}
                <div className="card animate-in delay-2" style={{ height: 'fit-content' }}>
                  <div className="card-header">
                    <h2 className="card-title">
                      <Shield size={16} className="card-icon" />
                      Add Wallet
                    </h2>
                  </div>

                  <form onSubmit={handleAddWallet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Label (Name)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Smart Money #1"
                        value={newWalletLabel}
                        onChange={e => setNewWalletLabel(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Wallet Address (SOL)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="9HZjPCe…"
                        value={newWalletAddress}
                        onChange={e => setNewWalletAddress(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
                      <ArrowUpRight size={14} /> Add Wallet
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;