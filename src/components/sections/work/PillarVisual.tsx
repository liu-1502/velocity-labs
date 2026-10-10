import type { Project } from '@/types';

/**
 * The illustration at the top of each pillar.
 *
 * All five are ports of the production markup — same viewBox, same path data,
 * same animation classes (`draw`, `spin-slow`, `sig-a`/`sig-b`, `orb`), which
 * live in site.css. Two of the six projects show a logo chip instead of a
 * drawing; the rest are hand-authored SVG.
 *
 * Renders the whole `.pillar-visual` element because one variant (Yuzu) needs
 * an extra class on it.
 */
export function PillarVisual({ project }: { project: Project }) {
  switch (project.visual) {
    /* White chip behind a brand mark — Novaland, BTSE. */
    case 'chip':
      return (
        <div className="pillar-visual">
          {project.logo ? (
            <span className="pv-chip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.logo.src} alt={project.logo.alt} />
            </span>
          ) : null}
        </div>
      );

    /* Yuzu: the mark drifting in a slow orbit over a self-drawing trend line. */
    case 'orbit':
      return (
        <div className="pillar-visual pv-yuzu">
          {project.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={project.logo.src} alt={project.logo.alt} className="pv-yuzu-mark" />
          ) : null}
          <svg className="pv-svg pv-yuzu-line" viewBox="0 0 120 86" fill="none" aria-hidden="true">
            <polyline className="ln acc draw" points="14,66 40,58 60,60 82,40 106,26" />
          </svg>
        </div>
      );

    /* Telesales: a handset with two signal arcs pulsing out of it. */
    case 'call':
      return (
        <div className="pillar-visual">
          <svg className="pv-svg" viewBox="0 0 120 86" fill="none" aria-hidden="true">
            <path
              className="ln acc"
              d="M44,40 a10,10 0 0,1 10,-10 l4,0 2,8 -6,4 a14,14 0 0,0 8,8 l4,-6 8,2 0,4 a10,10 0 0,1 -10,10 C52,60 44,52 44,40Z"
            />
            <path className="ln dim sig-a" d="M78,30 a18,18 0 0,1 0,26" />
            <path className="ln dim sig-b" d="M86,22 a30,30 0 0,1 0,42" />
          </svg>
        </div>
      );

    /* Collectibles: a wireframe cube with a slowly rotating accent core. */
    case 'cube':
      return (
        <div className="pillar-visual">
          <svg className="pv-svg" viewBox="0 0 120 86" fill="none" aria-hidden="true">
            <polygon className="ln" points="60,16 88,32 88,62 60,78 32,62 32,32" />
            <polyline className="ln dim" points="32,32 60,48 88,32" />
            <line className="ln dim" x1="60" y1="48" x2="60" y2="78" />
            {/*
              No `fill` here: `.ln { fill: none }` in site.css overrides a
              presentation attribute, so the brand-orange fill this used to carry
              never painted. Verified with getComputedStyle — it read `none`.
            */}
            <polygon
              className="ln acc spin-slow"
              points="60,38 70,44 70,56 60,62 50,56 50,44"
            />
          </svg>
        </div>
      );

    /* Poker: ace and king of spades, drifting out of phase. */
    case 'cards':
      return (
        <div className="pillar-visual">
          <div className="pv-cards">
            <div className="pcard pc-a">
              <span className="pc-r">A</span>
              <span className="pc-s">&#9824;</span>
            </div>
            <div className="pcard pc-k">
              <span className="pc-r">K</span>
              <span className="pc-s">&#9824;</span>
            </div>
          </div>
        </div>
      );
  }
}
