import type Lenis from 'lenis';

/**
 * Module-level handle on the running Lenis instance.
 *
 * Needed because `overflow: hidden` on <body> does NOT stop Lenis — it drives
 * scrolling itself, so anything that locks scrolling (the mobile nav drawer)
 * must tell Lenis to pause as well, or the page keeps gliding underneath the
 * open menu.
 *
 * `SmoothScroll` sets this on mount and clears it on unmount. Everything else
 * only reads it, and must tolerate `null` — Lenis is intentionally absent
 * under `prefers-reduced-motion`.
 */

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Pause momentum scrolling (drawer opened). No-op if Lenis isn't running. */
export function stopLenis(): void {
  instance?.stop();
}

/** Resume momentum scrolling (drawer closed). No-op if Lenis isn't running. */
export function startLenis(): void {
  instance?.start();
}
