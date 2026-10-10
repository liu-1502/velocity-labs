'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * True once the element's top has risen past `at`% of the viewport height,
 * and true forever after.
 *
 * The default 86 is `start: 'top 86%'` from the generic production reveal
 * trigger; the track-record columns use 72. Expressed as an
 * IntersectionObserver root inset with the bottom (100 − at)% cropped off, so
 * the callback fires at the same scroll position rather than "roughly when the
 * element appears".
 */
export function useReveal(ref: RefObject<HTMLElement | null>, at = 86): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;

    /*
      Check the position up front, before observing.

      IntersectionObserver only reports actual intersections, so an element the
      page has already scrolled PAST — a reload that restores scroll position, a
      deep link to #contact, a jump down the page — never intersects and would
      stay at opacity 0 forever. ScrollTrigger computes from scroll offset and
      fires regardless, so it does not have that hole. Closing it here keeps the
      two equivalent.
    */
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    if (el.getBoundingClientRect().top <= window.innerHeight * (at / 100)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: `0px 0px -${100 - at}% 0px` },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, revealed, at]);

  return revealed;
}
