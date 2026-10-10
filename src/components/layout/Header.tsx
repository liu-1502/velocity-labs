'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { Arrow } from '@/components/ui';
import { navLinks } from '@/content/site';
import { useActiveSection, useInertBehind, useScrollLock, useScrolled } from '@/hooks';
import { cn } from '@/lib/cn';
import { Wordmark } from './Wordmark';

/**
 * Fixed header.
 *
 * Transparent over the hero, then at 40px of scroll it picks up a blurred
 * background and a bottom border. The bar keeps ONE height throughout: its
 * padding is 16px in both states, so `scrolled` changes colour and blur only.
 * It used to shrink 20px → 12px as well; that was dropped.
 *
 * Below 860px (`.nav-links` in site.css) the links become a full-screen panel
 * that slides down from above; the markup is identical at every width, only
 * the transform changes.
 */
/*
  Which elements each nav anchor covers — see `useActiveSection`.

  Module scope, not an inline literal: a fresh object every render would make the
  hook's effect tear down and rebuild its observer on every render.

  Two anchors own more than their own section. `#team` takes the careers band
  with it (where the team came from, read as part of the team), and `#why` takes
  the stage after it (the 6.614px scrub, a sibling of `#why` with no id). The
  partners band goes with `#work` for the same reason: it is who the projects
  were for. That leaves no stretch of the page unaccounted for except the hero,
  which has no nav link and correctly lights nothing.
*/
const NAV_SECTIONS = {
  '#philosophy': ['#philosophy'],
  '#team': ['#team', '#careers'],
  '#work': ['#work', '.partners-band'],
  '#why': ['#why', '.why-stage'],
  '#contact': ['#contact'],
} as const;

/**
 * The CTA's inner layers, shared by both copies of it.
 *
 * Same label/icon structure as PolyButton, so the `.btn-poly-*` styles and the
 * arrow swap on hover apply to the nav's pill too.
 */
function CtaLayers({ label }: { label: string }) {
  return (
    <>
      <span className="btn-poly-label">{label}</span>
      <span className="btn-poly-icon" aria-hidden="true">
        <Arrow />
        <Arrow />
      </span>
    </>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  /*
    The nav is five in-page anchors, which only resolve on the page that holds
    those sections. From a case study at /work/<id> they have to carry the route
    with them, or every link in the header scrolls nowhere.

    `useActiveSection` needs no equivalent: off the home page none of its
    selectors match, it returns early, and nothing is marked current — which is
    correct, because the reader is not in any of those sections.
  */
  const pathname = usePathname();
  const onHome = pathname === '/';
  const to = (href: string) => (onHome || !href.startsWith('#') ? href : `/${href}`);
  const scrolled = useScrolled(40);
  const activeHref = useActiveSection(NAV_SECTIONS);
  const ctaLink = navLinks.find((link) => link.cta);

  /*
    Lenis drives scrolling itself, so `overflow: hidden` on <body> does NOT
    stop the page gliding under the open panel — it has to be told to pause.
    Production only sets the overflow and does keep scrolling behind its menu;
    that is a bug, and this is the second place this build deliberately does
    not copy one.
  */
  useScrollLock(open);

  /*
    And out of reach, not just held still.

    `useScrollLock` stops the page moving under the open panel; it does nothing
    about the page still being focusable and still being read. Measured before
    this: with the panel open, Tab walked out of the menu into the links behind
    it, and `#main` carried neither `inert` nor `aria-hidden`. A reader on a
    keyboard lost the menu without any way of knowing where focus had gone.

    The ref is the header, which is the one thing that must stay reachable —
    the panel is inside it. See `useInertBehind`.
  */
  const headerRef = useRef<HTMLElement>(null);
  useInertBehind(open, headerRef);

  return (
    <>
      <a
        href="#main"
        className="bg-accent text-bg rounded-pill sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <header ref={headerRef} className={cn('nav', scrolled && 'scrolled', open && 'open')}>
        <Wordmark as="a" href={to('#top')} />

        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={to(link.href)}
              className={link.cta ? 'nav-cta' : undefined}
              /*
                Not on the CTA. "Get in Touch" is an action, not a place — marking
                it current would say the reader is somewhere rather than that a
                button is available, and it keeps its own pill styling either way.
              */
              aria-current={!link.cta && link.href === activeHref ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {link.cta ? <CtaLayers label={link.label} /> : link.label}
            </a>
          ))}
        </nav>

        {/*
          The CTA again, this time in the BAR — shown only below 861px, where the
          one above has gone into the full-screen panel with the rest of the
          links. Measured on a 375px bar: from 5% to 90% of the page, 18 of 21
          sampled scroll positions had no contact control on screen at all, so
          the one moment a reader is convinced — somewhere in Work, around 40% —
          was the moment they had nothing to tap. On desktop this never happened:
          the header pill is in flow at every width above 860px and was reachable
          at 21 of 21.

          A second element rather than a moved one: `.nav-links` is `fixed` and
          TRANSFORMED off-screen when the panel is closed, and a transformed
          ancestor becomes the containing block for `position: fixed` children —
          so no amount of CSS lifts the original out of it.

          Only ever one of the two is reachable. Above 860px this one is
          `display: none`; below it, the closed panel is `visibility: hidden`,
          which takes its copy out of the tab order and the accessibility tree.
          Both rules are in site.css, and the second also fixes a problem older
          than this button: the panel's other four links were focusable while
          parked off-screen.

          The panel keeps its own copy because the panel covers the bar when
          open: dropping it would mean opening the menu to find no way to make
          contact.
        */}
        {ctaLink && (
          <a className="nav-cta nav-cta-bar" href={to(ctaLink.href)}>
            <CtaLayers label={ctaLink.label} />
          </a>
        )}

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
    </>
  );
}
