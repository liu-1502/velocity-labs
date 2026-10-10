'use client';

import { Fragment, useCallback, useEffect, useRef } from 'react';
import { whyContent } from '@/content/why';
import { useReducedMotion, useScrollScrub } from '@/hooks';
import { clamp01, seg, smoothstep } from '@/lib/motion';

/*
  Phases, as fractions of the stage — 0 is its top edge entering from the bottom
  of the viewport, 1 is its bottom edge meeting the viewport's, so the run covers
  the approach as well as the pin. On a 220vh stage in a 900px window the card
  pins at 0.45, and nothing but the fade happens before then: the question is
  still travelling up the screen, and moving it inside its own frame at the same
  time would read as a glitch rather than as a move.

    0.08 – 0.30   the question fades up, small and centred
    0.46 – 0.70   it rises to the top of the card, growing as it goes
    0.64 – 1      three outlined copies drop out from behind it, top to bottom

  The last copy lands on the stage's final frame, so the card releases on the
  finished composition and the next section starts straight away. There is no
  hold on the end: holding it meant a stretch of scrolling where the picture was
  already complete and nothing was happening.

  Every phase is read through `smoothstep`, and the move overlaps the cascade by
  design. Driven straight off `seg` each one starts and stops at full speed, so
  the boundaries are jolts and the whole thing reads as a slideshow advancing a
  frame at a time instead of as one continuous move.
*/
const WORD_IN = [0.08, 0.3] as const;
const MOVE = [0.46, 0.7] as const;
const CASCADE = [0.64, 1] as const;

/** How big the question is before it moves, as a share of its final size. */
const START_SCALE = 0.42;

/*
  The step between copies, in ems, so it scales with the type at every window
  width.

  1.08 against a line box of 1 clears the line and leaves a little air: the
  copies sit UNDER one another rather than over one another. Vertical only —
  they keep the white word's left edge, so the block reads as one column flush
  to the gutter.

  Changing it means changing the 4.24 in `.wi-rows`' font-size, which is this
  step times the number of copies plus the one line the white word occupies.
  That figure is what keeps the type small enough for the block to fit the card.
*/
const COPY_DY = 1.08;

const COPIES = [1, 2, 3] as const;

/*
  The question split on its accent marker.

  Splitting on the brackets puts the marked run on every odd index, which is all
  the bookkeeping a single run needs — and the empty strings a leading or
  trailing marker would produce are dropped rather than rendered as empty spans.
*/
const PARTS = whyContent.intro
  .split(/[[\]]/)
  .map((text, i) => ({ text, accent: i % 2 === 1 }))
  .filter((part) => part.text.length > 0);

function Question() {
  return (
    <>
      {PARTS.map((part, i) =>
        part.accent ? <em key={i}>{part.text}</em> : <Fragment key={i}>{part.text}</Fragment>,
      )}
    </>
  );
}

/**
 * The title card that opens Why Velocity.
 *
 * The question arrives small in the middle of the screen, rises to the top as it
 * grows to the full width of the gutter box, and then drops three outlined
 * copies of itself out from behind it. Centred throughout.
 *
 * The overlap with what comes before is in the stylesheet, not here: this stage
 * and the clients band share a wrapper, the band is sticky inside it, and this
 * stage is the opaque layer above. So the band holds at the top of the screen
 * while the black rises over it and takes the whole viewport.
 */
export function WhyIntro() {
  const stageRef = useRef<HTMLElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  /**
   * The furthest the build has got. It only ever goes up — see `apply`.
   *
   * A ref and not state: it is written every frame and read by the same frame,
   * and a re-render per frame is exactly what the scrub exists to avoid.
   */
  const builtRef = useRef(0);

  const reduced = useReducedMotion();

  const apply = useCallback((local: number, vh: number) => {
    const stage = stageRef.current;
    const rows = rowsRef.current;
    const frame = rows?.parentElement;
    if (!stage || !rows || !frame) return;

    const live = clamp01((vh + local) / stage.offsetHeight);

    /*
      The build is a RATCHET: it runs forwards and does not run back.

      Scrolling down assembles the picture; scrolling up leaves it assembled.
      Un-building it on the way up made the section an accordion — the reader
      goes back to re-read the line and the thing they were reading takes itself
      apart around them — and it also meant the composition was only ever whole
      at one scroll position, which is a strange thing to say about a title card.

      `live <= 0` is the one thing that puts it back, and it is the stage's top
      edge dropping below the bottom of the window: the reader has not just
      scrolled up within the section, they have left it. Resetting there rather
      than at some fraction of the way up is what keeps it invisible — at p = 0
      the card is entirely off the bottom of the screen, so the reset happens
      where nobody can see it, and scrolling back down plays the whole thing
      again from nothing.

      The clamp is what makes this safe to compare against 0: `live` cannot go
      negative however far above the section the page is.
    */
    if (live <= 0) builtRef.current = 0;
    else if (live > builtRef.current) builtRef.current = live;

    const p = builtRef.current;

    /*
      The fade is on the GROUP, never on a copy. Each copy's opaque bed is what
      hides the one behind it, and a copy below full opacity stops hiding
      anything — the cascade goes straight back to outlines drawn through each
      other.
    */
    rows.style.opacity = String(smoothstep(seg(p, WORD_IN[0], WORD_IN[1])));

    /*
      The group is laid out where it ENDS — full size, centred in the gutter box,
      a gutter down from the top — and the move is the offset back to the middle
      of the screen, run down to zero.

      Anchoring it that way is what keeps the landing exact. Animating TOWARDS a
      measured target instead leaves the final position at the mercy of whatever
      the last frame happened to sample, and the word settles a pixel or two off
      its own gutter.

      Vertical only: the block spans the gutter box and its lines are centred
      inside it, so it is horizontally where it belongs at every scale.
    */
    const a = smoothstep(seg(p, MOVE[0], MOVE[1]));
    const scale = START_SCALE + (1 - START_SCALE) * a;

    const toCentreY = frame.clientHeight / 2 - (rows.offsetTop + (rows.offsetHeight * START_SCALE) / 2);

    rows.style.transform =
      `translateY(${(toCentreY * (1 - a)).toFixed(1)}px) scale(${scale.toFixed(4)})`;

    /*
      All three drop on ONE progress, each to its own multiple of the step.

      Moving them one at a time — the obvious reading of "top to bottom" — is
      what made this feel like a slideshow: three discrete slides with a hard
      hand-off between each. Sharing the progress gives the same order for free,
      since the nearest copy clears the word first and the furthest last, and it
      is a single continuous move instead of three.

      They cannot cross, either: the offsets are k × step × progress, which is
      non-decreasing in k whatever the progress is.
    */
    const fan = smoothstep(seg(p, CASCADE[0], CASCADE[1]));

    rows.querySelectorAll<HTMLElement>('.wi-copy').forEach((copy, i) => {
      const k = i + 1;

      copy.style.transform = `translateY(${(k * COPY_DY * fan).toFixed(3)}em)`;
    });
  }, []);

  useScrollScrub(stageRef, apply, { catchUp: 0.4, enabled: !reduced });

  /* Reduced motion: the end state, with the cascade already out. */
  useEffect(() => {
    if (!reduced) return;

    const rows = rowsRef.current;
    if (!rows) return;

    rows.style.opacity = '1';
    rows.querySelectorAll<HTMLElement>('.wi-copy').forEach((copy, i) => {
      const k = i + 1;
      copy.style.transform = `translateY(${k * COPY_DY}em)`;
    });
  }, [reduced]);

  return (
    <section className="why-intro" id="why" ref={stageRef}>
      <div className="wi-sticky">
        <div className="wi-rows" ref={rowsRef}>
          <h2 className="wi-row is-centre">
            <Question />
          </h2>

          {/*
            Copies of the heading above — never read out twice. Painted in
            order, each one under the last, so the cascade occludes downwards.
          */}
          {COPIES.map((k) => (
            <span
              className="wi-row wi-copy"
              aria-hidden="true"
              key={k}
              style={{ zIndex: COPIES.length - k }}
            >
              <Question />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
