'use client';

import { useEffect, useState } from 'react';

/**
 * Which nav anchor the reader is currently inside.
 *
 * The page is 21 screens tall and the scroll bar at the top of the header
 * already answers "how much is left". This answers the other half — "which part
 * am I in" — which the nav could not say before: all four links looked the same
 * at every scroll position.
 *
 * `rootMargin: '-50% 0px -50% 0px'` collapses the observer's root to a
 * zero-height line across the middle of the viewport, so a section counts as
 * current while it crosses that line rather than while it is merely on screen.
 * Without it every section from the fold to the footer would be "intersecting"
 * at once on a page with sections this tall.
 *
 * IntersectionObserver is also what makes the pinned sections work for free.
 * Philosophy and Why are sticky stages, and reading their position with
 * `getBoundingClientRect().top + scrollY` reports where they are PAINTED, not
 * where they sit in layout — measured, that put `#philosophy` at y=15.275 on a
 * page where it is the second section. The observer sees the real boxes, so
 * none of that arithmetic has to be done or kept correct.
 */
export function useActiveSection(sections: Record<string, readonly string[]>): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    /*
      An anchor does not always own one element. `#why` is only WhyIntro, 1.866px
      of an ~8.500px stretch — the 6.614px stage that follows it is a sibling
      with no id of its own. Mapping each href to a LIST is what lets "Why Us"
      stay lit across both, without adding ids to the section components.
    */
    const owner = new Map<Element, string>();
    for (const [href, selectors] of Object.entries(sections)) {
      for (const selector of selectors) {
        for (const element of Array.from(document.querySelectorAll(selector))) {
          owner.set(element, href);
        }
      }
    }
    if (owner.size === 0) return;

    const elements = Array.from(owner.keys()).sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );

    const crossing = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target);
          else crossing.delete(entry.target);
        }

        /*
          Last in DOM order wins. Contact is built to open OVER the Why stage, so
          through that overlap both cross the line at once — and the one the
          reader is looking at is the one painted on top, which is the later of
          the two. Taking the first match would leave the nav on "Why Us" while
          Contact filled the screen.
        */
        let current: string | null = null;
        for (let i = elements.length - 1; i >= 0; i -= 1) {
          const element = elements[i];
          if (element && crossing.has(element)) {
            current = owner.get(element) ?? null;
            break;
          }
        }
        setActive(current);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [sections]);

  return active;
}
