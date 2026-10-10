'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Takes the rest of the page out of reach while an overlay is open.
 *
 * `useScrollLock` already stops the page MOVING behind the mobile nav panel.
 * This stops it being REACHED: with the panel open, every link and button
 * underneath it stayed in the tab order and stayed in the accessibility tree,
 * so Tab walked straight out of the menu and into a page the reader could not
 * see, and a screen reader read the whole document through the overlay.
 * Verified before the fix: with the panel open, `#main` carried neither `inert`
 * nor `aria-hidden`.
 *
 * `inert` rather than `aria-hidden` or a focus trap. It is the one thing that
 * does both halves of the job — removes the subtree from the accessibility tree
 * AND makes every control in it unfocusable and unclickable — and because
 * nothing outside the panel can take focus any more, the trap falls out of it
 * for free rather than having to be written and kept in sync.
 *
 * Everything in `<body>` is inerted except `skip`, which is the header: the
 * panel lives inside it, so inerting it would inert the menu itself. Elements
 * that were already inert are left that way on cleanup — the attribute may
 * belong to something else, and this hook does not own it.
 */
export function useInertBehind(active: boolean, skip: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!active) return;

    const exempt = skip.current;
    const marked = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== exempt && !el.hasAttribute('inert'),
    );

    for (const el of marked) el.setAttribute('inert', '');

    return () => {
      for (const el of marked) el.removeAttribute('inert');
    };
  }, [active, skip]);
}
