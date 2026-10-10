'use client';

import { motion } from 'framer-motion';
import { useRef, type CSSProperties } from 'react';
import { Arrow } from '@/components/ui';
import { projects } from '@/content/work';
import { useReducedMotion, useReveal } from '@/hooks';
import { EASE_POWER1_OUT } from '@/lib/motion';

/** Seconds between one card's reveal and the next. */
const STAGGER = 0.07;

/**
 * The six projects as a 3 × 2 grid.
 *
 * The horizontal rail this replaces is still on disk as `Pillars.tsx`, unused,
 * and all of its CSS is still in site.css — see `backups/work-rail-horizontal`.
 * Switching back is a one-line change in `Work.tsx`.
 *
 * Every card carries the same content the rail did and the same empty image
 * slot; only the arrangement is new.
 */
export function WorkGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  const shown = useReveal(gridRef, 88);
  const reduced = useReducedMotion();
  const animate = shown || reduced;

  return (
    <div className="work-grid" ref={gridRef}>
      {projects.map((project, i) => (
        <motion.article
          className="wg-card"
          key={project.id}
          /*
            The hover fill's two tint colours — see `tint` on `Project` and
            `.wg-card::before`. Inline because they are per project and there is
            no sensible place for six two-line rules in the stylesheet.
          */
          style={
            project.tint
              ? ({ '--wg-a': project.tint[0], '--wg-b': project.tint[1] } as CSSProperties)
              : undefined
          }
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: i * STAGGER, ease: EASE_POWER1_OUT }}
        >
          {/*
            Image slot. Projects with a screenshot show it; the rest keep the
            empty placeholder the rail used. The frame is 16:9 and the shot is
            cropped to fill it, so a slot looks the same either way.

            `aria-hidden` only while empty — a real screenshot carries its own
            alt text and should reach the accessibility tree.
          */}
          {project.shot ? (
            <div
              className={project.shot.placeholder ? 'wg-visual wg-placeholder' : 'wg-visual'}
              aria-hidden={project.shot.placeholder || undefined}
            >
              <img src={project.shot.src} alt={project.shot.alt} loading="lazy" decoding="async" />
            </div>
          ) : (
            <div className="wg-visual" aria-hidden="true" />
          )}

          <div className="wg-body">
            {/*
              The domain and the open badge share a row.

              The badge used to be absolutely positioned at a corner of the card
              — first over the screenshot, then down in the empty space below the
              copy. On a row with the domain it needs no coordinates at all: it
              is simply the other end of a line that already exists, and it moves
              with the card at every breakpoint for free.
            */}
            <div className="wg-domain">
              <span className="p-domain">{project.domain}</span>
              {project.href && (
                <span className="pillar-open" aria-hidden="true">
                  <Arrow />
                </span>
              )}
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>

          {/*
            The hit area, gated on `href` — as the badge above is.

            The link is what makes the card a control: the card IS the hit area
            without the heading and copy having to live inside an anchor. An `<a>`
            with no `href` is neither focusable nor clickable, so rendering one
            anyway would look like a control and behave like none, which is why
            the badge is gated on the same thing: a diagonal arrow is the web's
            convention for "this opens something", and on a card with nowhere to
            go it promises a navigation that does not exist.
          */}
          {project.href && (
            <a
              className="pillar-link"
              href={project.href}
              aria-label={`View ${project.title}`}
            />
          )}
        </motion.article>
      ))}
    </div>
  );
}
