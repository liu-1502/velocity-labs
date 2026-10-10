'use client';

import { useEffect } from 'react';
import { startLenis, stopLenis } from '@/lib/lenis';

/**
 * Freezes page scroll while `locked` is true (mobile nav drawer).
 *
 * Two things are needed, not one:
 *  - `overflow: hidden` stops native scrolling
 *  - `lenis.stop()` stops momentum scrolling — Lenis drives scroll itself and
 *    happily keeps gliding underneath an open drawer without this
 *
 * Scrollbar width is compensated so the layout doesn't jump on lock.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    stopLenis();

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      startLenis();
    };
  }, [locked]);
}
