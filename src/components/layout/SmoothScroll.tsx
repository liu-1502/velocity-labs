'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { setLenis } from '@/lib/lenis';

/**
 * Momentum smooth-scrolling, ported from the original site.
 *
 * The production page runs Lenis with `duration: 1.1`, `smoothWheel: true`
 * and Lenis's stock easing, driving its RAF from GSAP's ticker. This build
 * has no GSAP, so the loop runs on a plain `requestAnimationFrame` —
 * equivalent behaviour, one less dependency.
 *
 * DELIBERATE DIVERGENCE — the glide is slower here than in production. See the
 * two tuned values on the Lenis options below.
 *
 * Why this matters: Lenis interpolates toward the target scroll position
 * instead of jumping to it, which is what gives the page its "gliding"
 * feel. Framer Motion's `useScroll` keeps working because Lenis moves the
 * real document scroll position rather than transforming a wrapper.
 *
 * Mount once, in the root layout, above everything else.
 */

/*
  Anchors land 10px below the viewport top — `offset: -10`, the production
  value. It does NOT clear the fixed header, so the nav overlaps the first few
  pixels of the section you jumped to. That is what the real site does, and
  `scroll-padding-top` has been removed from globals.css so nothing else adds
  a second offset on top of this one.
*/
const ANCHOR_OFFSET = -10;

export function SmoothScroll() {
  useEffect(() => {
    // Never hijack scrolling for people who asked for reduced motion.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const lenis = new Lenis({
      /*
        How long Lenis takes to settle on the target position. Production runs
        1.1; 1.6 lets the page keep gliding after the wheel stops, which is
        where the smoothness is actually felt.
      */
      duration: 1.6,
      /*
        How far one wheel notch asks the page to travel. Lenis defaults to 1 —
        0.7 is what makes the scroll SLOWER rather than merely longer-tailed.
        Raising `duration` alone covers the same ground in more time, which
        reads as lag; cutting the multiplier covers less ground per notch.
      */
      wheelMultiplier: 0.7,
      smoothWheel: true,
      // Lenis's stock easing curve — matches the original exactly.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices keep native scrolling; the original does not smooth it
      // either, and hijacking touch tends to feel worse, not better.
      syncTouch: false,
    });

    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    /*
      Anchor links must go through Lenis — a native jump would fight the
      interpolation and land in the wrong place. Delegated so links added
      later (mobile drawer) are covered without re-binding.
    */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: ANCHOR_OFFSET });
      history.pushState(null, '', href);
    };

    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
