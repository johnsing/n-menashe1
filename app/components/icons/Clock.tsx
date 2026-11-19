'use client';

import { useEffect, useState } from 'react';

export function Clock() {
  const [now, setNow] = useState<Date | null>(null); // ← null on server

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
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