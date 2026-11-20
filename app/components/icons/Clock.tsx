'use client';

import { useEffect, useState } from 'react';

export function Clock() {
  const [now, setNow] = useState<Date | null>(null); // ← null on server

  useEffect(() => {
    // Update from timer callbacks instead of synchronously inside the effect
    // body, which avoids a cascading render in React's lint rules.
    const tick = () => setNow(new Date());
    const initial = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(id);
    };
  }, []);

  if (!now) {
    // server + first client paint render identical output
    return <span className="tabular-nums" aria-hidden>--:--:--</span>;
  }

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {now.toLocaleTimeString('he-IL', { hour12: false })}
    </span>
  );
}