'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the visitor asked the OS to reduce motion.
 *
 * Starts `false` so the server-rendered markup matches the client's first
 * paint; the real value lands in an effect. Every scroll sequence checks this
 * and jumps straight to its end state instead of animating — the same
 * `reduce` branch the production script takes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
