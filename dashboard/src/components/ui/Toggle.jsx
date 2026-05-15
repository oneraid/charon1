import React from 'react';

export function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between p-3.5 px-4 bg-raised border border-white/10 rounded-md transition-colors hover:border-white/20">
      <div className="flex flex-col gap-0.5">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc && <div className="text-xs text-muted-foreground font-mono">{desc}</div>}
      </div>
      <label className="relative w-11 h-6 shrink-0 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <span className="absolute inset-0 bg-overlay border border-white/10 rounded-full transition-colors peer-checked:bg-brand-dim peer-checked:border-brand/30" />
        <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-muted-foreground transition-all duration-200 peer-checked:translate-x-5 peer-checked:bg-brand peer-checked:shadow-[0_0_8px_rgba(0,255,170,0.5)]" />
      </label>
    </div>
  );
}
