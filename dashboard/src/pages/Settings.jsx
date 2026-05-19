import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Target, Activity, Server, Shield,
  TrendingUp, TrendingDown, BarChart2, Users, Zap, Brain,
  ChevronDown, ChevronRight, AlertTriangle, DollarSign,
  Clock, Filter, Layers, Eye, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/Toggle';

// ── Reusable primitives ──────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, accent = 'brand', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const accentMap = {
    brand: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sky: 'text-sky-400    bg-sky-500/10    border-sky-500/20',
    amber: 'text-amber-400  bg-amber-500/10  border-amber-500/20',
    rose: 'text-rose-400   bg-rose-500/10   border-rose-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    zinc: 'text-zinc-400   bg-zinc-800      border-zinc-700',
  };
  const bar = {
    brand: 'bg-emerald-500', sky: 'bg-sky-500', amber: 'bg-amber-500',
    rose: 'bg-rose-500', violet: 'bg-violet-500', zinc: 'bg-zinc-600',
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.3)]">
      {/* top accent line */}
      <div className={cn("h-[2px] w-full", bar[accent])} />
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/30 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg border", accentMap[accent])}>
            <Icon size={15} />
          </div>
          <span className="text-[13px] font-bold text-zinc-100 tracking-tight">{title}</span>
        </div>
        {open
          ? <ChevronDown size={15} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          : <ChevronRight size={15} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</label>
        {hint && <span className="text-[9px] font-mono text-zinc-700">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, step = 1, suffix, prefix, accent = 'emerald', min, max }) {
  const ring = {
    emerald: 'focus:border-emerald-500/60 focus:ring-emerald-500/10',
    sky: 'focus:border-sky-500/60     focus:ring-sky-500/10',
    amber: 'focus:border-amber-500/60   focus:ring-amber-500/10',
    rose: 'focus:border-rose-500/60    focus:ring-rose-500/10',
    violet: 'focus:border-violet-500/60  focus:ring-violet-500/10',
  };
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-zinc-500 font-mono text-[11px] pointer-events-none select-none">{prefix}</span>
      )}
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full bg-zinc-800/60 border border-zinc-700 rounded-lg font-mono text-[13px] text-zinc-100",
          "py-2.5 focus:outline-none focus:ring-2 transition-all",
          ring[accent],
          prefix ? "pl-7 pr-3" : suffix ? "pl-3 pr-8" : "px-3"
        )}
      />
      {suffix && (
        <span className="absolute right-3 text-zinc-600 font-mono text-[11px] pointer-events-none select-none">{suffix}</span>
      )}
    </div>
  );
}

function ToggleCard({ checked, onChange, label, desc, accent = 'emerald', children }) {
  const bg = {
    emerald: checked ? 'border-emerald-500/25 bg-emerald-500/5' : '',
    sky: checked ? 'border-sky-500/25     bg-sky-500/5' : '',
    violet: checked ? 'border-violet-500/25  bg-violet-500/5' : '',
    rose: checked ? 'border-rose-500/25    bg-rose-500/5' : '',
  };
  return (
    <div className={cn(
      "rounded-xl border border-zinc-800 bg-zinc-800/20 p-4 transition-all duration-200",
      bg[accent]
    )}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] font-semibold text-zinc-200">{label}</div>
          {desc && <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{desc}</div>}
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {checked && children && (
        <div className="mt-4 pt-4 border-t border-zinc-700/50 flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div className={cn(
      "grid gap-4",
      cols === 2 && "grid-cols-1 md:grid-cols-2",
      cols === 3 && "grid-cols-1 md:grid-cols-3",
      cols === 4 && "grid-cols-2 md:grid-cols-4",
    )}>
      {children}
    </div>
  );
}

// ── Strategy selector card ───────────────────────────────────────────────────

function StratCard({ strat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative text-left rounded-xl border p-4 transition-all duration-150 overflow-hidden group",
        active
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_20px_rgba(52,211,153,0.08)]"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/30"
      )}
    >
      {active && <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />}
      <div className={cn("text-[13px] font-bold leading-snug mb-1", active ? "text-emerald-400" : "text-zinc-200 group-hover:text-zinc-100")}>
        {strat.name}
      </div>
      <div className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-3">{strat.id}</div>
      <div className="flex items-center gap-2">
        {strat.enabled ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700 text-[9px] font-bold uppercase tracking-widest">
            Idle
          </span>
        )}
      </div>
    </button>
  );
}

// ── Mode selector ────────────────────────────────────────────────────────────

const MODES = [
  { id: 'dry_run', label: 'Dry Run', desc: 'Simulating — no real SOL', color: 'sky', icon: Eye },
  { id: 'confirm', label: 'Confirm', desc: 'Telegram approval needed', color: 'amber', icon: AlertTriangle },
  { id: 'live', label: 'Live', desc: '⚠️ Real SOL execution', color: 'rose', icon: Zap },
];

function ModeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MODES.map(({ id, label, desc, color, icon: Icon }) => {
        const active = value === id;
        const styles = {
          sky: active ? 'border-sky-500/50   bg-sky-500/10   text-sky-400' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700',
          amber: active ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700',
          rose: active ? 'border-rose-500/50  bg-rose-500/10  text-rose-400' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700',
        };
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all duration-150 text-center",
              styles[color]
            )}
          >
            <Icon size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{label}</span>
            <span className="text-[9px] font-mono opacity-70 leading-tight">{desc}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function Settings({ strategies, activeStrategy, setActiveStrategy, globalSettings, setGlobalSettings, handleToggleStrategy, handleResetDatabase }) {
  const s = activeStrategy;
  const upd = (key, val) => setActiveStrategy(prev => ({ ...prev, [key]: val }));

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <SettingsIcon size={20} className="text-emerald-400" />
            Settings
          </h1>
          <p className="text-[12px] text-zinc-500 font-mono mt-0.5">Bot configuration · changes auto-save</p>
        </div>
        {/* Bot agent pill */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all",
          globalSettings.agent_enabled
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
            : "bg-zinc-800/60 border-zinc-700 text-zinc-400"
        )}>
          <Server size={14} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Bot Agent</span>
          <Toggle
            checked={globalSettings.agent_enabled}
            onChange={e => setGlobalSettings({ ...globalSettings, agent_enabled: e.target.checked })}
          />
          <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest",
            globalSettings.agent_enabled ? "text-emerald-400" : "text-zinc-600"
          )}>
            {globalSettings.agent_enabled ? "Running" : "Stopped"}
          </span>
        </div>
      </div>

      {/* ── Trading Mode ── */}
      <SectionCard icon={Activity} title="Trading Mode" accent="sky" defaultOpen={true}>
        <div className="flex flex-col gap-4">
          <ModeSelector
            value={globalSettings.trading_mode}
            onChange={mode => setGlobalSettings({ ...globalSettings, trading_mode: mode })}
          />
          
          {globalSettings.trading_mode === 'dry_run' && (
            <div className="mt-2 pt-4 border-t border-zinc-800 flex flex-col gap-3">
              <ToggleCard
                checked={globalSettings.dry_run_wallet_balance !== 'off'}
                onChange={e => {
                  const newBalance = e.target.checked ? '1.0' : 'off';
                  setGlobalSettings({ ...globalSettings, dry_run_wallet_balance: newBalance });
                }}
                label="Simulated SOL Balance"
                desc="Limit trading bot by simulated budget"
                accent="sky"
              >
                <Field label="Simulated Balance" hint="budget in SOL">
                  <NumberInput
                    value={globalSettings.dry_run_wallet_balance === 'off' ? 0.0 : Number(globalSettings.dry_run_wallet_balance)}
                    step={0.1}
                    min={0}
                    suffix="SOL"
                    accent="sky"
                    onChange={e => {
                      const val = Math.max(0, Number(e.target.value));
                      setGlobalSettings({ ...globalSettings, dry_run_wallet_balance: String(val) });
                    }}
                  />
                </Field>
              </ToggleCard>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Global TP/SL Override ── */}
      <SectionCard icon={Target} title="Global TP/SL Override" accent="rose" defaultOpen={false}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
            <div>
              <span className="text-[11px] font-mono text-rose-400 uppercase tracking-widest">Master Override</span>
              <div className="text-[10px] text-zinc-500 mt-0.5">When ON, ignores strategy/LLM settings for new buys</div>
            </div>
            <Toggle
              checked={globalSettings.override_tpsl_enabled || false}
              onChange={e => setGlobalSettings({ ...globalSettings, override_tpsl_enabled: e.target.checked })}
            />
          </div>

          <Grid cols={3}>
            <Field label="Global TP" hint="take profit">
              <NumberInput 
                value={globalSettings.default_tp_percent || 0} 
                suffix="%" 
                accent="rose"
                onChange={e => setGlobalSettings({ ...globalSettings, default_tp_percent: Number(e.target.value) })} 
              />
            </Field>
            <Field label="Global SL" hint="stop loss">
              <NumberInput 
                value={globalSettings.default_sl_percent || 0} 
                suffix="%" 
                accent="rose"
                onChange={e => setGlobalSettings({ ...globalSettings, default_sl_percent: Number(e.target.value) })} 
              />
            </Field>
            <ToggleCard
              checked={globalSettings.default_trailing_enabled || false}
              onChange={e => setGlobalSettings({ ...globalSettings, default_trailing_enabled: e.target.checked })}
              label="Trailing Stop"
              desc="Auto-trail"
              accent="rose"
            >
              <Field label="Trail %">
                <NumberInput 
                  value={globalSettings.default_trailing_percent || 0} 
                  suffix="%" 
                  accent="rose"
                  onChange={e => setGlobalSettings({ ...globalSettings, default_trailing_percent: Number(e.target.value) })} 
                />
              </Field>
            </ToggleCard>
          </Grid>
        </div>
      </SectionCard>

      {/* ── Strategy Selector ── */}
      <SectionCard icon={Layers} title="Strategy" accent="brand" defaultOpen={true}>
        {strategies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {strategies.map(strat => (
                <StratCard
                  key={strat.id}
                  strat={strat}
                  active={activeStrategy?.id === strat.id}
                  onClick={() => setActiveStrategy(strat)}
                />
              ))}
            </div>
            {s && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50">
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Strategy Status</span>
                  <div className="text-[12px] font-bold text-zinc-200 mt-0.5">{s.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest",
                    s.enabled ? "text-emerald-400" : "text-zinc-600"
                  )}>
                    {s.enabled ? "Active" : "Disabled"}
                  </span>
                  <Toggle
                    checked={s.enabled}
                    onChange={() => handleToggleStrategy(s.id, s.enabled)}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-zinc-600 font-mono text-[12px]">No strategies found</div>
        )}
      </SectionCard>

      {/* ── Strategy params (only when selected) ── */}
      {s && (
        <>
          {/* Trading & Size */}
          <SectionCard icon={DollarSign} title="Trading & Position Size" accent="brand">
            <Grid cols={2}>
              <Field label="Position Size" hint="per trade">
                <NumberInput value={s.position_size_sol || 0} step={0.01} suffix="SOL" accent="emerald"
                  onChange={e => upd('position_size_sol', Number(e.target.value))} />
              </Field>
              <Field label="Max Open Positions" hint="concurrent">
                <NumberInput value={s.max_open_positions || 0} accent="emerald"
                  onChange={e => upd('max_open_positions', Number(e.target.value))} />
              </Field>
            </Grid>
          </SectionCard>

          {/* Risk Management */}
          <SectionCard icon={Shield} title="Risk Management" accent="rose">
            <div className="flex flex-col gap-4">
              <Grid cols={2}>
                <Field label="Take Profit" hint="exit target">
                  <NumberInput value={s.tp_percent || 0} suffix="%" accent="emerald"
                    onChange={e => upd('tp_percent', Number(e.target.value))} />
                </Field>
                <Field label="Stop Loss" hint="max drawdown">
                  <NumberInput value={s.sl_percent || 0} suffix="%" accent="rose"
                    onChange={e => upd('sl_percent', Number(e.target.value))} />
                </Field>
              </Grid>

              <Grid cols={2}>
                <ToggleCard
                  checked={s.trailing_enabled || false}
                  onChange={e => upd('trailing_enabled', e.target.checked)}
                  label="Trailing Stop"
                  desc="Follows price action dynamically"
                  accent="sky"
                >
                  <Field label="Trailing %">
                    <NumberInput value={s.trailing_percent || 0} suffix="%" accent="sky"
                      onChange={e => upd('trailing_percent', Number(e.target.value))} />
                  </Field>
                </ToggleCard>

                <ToggleCard
                  checked={s.partial_tp || false}
                  onChange={e => upd('partial_tp', e.target.checked)}
                  label="Partial Take Profit"
                  desc="Sell a portion at the target"
                  accent="emerald"
                >
                  <Grid cols={2}>
                    <Field label="Trigger at">
                      <NumberInput value={s.partial_tp_at_percent || 0} suffix="%" accent="emerald"
                        onChange={e => upd('partial_tp_at_percent', Number(e.target.value))} />
                    </Field>
                    <Field label="Sell">
                      <NumberInput value={s.partial_tp_sell_percent || 0} suffix="%" accent="emerald"
                        onChange={e => upd('partial_tp_sell_percent', Number(e.target.value))} />
                    </Field>
                  </Grid>
                </ToggleCard>
              </Grid>
            </div>
          </SectionCard>

          {/* Market Filters */}
          <SectionCard icon={Filter} title="Market Filters" accent="amber">
            <Grid cols={2}>
              <Field label="Min Market Cap" hint="entry floor">
                <NumberInput value={s.min_mcap_usd || 0} prefix="$" accent="amber"
                  onChange={e => upd('min_mcap_usd', Number(e.target.value))} />
              </Field>
              <Field label="Max Market Cap" hint="entry ceiling">
                <NumberInput value={s.max_mcap_usd || 0} prefix="$" accent="amber"
                  onChange={e => upd('max_mcap_usd', Number(e.target.value))} />
              </Field>
              <Field label="Max Token Age" hint="freshness gate">
                <NumberInput value={(s.token_age_max_ms || 0) / 60000} suffix="min" accent="amber"
                  onChange={e => upd('token_age_max_ms', Number(e.target.value) * 60000)} />
              </Field>
              <Field label="Max Hold Time" hint="auto-exit after">
                <NumberInput value={(s.max_hold_ms || 0) / 60000} suffix="min" accent="amber"
                  onChange={e => upd('max_hold_ms', Number(e.target.value) * 60000)} />
              </Field>
            </Grid>
          </SectionCard>

          {/* Volume & Trend */}
          <SectionCard icon={BarChart2} title="Volume & Trend" accent="sky">
            <Grid cols={2}>
              <Field label="Graduated Volume" hint="minimum">
                <NumberInput value={s.min_graduated_volume_usd || 0} prefix="$" accent="sky"
                  onChange={e => upd('min_graduated_volume_usd', Number(e.target.value))} />
              </Field>
              <Field label="Trending Min Volume" hint="minimum">
                <NumberInput value={s.trending_min_volume_usd || 0} prefix="$" accent="sky"
                  onChange={e => upd('trending_min_volume_usd', Number(e.target.value))} />
              </Field>
              <Field label="Trending Min Swaps">
                <NumberInput value={s.trending_min_swaps || 0} accent="sky"
                  onChange={e => upd('trending_min_swaps', Number(e.target.value))} />
              </Field>
              <Field label="Max ATH Distance">
                <NumberInput value={s.max_ath_distance_pct || 0} suffix="%" accent="sky"
                  onChange={e => upd('max_ath_distance_pct', Number(e.target.value))} />
              </Field>
            </Grid>
          </SectionCard>

          {/* Holder Analysis */}
          <SectionCard icon={Users} title="Holder Analysis" accent="violet">
            <Grid cols={2}>
              <Field label="Min Holders" hint="total unique">
                <NumberInput value={s.min_holders || 0} accent="violet"
                  onChange={e => upd('min_holders', Number(e.target.value))} />
              </Field>
              <Field label="Max Top-20 Concentration">
                <NumberInput value={s.max_top20_holder_percent || 0} suffix="%" accent="violet"
                  onChange={e => upd('max_top20_holder_percent', Number(e.target.value))} />
              </Field>
              <Field label="Min Saved Wallet Holders">
                <NumberInput value={s.min_saved_wallet_holders || 0} accent="violet"
                  onChange={e => upd('min_saved_wallet_holders', Number(e.target.value))} />
              </Field>
            </Grid>
          </SectionCard>

          {/* Security & Alpha */}
          <SectionCard icon={Shield} title="Security & Alpha" accent="rose">
            <Grid cols={2}>
              <Field label="Max Rug Ratio" hint="0.0 – 1.0">
                <NumberInput value={s.trending_max_rug_ratio || 0} step={0.1} min={0} max={1} accent="rose"
                  onChange={e => upd('trending_max_rug_ratio', Number(e.target.value))} />
              </Field>
              <Field label="Max Bundler Rate" hint="0.0 – 1.0">
                <NumberInput value={s.trending_max_bundler_rate || 0} step={0.1} min={0} max={1} accent="rose"
                  onChange={e => upd('trending_max_bundler_rate', Number(e.target.value))} />
              </Field>
              <Field label="Min Alpha Sources">
                <NumberInput value={s.min_source_count || 0} accent="rose"
                  onChange={e => upd('min_source_count', Number(e.target.value))} />
              </Field>
              <Field label="Min GMGN Fee" hint="quality signal">
                <NumberInput value={s.min_gmgn_total_fee_sol || 0} step={0.1} suffix="SOL" accent="rose"
                  onChange={e => upd('min_gmgn_total_fee_sol', Number(e.target.value))} />
              </Field>
            </Grid>
          </SectionCard>

          {/* Advanced Screening */}
          <SectionCard icon={Brain} title="Advanced Screening" accent="violet">
            <Grid cols={2}>
              <ToggleCard
                checked={s.require_fee_claim || false}
                onChange={e => upd('require_fee_claim', e.target.checked)}
                label="Fee Claim Required"
                desc="Only enter tokens with fee claims"
                accent="violet"
              >
                <Field label="Min Fee Claim">
                  <NumberInput value={s.min_fee_claim_sol || 0} step={0.1} suffix="SOL" accent="violet"
                    onChange={e => upd('min_fee_claim_sol', Number(e.target.value))} />
                </Field>
              </ToggleCard>

              <ToggleCard
                checked={s.use_llm || false}
                onChange={e => upd('use_llm', e.target.checked)}
                label="AI Analysis (LLM)"
                desc="Smart candidate screening via Claude"
                accent="violet"
              >
                <Field label="Min Confidence">
                  <NumberInput value={s.llm_min_confidence || 0} min={0} max={100} suffix="/100" accent="violet"
                    onChange={e => upd('llm_min_confidence', Number(e.target.value))} />
                </Field>
              </ToggleCard>
            </Grid>
          </SectionCard>
        </>
      )}

      {/* ── Danger Zone ── */}
      <SectionCard icon={Trash2} title="Danger Zone" accent="rose" defaultOpen={true}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle size={13} /> Reset Trading Database
              </span>
              <p className="text-[11px] text-zinc-500 font-mono leading-relaxed max-w-lg">
                Clears all open/closed positions, win rate statistics, and transaction history to start completely fresh at 0. Settings, configurations, and strategies remain intact.
              </p>
            </div>
            <button
              onClick={handleResetDatabase}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-400 font-bold text-[12px] hover:bg-rose-500/20 hover:border-rose-500/50 hover:-translate-y-px active:translate-y-0 transition-all duration-150 shadow-md shadow-rose-950/20 shrink-0"
            >
              <Trash2 size={13} /> Reset Database
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}