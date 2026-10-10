'use client';

import { Fragment, useCallback, useEffect, useRef } from 'react';
import { PolyButton } from '@/components/ui';
import { contactContent, siteConfig } from '@/content/site';
import { useReducedMotion, useScrollScrub } from '@/hooks';
import { clamp01, seg } from '@/lib/motion';

/**
 * Closing section: three arcs opening outward and a headline written in, both
 * scrubbed by scroll position rather than fired once.
 *
 * It was a full-bleed pixel-art clip under a scrim with the copy on a blurred
 * card. The card existed because the clip was busy enough to need one — remove
 * the clip and the card has no job, so the copy sits directly on the page and
 * the only thing behind it is line work.
 *
 * Everything here is a function of scroll, so scrolling back up runs it
 * backwards: the characters go out the way they came in and the arcs close.
 * A one-shot reveal was here first and could only ever play forwards.
 *
 * The clip that used to sit behind this section is gone — file, poster and the
 * `contactContent.video` field that pointed at them. The rings are the backdrop
 * now.
 */

/**
 * The arcs, in the SVG's own square space.
 *
 * Radius is `START + (END - START) * t + i * GAP` — the ring index ADDS a fixed
 * distance rather than multiplying a shared scale. With a scale the gaps grew
 * with the rings, and a per-ring phase offset on top of that made them cross
 * over each other: measured mid-run, the inner ring rendered 733px wide against
 * the middle one's 691. One shared `t` plus a constant offset is what keeps them
 * a fixed distance apart the whole way.
 */
const RING_COUNT = 3;
/*
  180. It went 72 -> 120 -> 180, and the reason is the same each time: at 72 the
  three arcs sat within 5% of the viewport's width of one another, close enough
  to read as one thick stroke rather than as three, and 120 only half-solved it
  now that the stroke is 3px rather than 1.5.

  Only the gap moves. `CLEAR_AT` is derived from the INNERMOST ring, which is the
  one at `base` with no offset added, so it is untouched by this — the outer two
  simply leave the window earlier than they did.
*/
const RING_GAP = 180;
const RING_START = 30;

/** What the innermost ring keeps of the outermost's brightness. */
const RING_DIM = 0.6;
/**
 * The radius at which a ring has left the window completely, in viewBox units.
 *
 * Under `preserveAspectRatio="xMidYMid slice"` the circle is scaled uniformly by
 * `max(W, H) / 1473`, so it covers the window's corners once its rendered radius
 * reaches `hypot(W, H) / 2`. Converting that back into viewBox units gives the
 * expression below.
 *
 * It has to be measured per window rather than kept as a constant, because that
 * uniform scale depends on the window's SHAPE. A 375 x 812 phone clears at 811
 * and a 1440 x 900 laptop at 868, against the 1041 a square window would need —
 * and 1041 was the fixed value this used while the SVG still stretched each axis
 * on its own.
 */
function ringClear(width: number, height: number) {
  return (1473 * Math.hypot(width, height)) / (2 * Math.max(width, height));
}

/**
 * Where in the section's run the innermost ring leaves the window.
 *
 * The growth used to run to a flat 1150 while the ring left at 1041, which put
 * that moment at `(1041 - 30) / (1150 - 30)` of the way through. Holding the
 * FRACTION rather than the end radius is what keeps the button's highlight on
 * the same beat now that the leaving radius moves with the window.
 *
 * It is also the whole of the bug this fixes: on a phone the ring now leaves at
 * 811, and against an end of 1150 that happened at 70% of the run — the last
 * third of the section had nothing left in it to watch.
 */
const CLEAR_AT = 0.903;

/**
 * How far the closing image is allowed to come up.
 *
 * 1, and it took three goes to get here.
 *
 * At 0.38 it was a faint band across the bottom; at 0.82 with a dark scrim over
 * the copy it was full-bleed but brown, because 18% of page-black plus a scrim
 * is two layers of grey over an orange gradient. Both of those existed to keep
 * the headline's accent half legible on an accent-coloured field. That half is
 * white now — see `.contact .contact-inner h2 em` — so neither is needed, and
 * the picture is simply the picture.
 */
const BED_MAX = 1;

/*
  The section is pinned for its whole run — see `.contact-sticky` in site.css.
  That is what lets every value be measured against the section's own travel:
  the copy is centred on the screen and holds still from the first frame to the
  last, so nothing can finish off-screen the way it did when this scrubbed
  against the headline's position in a section that scrolled past.
*/

/** Characters of the headline, each tagged with whether it is in the accent half. */
const WORDS: Array<Array<{ ch: string; accent: boolean }>> = (() => {
  const out: Array<Array<{ ch: string; accent: boolean }>> = [];
  const push = (text: string, accent: boolean) => {
    for (const word of text.split(' ')) {
      out.push(Array.from(word, (ch) => ({ ch, accent })));
    }
  };
  push(contactContent.headline.lead, false);
  push(contactContent.headline.emphasis, true);
  return out;
})();

const CHAR_COUNT = WORDS.reduce((n, w) => n + w.length, 0);

/**
 * Where the accent half begins, as a word index.
 *
 * Narrow screens get a forced break here — see `.c-break` in site.css. Derived
 * from the content rather than written as a number, so editing the headline
 * cannot leave the break in the middle of a phrase.
 */
const ACCENT_FROM = contactContent.headline.lead.split(' ').length;

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringsRef = useRef<SVGSVGElement>(null);
  const bedRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();

  const apply = useCallback((local: number, vh: number) => {
    const section = sectionRef.current;
    const head = headRef.current;
    const bed = bedRef.current;
    if (!section || !head || !bed) return;

    /*
      0 as the section's top edge enters from the bottom, 1 when its bottom edge
      meets the viewport's — so the run covers the approach AND the pin, which is
      `vh + (height - vh)`, the section's own height.

      `local` is pixels past that top edge, and it arrives smoothed by the
      hook's catch-up, so reading the rect again here would throw the scrub away
      and snap the rings to the wheel.

      Measuring only the pinned part left a dead screen before it: the section
      takes a full viewport of scrolling to arrive, and across all of that `local`
      was negative, so every value clamped to 0 and there was nothing to look at.
    */
    const p = clamp01((vh + local) / section.offsetHeight);

    /*
      `r` is set per frame rather than a transform, because the gap between the
      rings has to be a constant and a transform can only multiply it.
    */
    /*
      The rings grow across the PINNED run, not across the approach as well.

      `p` counts both, because the section needs a value the whole way up. But
      spending the approach on growth meant the rings were already half-grown by
      the time anyone could look at them: measured on a 375 x 812 phone against a
      1786px section, `p` is 812 / 1786 = 0.455 at the moment the section's top
      reaches the top of the window, so the innermost ring arrived at r = 423 —
      a rendered diameter of 466px on a 375px screen, already off both sides.
      The rest of the run then finished by the halfway mark and the back half of
      the section held a still frame.

      Starting the growth where the section arrives gives it the whole pinned
      run, H - vh of scrolling, and starts it small enough to be worth watching.
    */
    const arrive = vh / section.offsetHeight;
    const grow = seg(p, arrive, 1);
    const clear = ringClear(window.innerWidth, window.innerHeight);
    const end = RING_START + (clear - RING_START) / CLEAR_AT;
    const base = RING_START + (end - RING_START) * grow;
    /*
      Brightness follows SIZE, not time: a ring is faintest when it is smallest
      and reaches full strength as it opens out. Ramping opacity on its own early
      slice made a tiny ring arrive at full brightness and then just get bigger.
    */
    /*
      Brightness follows size, from nothing. The exponent is what keeps the rings
      invisible while they are small enough for their two arcs to close into an
      oval; 1.4 held them down well past that point, so most of the run was
      spent at a quarter of the brightness they end on. 1.1 clears the oval and
      then gets out of the way.
    */
    const fade = Math.pow(grow, 1.1);
    const circles = Array.from(ringsRef.current?.querySelectorAll('circle') ?? []);
    circles.forEach((circle, i) => {
      circle.setAttribute('r', (base + i * RING_GAP).toFixed(1));
      /*
        Fainter the further in, so the three read as one wash dying out towards
        the middle of the screen rather than as three equal strokes: the
        innermost arc carries 40% of the brightness and the outermost all of it.
      */
      circle.style.opacity = String(fade * (RING_DIM + (1 - RING_DIM) * (i / (RING_COUNT - 1))));
    });

    /*
      The light the arcs are reading as. It builds with them rather than sitting
      there from the section's first frame, which would give the copy a warm
      cast before anything had arrived to explain it.
    */
    section.style.setProperty('--glow', fade.toFixed(3));

    /*
      One slice per character, each 0.25 long against starts spread over 0.70 —
      so they overlap and several are part-lit at once. That overlap is the
      effect: a hard cut-off would read as a wipe, not as writing.
    */
    const chars = Array.from(head.querySelectorAll('.c-char')) as HTMLElement[];
    /*
      The copy waits for the pin. Until then the sticky block is still sliding up
      from the bottom of the screen, and writing a headline on across the bottom
      edge reads as a mistake rather than as an entrance.
    */
    chars.forEach((char, i) => {
      const from = 0.25 + (i / Math.max(1, CHAR_COUNT - 1)) * 0.35;
      char.style.opacity = String(seg(p, from, from + 0.14));
    });

    if (subRef.current) subRef.current.style.opacity = String(seg(p, 0.72, 0.8));

    /*
      The button is up and settled BEFORE the rings finish leaving, because the
      moment they do is the moment it gets highlighted — a sweep across a button
      that is still fading in would be a highlight of nothing.
    */
    if (ctaRef.current) {
      ctaRef.current.style.opacity = String(seg(p, 0.8, 0.88));
      ctaRef.current.classList.toggle('is-clear', base >= clear);
    }

    /*
      The closing image waits for the arcs to be GONE, not merely faint.

      It shared the button's own 0.8-0.88 window for a while, so the two landed
      together. That was fine while the image was a full-bleed wash with no edge
      of its own — the arcs simply passed over a gradient. It stopped being fine
      when the image became an inset card with corners: the arcs then cut across
      a visible edge, and two unrelated shapes crossing each other reads as a
      mistake rather than as a transition.

      `grow >= CLEAR_AT` is the frame the innermost arc's radius passes the
      window's half-diagonal — the arcs are not dimmed at that point, they are
      outside the viewport entirely, so there is nothing left to overlap. It is
      the same test that lights the button, one line up.

      The cost is that the button now arrives first and the card a beat later.
      That is the right way round: the arcs are the section's backdrop until they
      leave, and the card is what replaces them.
    */
    bed.style.opacity = (seg(grow, CLEAR_AT, 1) * BED_MAX).toFixed(3);
  }, []);

  useScrollScrub(sectionRef, apply, { catchUp: 0, enabled: !reduced });

  /* Reduced motion: land on the end state rather than never arriving at it. */
  useEffect(() => {
    if (!reduced) return;
    Array.from(ringsRef.current?.querySelectorAll('circle') ?? []).forEach((circle, i) => {
      const clear = ringClear(window.innerWidth, window.innerHeight);
      circle.setAttribute('r', String(RING_START + (clear - RING_START) / CLEAR_AT + i * RING_GAP));
      circle.style.opacity = String(RING_DIM + (1 - RING_DIM) * (i / (RING_COUNT - 1)));
    });
    sectionRef.current?.style.setProperty('--glow', '1');
    ctaRef.current?.classList.add('is-clear');
    if (bedRef.current) bedRef.current.style.opacity = String(BED_MAX);
    for (const el of [
      ...Array.from(headRef.current?.querySelectorAll('.c-char') ?? []),
      subRef.current,
      ctaRef.current,
    ]) {
      if (el instanceof HTMLElement) el.style.opacity = '1';
    }
  }, [reduced]);

  return (
    <section className="contact" id="contact" ref={sectionRef}>
      <div className="contact-sticky">
        {/*
          The closing image. Decorative and nothing else — it carries no meaning
          the copy over it does not already carry, and it is not there at all
          until the arcs have gone.
        */}
        <div className="contact-bed" aria-hidden="true" ref={bedRef} />
        {/*
        `slice`, not `none` and not `meet`.

        It was `none`, which scales the two axes independently — the circles are
        drawn in a square box and the section is not square, so every one of them
        rendered as an ellipse of the section's own proportions. On a phone that
        is 375 x 812: measured, each ring came out at a 0.462 width-to-height
        ratio, three tall narrow ovals.

        `meet` is the option that would letterbox them into a small circle in the
        middle, which is presumably why `none` was reached for. `slice` is the
        third: one uniform scale chosen to COVER the box, with the overflow
        cropped. The rings stay circular and still run off the frame at the
        sides, which was the point of `none` in the first place.
      */}
        <svg
          className="contact-rings"
          viewBox="0 0 1473 1473"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
          ref={ringsRef}
        >
          {Array.from({ length: RING_COUNT }, (_, i) => (
            <circle
              key={i}
              cx="736.5"
              cy="736.5"
              r={RING_START + i * RING_GAP}
              stroke="url(#contact-ring)"
              /*
                3, up from 1.5 — heavier than the page's hairlines, because
                these are not rules. They are the only drawn thing in a section
                that is otherwise one sentence on black, and they are already
                reduced to two arcs each by the gradient that fades their tops
                and bottoms away.

                `non-scaling-stroke` in the stylesheet means this is 3 CSS px at
                every radius rather than 3 viewBox units, so it stays the same
                weight as the rings grow from 30 to 1150.
              */
              strokeWidth={3}
              fill="none"
            />
          ))}
          <defs>
            {/*
              One gradient for all three, measured against each circle's OWN box
              rather than the canvas.

              `userSpaceOnUse` was wrong here. It pins the fade to a fixed band
              of the viewBox, which only lines up with a ring at its final
              radius — a ring small enough to sit inside that band came out
              accent the whole way round, so the early frames drew three
              complete ovals instead of six arcs. Against its own box every ring
              fades at its own top and bottom whatever size it is, and only its
              left and right are ever drawn.
            */}
            <linearGradient
              id="contact-ring"
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              {/*
                A narrow band — the accent lives in the middle 12% of each
                ring's height and everything else is the page. Wider stops left
                enough of the top and bottom drawn that a ring read as a closed
                oval rather than as two arcs.
              */}
              {/*
                orange-400, not orange-500: these are hairlines at the edge of
                the frame, and the brand colour at full strength read as a drawn
                line rather than as light.
              */}
              <stop offset="0.22" stopColor="var(--color-bg)" />
              <stop offset="0.44" stopColor="var(--color-accent-light)" />
              <stop offset="0.56" stopColor="var(--color-accent-light)" />
              <stop offset="0.78" stopColor="var(--color-bg)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="contact-inner">
          {/*
          Split per character, but grouped by word with real spaces between the
          groups: one span per character with `&nbsp;` for the gaps would leave
          the line no legal place to break, and this headline runs to two lines.

          The whole string is repeated for assistive tech, since the split spans
          would otherwise be announced letter by letter.
        */}
          <h2 ref={headRef}>
            <span className="sr-only">
              {contactContent.headline.lead} {contactContent.headline.emphasis}
            </span>
            <span aria-hidden="true">
              {WORDS.map((word, w) => (
                <Fragment key={w}>
                  {/*
                    The break between the two halves, on narrow screens only.

                    Left to wrap on its own the line filled to "…matters to" and
                    dropped "us" alone onto a second line — an orphan, and one
                    that splits the accent phrase across the break rather than at
                    it. A block element between two inline-blocks is what forces
                    the wrap; `display: none` above the breakpoint leaves the
                    natural wrap alone.
                  */}
                  {w === ACCENT_FROM ? <i className="c-break" aria-hidden="true" /> : null}
                  <span className="c-word">
                    {word.map((c, j) => (
                      <span className="c-char" key={j}>
                        {c.accent ? <em>{c.ch}</em> : c.ch}
                      </span>
                    ))}
                  </span>
                  {/*
                  The gap is a sibling of the word boxes, never a child.
                  `.c-word` is an inline-block, and a space at the END of one is
                  trimmed — measured, every space in the headline vanished and it
                  rendered as "Whatmatterstoyou,".
                */}
                  {w < WORDS.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </span>
          </h2>

          <p ref={subRef}>{contactContent.subhead}</p>

          <div className="contact-cta" ref={ctaRef}>
            <PolyButton href={`mailto:${siteConfig.email}`} variant="light" size="lg" withArrow>
              {contactContent.cta.label}
            </PolyButton>
          </div>
        </div>
      </div>
    </section>
  );
}
