import type { Transition, Variants } from 'framer-motion';

/**
 * Shared motion vocabulary.
 *
 * Every animated component pulls its easing/duration from here so the whole
 * site moves with one personality. Change a value once, it changes everywhere.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_SOFT = [0.65, 0, 0.35, 1] as const;

/* ---------------------------------------------------------------------------
   GSAP equivalents

   The production page animates with GSAP, so its curves are named in GSAP's
   vocabulary. These are the same curves, so a ported animation lands on the
   same frames rather than merely looking similar.
   --------------------------------------------------------------------------- */

/*
  Mind the off-by-one in GSAP's naming: `power1` is QUADRATIC, `power2` cubic,
  `power3` quartic. So `power3.out` is easeOutQuart — a noticeably harder stop
  than the easeOutCubic it is easy to mistake it for.
*/

/** GSAP `power1.out` — easeOutQuad. */
export const EASE_POWER1_OUT = [0.25, 0.46, 0.45, 0.94] as const;

/** GSAP `power2.out` — easeOutCubic. */
export const EASE_POWER2_OUT = [0.215, 0.61, 0.355, 1] as const;

/** GSAP `power3.out` — easeOutQuart. */
export const EASE_POWER3_OUT = [0.165, 0.84, 0.44, 1] as const;

/** `power2.out` as the exact curve — easeOutCubic. */
export function cubicOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * `power3.out` as the exact curve, for when the bezier above is not close
 * enough.
 *
 * (0.165, 0.84, 0.44, 1) is the conventional easeOutQuart bezier, but a cubic
 * bezier cannot actually be a quartic: measured against the live reveal it runs
 * ~0.04 low through the middle and reaches 0.97 where production is at 0.99.
 * Visible as a slightly draggier fade. Use this where the difference matters.
 */
export function quartOut(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * GSAP `elastic.out(1, 0.7)` — the overshoot on the six track-record pillars.
 *
 * No cubic-bezier can express an elastic curve (it overshoots past 1 and
 * oscillates back), so this is the function itself:
 *
 *   1 + 2^(-10t) · sin((t − s) · 2π / period),  s = period/2π · asin(1/amplitude)
 *
 * With amplitude 1 and period 0.7, s = 0.175, giving f(0) = 0 and f(1) ≈ 1.
 */
export function elasticOut(t: number): number {
  const period = 0.7;
  const s = (period / (2 * Math.PI)) * Math.asin(1);
  return 1 + Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period);
}

/** Clamp to the 0…1 range — the `clamp` helper from the original main.js. */
/**
 * Smoothstep — eased at BOTH ends, unlike the `*Out` curves above.
 *
 * For scroll-driven phases rather than for timed tweens. A phase that is driven
 * straight off `seg` starts and stops at full speed, so every boundary between
 * two phases is a visible jolt: the thing being moved snaps into motion, runs at
 * a constant rate, and stops dead. Zero velocity at both ends is what makes a
 * sequence of phases read as one continuous move instead of as a slideshow.
 */
export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Normalise `value` across the window `from`…`to`, clamped.
 * This is the `seg()` helper the production scroll sequences are written in,
 * so phase boundaries can be quoted straight from that source.
 */
export function seg(value: number, from: number, to: number): number {
  return clamp01((value - from) / (to - from));
}

export const transitions = {
  fast: { duration: 0.35, ease: EASE_OUT_EXPO },
  base: { duration: 0.6, ease: EASE_OUT_EXPO },
  slow: { duration: 0.9, ease: EASE_OUT_EXPO },
} satisfies Record<string, Transition>;

/** Default viewport config: fire once, slightly before the element is centred. */
export const viewportOnce = { once: true, amount: 0.25, margin: '0px 0px -80px 0px' } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.base },
};

/**
 * Parent variant that cascades children.
 * Pair with `fadeUp` on each child.
 */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Per-word reveal for headline treatments. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: '0.6em' },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};
