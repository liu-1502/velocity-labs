'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Arrow } from '@/components/ui';
import { projects } from '@/content/work';
import { useReducedMotion, useReveal, useScrollScrub } from '@/hooks';
import { clamp01, EASE_POWER1_OUT } from '@/lib/motion';

/** Gap between cards, in px. Mirrored in site.css. Width is measured, not fixed. */
const GAP = 24;
/** How far the outermost card shrinks: 1 at the centre down to this at the edge. */
const MIN_SCALE = 0.84;

const CONTENT_DELAY = 0.35;

/**
 * The pinned stage: heading plus the card rail.
 *
 * It takes the heading as `children` rather than leaving it in Work.tsx, because
 * the heading has to be inside the sticky element — it holds still with the
 * cards — and the sticky element's height is measured here.
 */
export function Pillars({ children }: { children?: ReactNode }) {
  const trackOuterRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);
  /** Measured once per resize, so the scroll callback never reads layout. */
  const sizeRef = useRef({ rail: 0, shift: 0, card: 0 });
  const navRef = useRef(0);

  const shown = useReveal(railRef, 72);
  const reduced = useReducedMotion();
  const animate = shown || reduced;

  /*
    One measurement feeds two things: how far the rail still has to travel, and
    how much scroll length the section needs to give it. They are the same
    number, which is what makes the pin end exactly on the last card.
  */
  useEffect(() => {
    const rail = railRef.current;
    const outer = trackOuterRef.current;
    if (!rail || !outer) return;

    const measure = () => {
      /*
        Card width is READ, not declared. It is sized in CSS against the window
        so that one card sits full width in the middle and its neighbours show a
        third to a half each — a fixed number here would drift out of step with
        that the moment the breakpoint changed.
      */
      const card = cardsRef.current[0]?.offsetWidth ?? 0;
      const width = projects.length * (card + GAP) - GAP;
      /*
        The rail is full-bleed with a left padding that holds the first card in
        line with the heading, so the distance a card can actually show across is
        the padding box minus that inset — not `clientWidth`, which includes it.
        Using the wrong one leaves the last card short of the right edge by
        exactly one gutter.
      */
      const inset = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
      const visible = rail.clientWidth - inset;
      const shift = Math.max(0, width - visible);
      sizeRef.current = { rail: visible, shift, card };
      outer.style.setProperty('--work-travel', `${Math.round(shift)}px`);
      navRef.current =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /*
    Vertical scroll drives horizontal travel, but only while the stage is pinned.

    `local` is `-rect.top` of the outer track, so `navH + local` is how far the
    track's top has travelled PAST the point where the stage sticks — zero on the
    frame it pins, and equal to the travel on the frame the last card lands.
    Dividing by the travel makes the first and last card the two ends of the pin,
    which is what stops the row from still moving as the section leaves.

    Each card is scaled by how far its centre sits from the middle of the rail:
    full size in the middle, MIN_SCALE at the edges. The measure is the card's
    CURRENT position, not its index, so the focus stays put on screen and the
    cards grow and shrink as they pass through it.
  */
  const drive = useCallback((local: number) => {
    const track = trackRef.current;
    const { rail, shift, card: cardWidth } = sizeRef.current;
    if (!track || !rail || !cardWidth) return;

    const progress = shift > 0 ? clamp01((navRef.current + local) / shift) : 0;
    const x = -shift * progress;
    track.style.transform = `translate3d(${x}px, 0, 0)`;

    const middle = rail / 2;
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const centre = i * (cardWidth + GAP) + cardWidth / 2 + x;
      const away = Math.min(1, Math.abs(centre - middle) / middle);
      card.style.setProperty('--scale', (1 - away * (1 - MIN_SCALE)).toFixed(4));
    });
  }, []);

  useScrollScrub(trackOuterRef, drive, { catchUp: 0, enabled: !reduced });

  return (
    <div className="work-track" ref={trackOuterRef}>
      <div className="work-stage" ref={stageRef}>
        {children}

        <div className="pillar-rail" ref={railRef}>
      <div className="pillars" ref={trackRef}>
        {projects.map((project, i) => (
          <article
            className="pillar"
            key={project.id}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
          >
            {/*
              Image slot, empty for now. The logo-and-line-art component still
              exists next door and is simply not called any more, so the
              illustrations are one import away if they come back. Not deleted:
              this project is not under version control.
            */}
            <div className="pillar-visual" aria-hidden="true" />

            <span className="p-domain">{project.domain}</span>

            <motion.div
              className="pillar-content"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={animate ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: CONTENT_DELAY, ease: EASE_POWER1_OUT }}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </motion.div>

            {/* The hover affordance. Decorative — the link below is the control. */}
            <span className="pillar-open" aria-hidden="true">
              <Arrow />
            </span>

            {/*
              Stretched over the whole card, so the card IS the hit area without
              nesting the heading and copy inside an anchor.

              Rendered only when the project has somewhere to go. Until then the
              card shows its hover state but does nothing, which is the honest
              placeholder — an `<a>` with no `href` is not focusable or
              clickable, so it would look like a control and behave like none.
            */}
            {project.href && (
              <a className="pillar-link" href={project.href} aria-label={`View ${project.title}`} />
            )}
          </article>
            ))}
          </div>
        </div>
      </div>

      {/* The scroll length the pin runs on — see `.work-spacer` in site.css. */}
      <div className="work-spacer" aria-hidden="true" />
    </div>
  );
}
