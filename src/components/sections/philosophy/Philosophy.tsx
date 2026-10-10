'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { philosophyIntro, philosophyPrinciples } from '@/content/philosophy';
import { useReducedMotion, useScrollScrub } from '@/hooks';
import { cn } from '@/lib/cn';
import { clamp01 } from '@/lib/motion';

/**
 * Philosophy — editorial treatment.
 *
 * A halftone plate is pinned in the right half of the grid and bleeds off the
 * viewport's right edge; the six principles scroll past it on the left. The
 * principle nearest the middle of the viewport is the active one: it comes to
 * full opacity, its hanging numeral picks up the accent, a rule draws across
 * the top of the row, and the plate drifts a few percent down.
 *
 * Replaces the pinned-video treatment in `../Philosophy.tsx`, which is still
 * on disk — point `components/sections/index.ts` back at it to restore.
 *
 * Four moving parts, deliberately. The previous section pinned, scrubbed a clip
 * from a card to full-bleed, played a 28s boomerang and surfaced six labels off
 * the playhead; this one fades rows in once, tracks an active index, and moves
 * the plate. Everything else is static.
 */
/** How far above its resting position the plate starts opening, in px. */
const OPEN_RUN = 80;

/**
 * Degrees the registration mark turns from one principle to the next.
 *
 * It was a whole revolution per principle, which at 228px between rows meant a
 * turn every 228px of scroll — far too fast to read as a turn at all.
 *
 * 90 is also the cross's own symmetry, so the mark comes back to the same shape
 * on every principle and the quarter turn between them is the whole of what you
 * see: it reads as the mark resetting at each number rather than drifting.
 */
const REG_STEP_DEG = 90;

/**
 * How much of each step the mark spends at rest, as a fraction, on EACH side of
 * a principle.
 *
 * Without it the turn is spread evenly over the whole gap, so the mark is at
 * some diagonal for almost the entire scroll and only passes through square on
 * its way past. 0.3 gives a 60% rest band around every principle — square while
 * you are reading one — and does the 90 degrees in the 40% between them.
 */
const REG_REST = 0.3;

export function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /** `--nav-h` in px — where the plate comes to rest. Read, not hardcoded. */
  const stickTopRef = useRef(0);
  /** Top of the hero's copy block in the viewport — measured, see below. */
  const listRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Array<HTMLElement | null>>([]);
  const regRef = useRef<HTMLSpanElement>(null);

  const reduced = useReducedMotion();

  /** Index of the principle currently nearest the middle of the viewport. */
  const [active, setActive] = useState(0);
  /*
    Whether the stage has finished opening.

    Rows do not become current until it has. Row 1 is the one that needs this:
    it is nearest the middle of the window from before the section opens, so its
    accent rule ran its 900ms sweep while the list was still at `opacity: 0` and
    was already at full width by the time anything was drawn. Holding `is-on`
    back means the sweep starts on the frame the row becomes visible.

    Mirrored in a ref so the scrub can compare without re-rendering: the callback
    runs every frame and only calls `setOpened` on the frames it actually flips.
  */
  const [opened, setOpened] = useState(false);
  const openedRef = useRef(false);
  /** Rows that have crossed the reveal line — they stay revealed. */
  const [seen, setSeen] = useState<boolean[]>(() => philosophyPrinciples.map(() => false));

  /*
    Active index is measured against the viewport centre on every frame that
    scroll requests, rather than with an IntersectionObserver band.

    The band version misses when the page jumps — an anchor from the nav, a
    restored scroll position, Home/End — because IO only reports crossings and a
    jump crosses nothing. Measuring distance-to-centre answers correctly from
    any scroll position, and rAF-coalescing keeps it to one layout read per
    frame.
  */
  const pick = useCallback(() => {
    const middle = window.innerHeight / 2;
    let best = 0;
    let bestDistance = Infinity;
    const centres: number[] = [];

    itemsRef.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centre = rect.top + rect.height / 2;
      centres.push(centre);
      const distance = Math.abs(centre - middle);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });

    /*
      The registration mark is SCRUBBED, not animated — it moves exactly as far
      as the reader moved and stops when they stop.

      It used to be a CSS transition fired on every change of `active`, which is
      why it ran on regardless of the scroll: once started, a 1400ms turn plays
      itself out whether the page is still moving or already at rest.

      `position` is a continuous row index — 0 with row 01's centre on the
      window's middle, 1 with row 02's, fractional in between — and the mark
      turns REG_STEP_DEG for each whole step of it.

      Not linearly, though: the fractional part is held flat for REG_REST at
      each end and eased across the middle, so the mark sits square while a
      principle is being read and turns only while the reader is travelling
      between two. Smoothstep rather than a raw ramp, so it leaves and arrives
      at the square without a visible corner.

      Negative, so scrolling DOWN turns the mark anticlockwise and scrolling back
      up winds it clockwise again.

      Written straight to the node. This runs on every scroll frame and a state
      update would re-render the whole section for a number only the CSS reads.
    */
    const reg = regRef.current;
    if (reg) {
      let position = 0;
      const first = centres[0];
      const final = centres[centres.length - 1];

      if (centres.length > 1 && first !== undefined && final !== undefined) {
        if (middle >= final) {
          position = centres.length - 1;
        } else if (middle > first) {
          for (let i = 0; i < centres.length - 1; i += 1) {
            const from = centres[i];
            const to = centres[i + 1];
            if (from === undefined || to === undefined) continue;
            if (middle >= from && middle < to) {
              position = i + (middle - from) / Math.max(1, to - from);
              break;
            }
          }
        }
      }

      const step = Math.floor(position);
      const travel = clamp01((position - step - REG_REST) / (1 - 2 * REG_REST));
      const eased = travel * travel * (3 - 2 * travel);
      const turns = ((step + eased) * REG_STEP_DEG) / 360;
      reg.style.setProperty('--reg-turn', String(reduced ? 0 : -turns));
    }

    setActive(best);
    setSeen((previous) => {
      // Reveal every row at or above the one in view; never un-reveal.
      const next = previous.map((was, i) => was || i <= best);
      return next.some((value, i) => value !== previous[i]) ? next : previous;
    });
  }, [reduced]);

  useEffect(() => {
    let queued = false;

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        pick();
      });
    };

    pick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pick]);

  /*
    The heading is revealed a word at a time, so each word needs to be its own
    box. They are wrapped HERE rather than in the markup because the lines carry
    authored HTML — `<mark>has to <em>live</em></mark> with it.` — and splitting a
    string like that on spaces in JSX would mean parsing the markup by hand.
    Walking text nodes keeps the markup exactly as authored, at any nesting.

    The MutationObserver is not belt-and-braces, it is the whole trick. React owns
    this subtree through `dangerouslySetInnerHTML`, and it restores it from the
    prop at least once after this effect has run — measured on a clean load, the
    wrap completed (`--phil-n` was written, 11 words) and the spans were gone by
    the time anything could read them. Re-wrapping on mutation is what survives
    that, and Fast Refresh, and any future render that touches the line.

    Wrapping disconnects the observer first and re-attaches after, so our own
    DOM writes cannot retrigger it; the `.phil-w` probe makes a second call on an
    already-wrapped heading a no-op rather than nesting spans inside spans.

    `--phil-n` goes on the same element the scrub writes `--phil-p` to, so both
    inherit down to every word together.
  */
  useEffect(() => {
    const head = headRef.current;
    const heading = head?.querySelector('h2');
    if (!head || !heading) return;

    const observer = new MutationObserver(() => wrap());

    const wrap = () => {
      observer.disconnect();

      if (!heading.querySelector('.phil-w')) {
        const texts: Text[] = [];
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) texts.push(walker.currentNode as Text);

        let index = 0;
        for (const node of texts) {
          const fragment = document.createDocumentFragment();
          // Split on whitespace but KEEP it: the gaps stay real text nodes, so
          // the line still breaks between words and `text-wrap: balance` applies.
          for (const part of node.textContent?.split(/(\s+)/) ?? []) {
            if (!part) continue;
            if (/^\s+$/.test(part)) {
              fragment.appendChild(document.createTextNode(part));
              continue;
            }
            const word = document.createElement('span');
            word.className = 'phil-w';
            word.style.setProperty('--i', String(index++));
            word.textContent = part;
            fragment.appendChild(word);
          }
          node.replaceWith(fragment);
        }

        head.style.setProperty('--phil-n', String(index));
      }

      observer.observe(heading, { childList: true, subtree: true });
    };

    wrap();
    return () => observer.disconnect();
  }, []);

  /*
    Scrub the reveal off scroll position rather than firing it once on entry, and
    measure it against THIS SECTION's top edge rather than the heading's.

    Nothing is drawn until that edge has climbed past the hero's copy — so the two
    headlines are never on screen together, which is what the old window allowed:
    measured, `--phil-p` was already 0.38 while the section's top was at 0.45 of
    the window and the hero's copy still ran from 283 to 565.

    The last word lands as the section's top reaches the header, where the heading
    has settled into reading position. `local` is `-rect.top`, hence the negation.

    Written to the SECTION, not the heading: the standfirst and the plate take
    their own slices of the same 0…1, and they are not inside `.phil-head`.

    REVEAL_TAIL carries the window on past the header so the later two beats have
    room to be unhurried. It is the only honest way to slow them: the three slices
    share one 0…1, so pushing the standfirst and the plate later inside a fixed
    window would have SHORTENED their runs and sped them up. The slices below are
    rebalanced against the longer window to leave the heading at the pace it had.
  */
  /*
    TURNED OFF at the author's request: the section shows its content outright.

    `--phil-p` is simply never written now, and every rule that reads it is
    authored as `var(--phil-p, 1)` — so all three beats resolve to their end
    state, which is exactly "already there". The slices themselves are left in
    globals.css rather than deleted: putting the reveal back is restoring this
    one scrub, not rebuilding three animations.

    The three that were on it: `.phil-w` (the heading, word by word), the
    standfirst, and the plate's arrival.
  */

  /*
    The measurement the plate's opening is anchored to.

    `heroCopyTop` sat here too — where the hero's headline begins — and it existed
    only to hold the word reveal back until this section's top had climbed past
    it. That reveal is gone, and so is the measurement.
  */
  useEffect(() => {
    const read = () => {
      stickTopRef.current =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  /*
    The stage opens from a card into the full window, and `--x` is that 0 → 1.
    Every geometry value in the CSS reads off it — the plate's width, margin and
    height, the list's offset from the right, which parts of a row are visible,
    and the cross-fade between the two scrims.

    The window is the last OPEN_RUN px of the approach, not a fraction of the
    viewport. Measured against the plate's resting position rather than against
    the screen, so the card travels the whole page at its own size and only opens
    once it is nearly home — and so the run is the same 80px on a laptop as on a
    tall desktop, where a viewport fraction would have stretched it into a drift.

    `local` is `-rect.top`, so `-local` is where the top of the stage currently
    sits; the plate rides at that top until it sticks.

    Written to `.phil-stage` rather than the section: it is the common ancestor of
    the plate and the list, and scoping it there keeps the heading — which has its
    own scrub on `--phil-p` — out of it.
  */
  const openStage = useCallback((local: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const stickTop = stickTopRef.current;
    const x = clamp01((stickTop + OPEN_RUN + local) / OPEN_RUN);
    stage.style.setProperty('--x', String(x));

    const isOpen = x >= 1;
    if (isOpen !== openedRef.current) {
      openedRef.current = isOpen;
      setOpened(isOpen);
    }
  }, []);

  useScrollScrub(stageRef, openStage, { catchUp: 0, enabled: !reduced });

  /*
    Lead-in above the first row.

    The section finishes opening with the list's top just under the header, which
    put the first row's centre around 176px down a 848px window while `pick()`
    chooses whichever row is nearest the window's MIDDLE. Row 2 was always nearer,
    so row 1 went from unseen to skipped — it had its turn while the section was
    still a closed card with nothing drawn on it.

    Padding rather than a transform: this has to move the row's box, because the
    box is what `pick()` measures. Cleared before measuring, since it is this
    element's own padding and would otherwise compound its previous value.
  */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const first = itemsRef.current[0];
      const last = itemsRef.current[philosophyPrinciples.length - 1];
      const section = sectionRef.current;
      if (!first || !last || !section) return;

      // Cleared before measuring: both are this element's own padding and would
      // otherwise compound their previous values.
      list.style.setProperty('--list-lead', '0px');
      list.style.setProperty('--list-tail', '0px');

      const navH =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
      const lead = Math.max(0, window.innerHeight / 2 - navH - first.offsetHeight / 2);
      list.style.setProperty('--list-lead', `${Math.round(lead)}px`);

      /*
        Run-out below the last row — the mirror of the lead-in above the first,
        and for the same reason.

        The section sticks at `min(0, vh - height)`, which parks its BOTTOM edge
        on the bottom of the window and leaves it there. Measured, row 06's
        centre was still 218px below the window's middle at that point, so row 05
        was nearer the middle for the whole of the pin and `pick()` never chose
        06: its rule never swept, its numeral never took the accent, and the page
        moved on to the next section with the last principle still greyed out.

        So the run-out is whatever it takes to put the last row's centre half a
        window above the section's bottom edge — measured after `--list-lead` is
        written, since that shifts everything below it.
      */
      const belowCentre =
        section.getBoundingClientRect().bottom -
        (last.getBoundingClientRect().top + last.offsetHeight / 2);
      const tail = Math.max(0, window.innerHeight / 2 - belowCentre);
      list.style.setProperty('--list-tail', `${Math.round(tail)}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /*
    The section pins once it has been scrolled through, and the CSS cannot work
    out where that is on its own: the offset is `viewport height - section
    height`, and the section's height depends on its own content reflowing.

    A ResizeObserver rather than a resize listener, because the height changes
    without the window doing anything — fonts finishing, the plate's image
    landing, a principle's copy rewrapping.

    Clamped at 0 so a section shorter than the viewport pins at the top instead
    of being pushed down by a positive offset.
  */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const measure = () => {
      el.style.setProperty('--phil-stick', `${Math.min(0, window.innerHeight - el.offsetHeight)}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /* Reduced motion: every row is already legible, nothing tracks. */
  useEffect(() => {
    if (reduced) setSeen(philosophyPrinciples.map(() => true));
  }, [reduced]);


  return (
    <section className="phil" id="philosophy" ref={sectionRef}>
      <div className="phil-page">
        <div className="phil-head" ref={headRef}>
          <h2>
            {philosophyIntro.headlineLines.map((line, i) => (
              <span className="phil-ln" key={i}>
                {/*
                  The lines carry one <em> for the accent word, so they are
                  written as markup in content rather than assembled here. The
                  strings are authored in this repo, not user input.
                */}
                <span dangerouslySetInnerHTML={{ __html: line }} />
              </span>
            ))}
          </h2>

          {/*
            The standfirst sits straight under the headline, the way the hero puts
            its subhead. It used to live below a hairline rule as its own block;
            that rule and a `.phil-head-foot` wrapper are both gone, and the
            spacing they held open now lives on the elements either side.
          */}
          <div className="phil-standfirst">
            <h3>{philosophyIntro.standfirst}</h3>
          </div>
        </div>

        {/* Plate and list share one grid cell so the plate can sit behind. */}
        <div className="phil-stage" ref={stageRef}>
          <figure className="phil-plate">
            {/*
              Plain <img>, not next/image: the plate is a single decorative
              asset already sized for its slot, and next/image would add a
              wrapper that fights `object-position` inside the sticky box.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/*
              No `--pan`. The plate used to drift 0 → -5% across its own overflow
              as the reader descended; now that it is a pinned full-screen frame
              that drift reads as the frame sliding, not as depth.
            */}
            <img src={philosophyIntro.plate.src} alt={philosophyIntro.plate.alt} />
            {/* `--reg-turn` is written per scroll frame by `pick()` above. */}
            <span className="phil-reg" aria-hidden="true" ref={regRef} />
          </figure>

          <div className="phil-list" ref={listRef}>
            {philosophyPrinciples.map((principle, i) => (
              <article
                key={principle.id}
                className={cn('phil-item', seen[i] && 'is-seen', opened && active === i && 'is-on')}
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
              >
                <span className="phil-num" aria-hidden="true">
                  {principle.number}
                </span>
                <h4>{principle.title}</h4>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
