'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Drive an animation directly from how far the page has scrolled past an
 * element — the equivalent of a GSAP ScrollTrigger with `scrub`.
 *
 * `apply` receives:
 *   `local` — pixels scrolled past the element's top (0 when its top is level
 *             with the viewport top; negative before that).
 *   `vh`    — current viewport height.
 *
 * WHY PIXELS AND NOT A 0…1 PROGRESS
 * The production sequences mix both. The philosophy clip expands over
 * `end: '+=48%'`, which ScrollTrigger measures as 48% of the VIEWPORT height
 * (verified against the live page: at 1440×900 the clip reaches full-bleed
 * exactly 432px past the stage top). The Why sequence, by contrast, runs
 * `start: 'top top', end: 'bottom bottom'` — a true 0…1 across the stage.
 * Handing the caller raw pixels lets each one express its phases the same way
 * its source does, instead of converting one into the other and rounding.
 *
 * `catchUp` mirrors ScrollTrigger's `scrub: <seconds>`: the value chases the
 * scroll position rather than snapping to it, so the clip trails your wheel
 * slightly. Pass 0 for a hard link.
 */
export function useScrollScrub(
  targetRef: RefObject<HTMLElement | null>,
  apply: (local: number, vh: number) => void,
  { catchUp = 0, enabled = true }: { catchUp?: number; enabled?: boolean } = {},
): void {
  useEffect(() => {
    if (!enabled) return;

    const el = targetRef.current;
    if (!el) return;

    let frame = 0;
    let last = performance.now();
    let current: number | null = null;
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const rect = el.getBoundingClientRect();
      const target = -rect.top;

      if (current === null || catchUp <= 0) {
        current = target;
      } else {
        /*
          ScrollTrigger's scrub is a tween to the new position with GSAP's
          `expo.out`, i.e. 1 − 2^(−10·t/scrub). That is an exponential, so the
          same shape falls out of a per-frame approach with rate 10·ln2/scrub —
          matching both a single jump and continuous scrolling, frame-rate
          independently.

          Measured against the live page after a 216px jump: 47% of the
          distance covered at 41ms, 72% at 82ms, 92% at 164ms, settled by
          415ms. Deriving the rate from ln(100) instead — a plausible-looking
          "99% within scrub seconds" — lands at 34% / 57% / 82% and settles
          ~170ms late, which reads as a laggier page.
        */
        const rate = (10 * Math.LN2) / catchUp;
        current += (target - current) * (1 - Math.exp(-dt * rate));

        /*
          Snap out the last fraction of a pixel. An exponential approach never
          quite arrives, and that residue is visible: a border interpolating to
          0.998px instead of 1px gets floored to a 0.5px hairline by Chrome, so
          the clip's outline looked thinner than production's at rest.
        */
        if (Math.abs(target - current) < 0.5) current = target;
      }

      apply(current, window.innerHeight);
      frame = requestAnimationFrame(tick);
    };

    /*
      THE LOOP ONLY RUNS WHILE ITS SECTION IS NEAR THE WINDOW.

      Seven sections use this hook, and every one of them used to hold a
      `requestAnimationFrame` loop open for the life of the page — measured on
      the running site: eight callbacks per frame, 6.1 `getBoundingClientRect`
      calls, 3 `offsetTop` reads and one `getComputedStyle`, every frame,
      forever, most of it for sections nowhere near the screen. It was never
      slow — 0.30ms median against an 8.3ms budget, and no dropped frames — it
      was simply work with no reader.

      `data-scrub` goes on the element as well as the loop, because the CSS
      hangs its `will-change` off it. See the note beside those rules: a
      promotion hint left on permanently is the documented way to make a page
      slower rather than faster, and this ties every one of them to the moment
      it is actually needed.
    */
    const start = () => {
      if (running) return;
      running = true;
      el.dataset.scrub = 'on';
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
      delete el.dataset.scrub;
      /*
        Forget the smoothed value. `catchUp` eases from wherever it was, and
        after a stop that is wherever the reader LEFT — so without this the
        section would animate back from a stale position on the way in instead
        of simply being correct on its first frame.
      */
      current = null;
    };

    /*
      One viewport of slack on each side, and the number is not comfort.

      `apply` is what tells a section it has been left — WhyIntro's build
      resets when its own progress reaches 0, which happens when the stage's
      top edge passes the BOTTOM of the window. Stop the loop at the edge of
      the viewport and that frame never runs, so the thing never resets. 100%
      keeps the loop alive through exactly that band.
    */
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
        else stop();
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      stop();
    };
  }, [targetRef, apply, catchUp, enabled]);
}
