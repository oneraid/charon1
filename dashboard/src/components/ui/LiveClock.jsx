import React, { useState, useEffect } from 'react';

export function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs text-muted-foreground tracking-wider">
      {time.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false })} GMT+7
    </span>
  );
}
