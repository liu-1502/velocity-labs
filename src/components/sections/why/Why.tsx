'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { stats, techLogos, techStack, whyContent } from '@/content/why';
import { useReducedMotion, useScrollScrub } from '@/hooks';
import { clamp01, seg } from '@/lib/motion';

/*
  Phase boundaries, as fractions of the stage scroll.

  0 is the stage's top edge reaching the MIDDLE of the viewport and 1 is its
  bottom edge meeting the viewport's bottom, so the run covers the second half
  of the approach as well as the pin.

  Two things set those ends.

  Starting at the halfway line, rather than when the stage first appears, is
  what keeps the title card before it readable: the card scrolls away over the
  top half of the screen, and while it does, everything underneath it has to be
  plain black. Beginning at the stage's first pixel put logos on screen beside
  the card's own letters and read as the two sections being cut together.

  Running to the bottom edge, rather than only across the pin, is what keeps the
  far end alive: measuring the pinned part alone left the progress clamped at 0
  for the whole approach, so the panel sat at nothing while an empty black field
  scrolled past.

    0     – 0.385  the tech field drifts in and past the centred headline
    0.363 – 0.407  that block fades out …
    0.412 – 0.457  … across "Built different," writing itself on, centred
    0.454 – 0.501  "on purpose."
    0.501 – 0.53   the finished line holds, alone on a black screen
    0.53  – 0.631  it travels up to 80px under the bar and stays there
    0.646 – 0.725  the four rows fade up from below it
    0.725 – 0.869  they finish rising and meet the heading
    0.869 – 1      EVERYTHING HOLDS — the section sits there, finished

  THE LAST THREE LINES ARE THE CHANGE. Everything above them happens where and
  when it did; the figures moved only because the stage grew from 400vh to
  444vh, and each was recomputed from the scroll distance it used to sit at
  rather than rescaled by eye.

  What it replaces: the line used to be wiped off the screen by the rows sliding
  up over it, the whole handover inside 0.042 of the stage — about 170px of
  wheel for a block of display type to leave and a table to arrive. Nothing is
  hidden now. The heading goes where a heading goes and stays there, and the
  rows arrive underneath it — all four of them, on the same screen, which is
  what the type and row sizes in site.css were solved backwards from.

  Each handover overlaps the one before it on purpose. Butting them end to end
  put a frame between every pair where both were at zero, which on a stage this
  tall is a few hundred pixels of nothing.

  The two exceptions are the joins on either side of the tagline, and both are
  nearly butt-jointed. Two pieces of display type crossing in the middle of the
  same panel is not a cross-fade, it is two sentences printed over each other,
  and neither can be read. The 0.005 of stage left between them is about 20px of
  scroll, a couple of frames at a dim moment.
*/
const FIELD_END = 0.385;
const BUILD_OUT = [0.363, 0.407] as const;
const TAG_1 = [0.412, 0.457] as const;
const TAG_2 = [0.454, 0.501] as const;

/*
  The lift out of the middle of the panel and up under the bar.

  How FAR it travels is not written down anywhere — it is measured, every frame,
  from the window's own height and the heading's own: the line is centred when
  it sits `vh / 2 − its own half height` from the top and parked when it sits at
  `.wo-head`'s 146px, and the difference between those two is the whole move. A
  constant would have been right on one window and wrong on every other.

  0.106 of the stage is 334px of wheel on an 848px window for a 240px rise — a
  little slower than the scroll it answers, which is what stops it feeling like
  the page jerking the heading into place.
*/
const TAG_RISE = [0.53, 0.631] as const;

/*
  The rows, as one block, after the heading has stopped moving.

  They start at 0.805 because the heading settles at 0.79 and the first row's top
  edge crosses the bottom of the window at 0.805 — so the fade begins on the
  frame they could first be seen in, and is over by the time the first row is a
  third of the way up. They are rising the whole time; the fade is on top of
  that, not instead of it.

  And they stop. The row heights in site.css are solved so that the four of them
  plus the heading come to exactly one screen, and the stage ends on the frame
  they get there — so the last thing this sequence does is stand still with the
  whole table readable, rather than walking it up behind its own heading.

  Nothing per-row. The four are a table, not a sequence, and a reader who has
  scrolled this far is here for the numbers rather than for the order they land
  in.
*/
const CARDS_IN = [0.646, 0.725] as const;

/**
 * How long the finished section sits still, as a fraction of the window.
 *
 * The rows used to reach the heading and the whole section began leaving on the
 * same frame — the one arrangement this 472vh of scrolling exists to produce was
 * never actually on screen at rest. Half a screen of wheel now goes into holding
 * it: the panel is pinned by `.why-sticky` and the table is pinned against it
 * here, so the reader has to scroll on before anything moves.
 *
 * `.why-stage` is 42vh taller than it needs to be for exactly this, and the two
 * numbers have to agree — the pin ends on the frame the hold does.
 */
const HOLD = 0.42;

/**
 * How much bigger the tagline is while it is still centred on the screen.
 *
 * 1.45 — 60px becomes 87px at the desktop rung. The line has the whole window
 * to itself at that point, and setting it at the size it will end up at wasted
 * that: a 60px line alone on a black screen reads as a line that has already
 * found its place, so the climb afterwards looked like a scroll artefact rather
 * than a move. Big first and smaller at the top is the shape of the gesture.
 *
 * It is a TRANSFORM, not a font-size. Scaling costs no layout, so the lift
 * below — which is derived from `offsetHeight` — keeps measuring the parked
 * line it is actually solving for, at every width, without knowing this exists.
 * `transform-origin` is the default centre, so the visual centre and the layout
 * centre stay the same point and the centring holds.
 *
 * The ceiling is the gutter box. At 1.45 the longest line comes to about 848px
 * inside 1052px of usable width at the desktop rung, and the type steps down
 * with the box below that, so the ratio holds rather than the pixel count.
 */
const TAG_BIG = 1.45;

/* ---------------------------------------------------------------------- *
   The tech field
 * ---------------------------------------------------------------------- */

/*
  The field's shape. Every tile carries a technology — there are no empty ones.

  It used to be a hand-written map of `#` and `.`, roughly half filled, on the
  reasoning that scattered tiles read better than striped ones. What it actually
  produced was 45 grey discs with nothing in them, which read as a loading state:
  a tile that is drawn but empty looks like a logo that failed, not like the
  field breathing.

  Repeating the 16 marks is the better answer, and the two counts do the
  scattering for free. Filling column-major with 10 rows advances the cycle by
  10 each column, and 10 mod 16 steps the starting mark 0, 10, 4, 14, 8, 2, 12,
  6 across the nine — so no two adjacent columns begin on the same logo and
  nothing lines up vertically.

  Ten rows, not eight: a column has to stay taller than the viewport for its
  whole drift, or it runs out of tiles and shows a gap at one end. Ten covers a
  2280px-tall window at the largest tile size.

  Nine columns, so the field still runs off both edges on a 1920px screen —
  stopping short of them would turn it into an island with the headline marooned
  in the middle of it.
*/
const FIELD_COLS = 9;
const FIELD_ROWS = 10;

/*
  Where each column sits in its own travel at the start and end of the phase,
  as a fraction of the slack between the column and the viewport.

  Both ends are inside [0, 1] by construction, so a column can never expose the
  gap above or below itself however tall the window is. Alternating signs are
  the whole effect: neighbouring columns passing each other in opposite
  directions is what reads as depth, where a field moving as one block would
  just read as the page scrolling.
*/
const COL_DRIFT = [
  [0.1, 0.78],
  [0.82, 0.14],
  [0.06, 0.7],
  [0.76, 0.08],
  [0.12, 0.84],
  [0.8, 0.18],
  [0.08, 0.74],
  [0.86, 0.22],
  [0.16, 0.8],
] as const;

/*
  Per-column reveal, in phase fractions.

  Staggered OUTWARD FROM THE CENTRE, not left to right. A left-to-right wipe
  spends its whole offset on one axis, so by the time the section had scrolled
  far enough in to be worth looking at, the left columns were at 0.8 and the
  right ones at nothing — it read as half a field rather than as a field
  arriving. Keying the offset to a column's distance from the middle makes the
  two sides symmetrical, and a 0.012 step over four columns is small enough next
  to the 0.22 fade that the whole field washes in together.

  Every column starts after 0, so the field is genuinely absent at rest and only
  exists once you have scrolled into it.
*/
const COL_START = 0.02;
const COL_IN = 0.012;
const COL_SPAN = 0.22;

/** The badge over the headline, on its own reveal rather than its parent's. */
const BADGE_IN = [0.06, 0.26] as const;

/*
  Per-word reveal of the headline.

  The stagger is spread across a fixed window rather than stepped per word, so
  rewording the headline changes how fast it writes on and never how long it
  takes — a per-word step would push the last word past the pin as soon as
  someone added a line.
*/
const WORD_START = 0.12;
const WORD_RUN = 0.18;
const WORD_SPAN = 0.1;

/*
  The headline, one word per span so it can write itself on.

  `[…]` in the content marks the accent run. A marker beats a nested structure
  here because the run has to survive being chopped into words — "cold]," has to
  come out accented AND keep its comma, which a `{ text, accent }` pair either
  splits in the wrong place or forces the content to spell out by hand.
*/
function splitWords(line: string): { text: string; accent: boolean }[] {
  let accent = false;

  return line.split(' ').map((raw) => {
    if (raw.startsWith('[')) accent = true;
    const word = { text: raw.replace(/[[\]]/g, ''), accent };
    if (raw.includes(']')) accent = false;
    return word;
  });
}

const HEAD_LINES = whyContent.stack.headline.map(splitWords);
const HEAD_WORDS = HEAD_LINES.reduce((n, line) => n + line.length, 0);

type Tile = { name: string; src?: string };

/**
 * The field, every tile filled by cycling `techStack`.
 *
 * Column-major, because a column is the unit that moves, and the cycle runs
 * across the whole field rather than restarting per column — which is what
 * staggers the repeat. With 16 technologies in 90 tiles each one lands five or
 * six times, never twice in the same row of adjacent columns.
 */
function buildField(): Tile[][] {
  return Array.from({ length: FIELD_COLS }, (_, c) =>
    Array.from({ length: FIELD_ROWS }, (_, r) => {
      const name = techStack[(c * FIELD_ROWS + r) % techStack.length] as string;
      return { name, src: techLogos[name] };
    }),
  );
}

/**
 * Why Velocity — one 376vh pinned sequence.
 *
 * One panel stays put for the whole run while its contents are swapped by
 * scroll position: a field of technology tiles drifts past the headline, hands
 * over to the two-part tagline centred on a black screen, and the tagline then
 * climbs to the top of the panel and stays there while the four stat rows come
 * up underneath it. Nothing here animates on a timer; every value is a function
 * of how far you have scrolled.
 *
 * The rows are the one thing NOT inside the panel. They are ordinary page
 * content below it, so they arrive at the wheel's own rate rather than being
 * swapped in across a few hundred pixels of stage — which is what the last beat
 * used to be, and what made it feel both fast and abrupt. The panel is above
 * them and `.wo-head` carries an opaque band, so the heading covers them if they
 * ever do pass behind it.
 */
export function Why() {
  const stageRef = useRef<HTMLDivElement>(null);
  const buildRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLHeadingElement>(null);
  const firstHalfRef = useRef<HTMLSpanElement>(null);
  const secondHalfRef = useRef<HTMLSpanElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  /**
   * `.wo-head`'s top padding, cached — it is a constant per width.
   *
   * It used to be read with `getComputedStyle` inside `apply`, which runs every
   * frame: measured on the running page, one full style resolution per frame
   * for a number that only changes when the stylesheet's breakpoints do. The
   * value is re-read on resize, which is the only thing that can move it.
   *
   * `null` means "not measured yet", which is also what a resize sets it back
   * to — the next frame does the read and fills it in, so there is one place
   * that knows how to obtain it rather than two.
   */
  const headPadRef = useRef<number | null>(null);

  /**
   * How much the tagline actually grows, capped to the room it has.
   *
   * `TAG_BIG` is the wish; this is what the window allows. Measured once per
   * width: the line's own ink against the gutter box it sits in, so the scale
   * can never push a glyph past the gutter — and on a phone, where the line
   * already wraps to three and fills its box, it resolves to 1 and the line
   * simply does not grow. Which is right: there is no room to grow into.
   */
  const tagScaleRef = useRef<number | null>(null);

  useEffect(() => {
    const invalidate = () => {
      headPadRef.current = null;
      tagScaleRef.current = null;
    };
    window.addEventListener('resize', invalidate);
    return () => window.removeEventListener('resize', invalidate);
  }, []);

  const reduced = useReducedMotion();
  const field = useMemo(buildField, []);

  const apply = useCallback(
    (local: number, vh: number) => {
      const stage = stageRef.current;
      const fieldEl = fieldRef.current;
      const build = buildRef.current;
      const cards = cardsRef.current;
      if (!stage || !fieldEl || !build || !cards) return;

      /*
        `local` is pixels past the stage's top edge, so `vh / 2 + local` is how
        far that edge has travelled since it crossed the halfway line — and what
        is left of the journey from there is the stage's height less that half
        screen.
      */
      const half = vh / 2;
      const p = clamp01((half + local) / (stage.offsetHeight - half));

      /* ---- Phase 1: the tech field --------------------------------- */
      const t = clamp01(p / FIELD_END);
      const fieldHeight = fieldEl.offsetHeight;

      Array.from(fieldEl.children).forEach((node, i) => {
        const column = node as HTMLElement;
        const drift = COL_DRIFT[i % COL_DRIFT.length] as readonly [number, number];
        const slack = column.offsetHeight - fieldHeight;

        /*
          Centre the column when it is shorter than the viewport instead of
          driving it off one edge — only reachable on a window taller than ten
          tiles, but the alternative there is a visible gap.
        */
        const y =
          slack > 0 ? -slack * (drift[0] + (drift[1] - drift[0]) * t) : (fieldHeight - column.offsetHeight) / 2;

        column.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;

        const from = COL_START + Math.abs(i - (COL_DRIFT.length - 1) / 2) * COL_IN;
        column.style.opacity = String(seg(t, from, from + COL_SPAN));
      });

      if (badgeRef.current) {
        badgeRef.current.style.opacity = String(seg(t, BADGE_IN[0], BADGE_IN[1]));
      }

      /*
        The headline writes itself on a word at a time rather than fading as one
        block — the same vocabulary the contact headline uses, and the thing
        that gives the long approach something to do.
      */
      Array.from(wordsRef.current?.querySelectorAll<HTMLElement>('.tf-w') ?? []).forEach((word, i) => {
        const from = WORD_START + (i / Math.max(1, HEAD_WORDS - 1)) * WORD_RUN;
        word.style.opacity = String(seg(t, from, from + WORD_SPAN));
      });

      /* ---- Phase 1 → 2 handover ------------------------------------ */
      const stackOpacity = 1 - seg(p, BUILD_OUT[0], BUILD_OUT[1]);

      build.style.opacity = String(stackOpacity);
      /*
        And it stops catching the mouse as soon as it is gone.

        This box is `inset: 0` — the whole panel — so once it has faded it is an
        invisible sheet between the pointer and the four rows below, and every
        hover on a row landed on it instead. Opacity alone does not stop that;
        `pointer-events` is the only thing that does.
      */
      build.style.pointerEvents = stackOpacity > 0.01 ? 'auto' : 'none';

      /* ---- Phases 2 and 3: the tagline, half at a time ------------- */
      if (firstHalfRef.current) {
        firstHalfRef.current.style.opacity = String(seg(p, TAG_1[0], TAG_1[1]));
      }
      if (secondHalfRef.current) {
        secondHalfRef.current.style.opacity = String(seg(p, TAG_2[0], TAG_2[1]));
      }

      /* ---- Phase 4: the heading climbs to the top of the panel ------ */

      /*
        Measured, not declared. `.wo-head` parks the line 146px down — the bar's
        own height and the 80px of air under it — and the line is centred when
        its top edge is half a screen up less half of itself. The lift is the gap
        between those two, so it is right on a laptop, on a 4K monitor and on a
        phone held sideways, none of which share a number.

        `Math.max(0, …)` for the window short enough that the centred position is
        already above the parked one: there the heading simply does not travel,
        which is better than it sliding downwards into place.
      */
      if (headRef.current && taglineRef.current) {
        if (headPadRef.current === null) {
          headPadRef.current = parseFloat(getComputedStyle(headRef.current).paddingTop);
        }
        const parked = headRef.current.offsetTop + headPadRef.current;
        const lift = Math.max(0, half - taglineRef.current.offsetHeight / 2 - parked);
        const rise = seg(p, TAG_RISE[0], TAG_RISE[1]);
        const y = lift * (1 - rise);

        headRef.current.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;

        /*
          The same progress drives the size, so the two are one move rather than
          two that happen to overlap — it arrives at the top exactly as it
          finishes shrinking. See `TAG_BIG`.
        */
        if (tagScaleRef.current === null) {
          const el = taglineRef.current;
          const held = el.style.transform;
          el.style.transform = 'none';
          const range = document.createRange();
          range.selectNodeContents(el);
          const ink = range.getBoundingClientRect().width;
          el.style.transform = held;
          const side = parseFloat(getComputedStyle(el).paddingLeft) * 2;
          const room = el.clientWidth - side;
          tagScaleRef.current =
            ink > 0 ? Math.max(1, Math.min(TAG_BIG, room / ink)) : 1;
        }

        const big = tagScaleRef.current;
        const scale = 1 + (big - 1) * (1 - rise);
        taglineRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }

      /* ---- Phase 5: the rows come up underneath it ------------------ */

      /*
        Opacity only. Where they are is the page's business — they are in flow
        below the panel and a spacer sets how far below, which is what makes the
        last beat scroll at the wheel's rate instead of being driven.
      */
      cards.style.opacity = String(seg(p, CARDS_IN[0], CARDS_IN[1]));

      /* ---- Phase 6: and then it all stops ---------------------------- */

      /*
        The rows are held against the heading by pushing them back down by
        exactly as much as the page has scrolled since they arrived.

        `land` is measured rather than written: it is where the rows' own flow
        position puts their top edge level with the bottom of `.wo-head`, so it
        follows the band's real height at every breakpoint instead of needing a
        number per breakpoint.

        AND IT READS THE RECT, which the rest of this function deliberately does
        not. `local` arrives smoothed by the hook's catch-up, and the thing being
        cancelled here is the raw scroll — holding against a value that lags the
        wheel by a few pixels is not a hold, it is a wobble. Everything else
        stays on the smoothed value; this one needs the truth.
      */
      const land = cards.offsetTop - (headRef.current?.offsetHeight ?? 0);
      const held = Math.min(Math.max(0, -stage.getBoundingClientRect().top - land), HOLD * vh);

      cards.style.transform = held > 0.5 ? `translate3d(0, ${held.toFixed(1)}px, 0)` : 'none';
    },
    [],
  );

  useScrollScrub(stageRef, apply, { catchUp: 0.4, enabled: !reduced });

  /*
    Reduced motion: land on the end states.

    Production returns early here and never touches the cards, which leaves
    them at the stylesheet's `opacity: 0` — the four stats are invisible for
    anyone with the OS setting on. That is a bug, not a design decision, so
    this build reveals them instead. It is the one behaviour here that is
    deliberately not a copy.
  */
  useEffect(() => {
    if (!reduced) return;

    for (const column of Array.from(fieldRef.current?.children ?? []) as HTMLElement[]) {
      column.style.opacity = '1';
    }
    if (badgeRef.current) badgeRef.current.style.opacity = '1';
    for (const word of Array.from(wordsRef.current?.querySelectorAll<HTMLElement>('.tf-w') ?? [])) {
      word.style.opacity = '1';
    }

    /* The end of the run: the field gone, the heading parked, the table up. */
    if (buildRef.current) {
      buildRef.current.style.opacity = '0';
      buildRef.current.style.pointerEvents = 'none';
    }
    if (headRef.current) headRef.current.style.transform = 'none';
    if (taglineRef.current) taglineRef.current.style.transform = 'none';
    if (cardsRef.current) {
      cardsRef.current.style.opacity = '1';
      cardsRef.current.style.transform = 'none';
    }
  }, [reduced]);

  return (
    <div className="why-stage" ref={stageRef}>
      <div className="why-sticky">
        <div className="ws-stack" ref={buildRef}>
          {/*
            The field is decorative here and nowhere else: every technology in it
            is already named in the list below, which is what a screen reader
            gets. Reading 90 tiles — most of them repeats, half of them bare —
            would be worse than reading the 16 names once.
          */}
          <div className="ws-field" aria-hidden="true" ref={fieldRef}>
            {field.map((column, c) => (
              <div className="wf-col" key={c}>
                {column.map((tile, r) => (
                  <div className="wf-cell" key={r}>
                    {tile.src ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img data-tech={tile.name} src={tile.src} alt="" />
                    ) : (
                      <span>{tile.name}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <ul className="sr-only">
            {techStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>

          <div className="ws-build">
            <span className="tf-badge" ref={badgeRef}>
              <b>{techStack.length}</b>
              <i>{whyContent.stack.badgeLabel}</i>
            </span>
            <h3 className="tf-head" ref={wordsRef}>
              {HEAD_LINES.map((line, i) => (
                <span className="tf-line" key={i}>
                  {line.map((word, j) => (
                    /*
                      The space is a sibling of the word, never inside it: a
                      trailing space in an inline-block is trimmed, which runs
                      the whole line together into one word.
                    */
                    <Fragment key={j}>
                      <span className="tf-w">
                        {word.accent ? <em>{word.text}</em> : word.text}
                      </span>
                      {j < line.length - 1 ? ' ' : null}
                    </Fragment>
                  ))}
                </span>
              ))}
            </h3>
          </div>
        </div>

        {/*
          The band the heading ends up in, inside the panel rather than below it.

          It is a band and not just the line because the rows pass behind it: it
          has to be opaque, and it has to be opaque from the top of the window
          down, or a slice of a row shows between the bar and the heading.
        */}
        <div className="wo-head" ref={headRef}>
          <h2 className="ws-tagline" ref={taglineRef}>
            <span className="wt1" ref={firstHalfRef}>
              {whyContent.headline.lead}
            </span>
            <span className="wt2" ref={secondHalfRef}>
              <em>&nbsp;{whyContent.headline.emphasis}</em>
            </span>
          </h2>
        </div>
      </div>

      {/*
        How far below the panel the rows start, and so when they reach the window
        — the one number that decides the whole last beat. It is in the
        stylesheet rather than here because nothing in this file reads it.
      */}
      <div className="wo-gap" aria-hidden="true" />

      <div className="why-grid ws-cards" ref={cardsRef}>
        {stats.map((stat, i) => (
          <div className="why-stat" key={stat.id}>
            {/*
              The step number, from position rather than from content: it is
              an index, not a fact about the row, and keeping it out of
              `stats` means reordering the list cannot leave a 03 above an 02.
            */}
            <i className="why-step" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </i>
            <b>{stat.value}</b>
            <span>{stat.label}</span>
            <p>{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
