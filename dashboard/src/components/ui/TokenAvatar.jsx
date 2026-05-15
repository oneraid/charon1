import React from 'react';

export function TokenAvatar({ symbol }) {
  const s = (symbol || '??').slice(0, 3).toUpperCase();
  return (
    <div className="w-7 h-7 rounded bg-brand-dim border border-brand/30 flex items-center justify-center font-mono text-[9px] text-brand font-bold shrink-0">
      {s}
    </div>
  );
}
