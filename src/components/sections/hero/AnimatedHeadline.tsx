'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks';
import { cn } from '@/lib/cn';
import { EASE_POWER3_OUT } from '@/lib/motion';

interface AnimatedHeadlineProps {
  line1: string;
  line2: string;
  struck: string;
  replacement: string;
}

/*
  Absolute times from the production GSAP timeline (which itself carries a
  0.15s delay), resolved from its relative positions:

    words   0.15s  →  0.9s each, 0.08s apart, power3.out, from yPercent 115
    strike  1.88s  →  0.55s CSS transition on the ::after rule
    replace 2.43s  →  0.75s max-width transition as "Outcomes" widens in

  The two label times are what `.add(…, '+=0.35')` and `.add(…, '+=0.55')`
  work out to once the earlier tweens have set the timeline's end.

  Only the word tween is still production's. The strike and the replacement have
  since been retimed and rebuilt (the replacement types in per character rather
  than widening in beside the old word), so the numbers below are derived from
  each other instead of transcribed from here.
*/
const WORD_DELAY = 0.15;
const WORD_STAGGER = 0.08;
const WORD_DURATION = 0.7;

/*
  The rest of the timeline is DERIVED, not transcribed.

  Production had strike 1.88s and replace 2.43s as free-standing numbers, and the
  first of those left 750ms of dead air: the second line finished rising at
  0.23s + 0.9s = 1.13s, and nothing happened until 1.88s. The strike now follows
  the words immediately, and every later beat is expressed against the one before
  it, so changing any single value cannot silently desynchronise the rest —
  STRUCK_HOLD went 1000 → 600 as a single edit, and REPLACE_AT followed.

  STRIKE_DRAW is the one number that lives in another file — it must equal the
  `transform` transition on `.t-strike::after` in site.css (and the `mask-size`
  on `.t-ink`, which draws the gap the line runs through).
*/
const STRIKE_AT = (WORD_DELAY + WORD_STAGGER + WORD_DURATION) * 1000;
const STRIKE_DRAW = 600;
const STRUCK_HOLD = 600;
const REPLACE_AT = STRIKE_AT + STRIKE_DRAW + STRUCK_HOLD;

/**
 * "Engineered / for Output Outcomes".
 *
 * Each line rises out of its own overflow-hidden mask, then the word "Output"
 * is struck through and "Outcomes" widens in beside it. The strike and the
 * reveal are CSS transitions on `.t-strike` / `.t-add` — this component only
 * decides when to add the classes, exactly as the original script does.
 */
export function AnimatedHeadline({ line1, line2, struck, replacement }: AnimatedHeadlineProps) {
  const reduced = useReducedMotion();
  const [strikeOn, setStrikeOn] = useState(false);
  const [replaceOn, setReplaceOn] = useState(false);

  useEffect(() => {
    if (reduced) {
      // The stylesheet already holds both at their end state; match it here
      // so the classes agree with what is painted.
      setStrikeOn(true);
      setReplaceOn(true);
      return;
    }

    const strike = window.setTimeout(() => setStrikeOn(true), STRIKE_AT);
    const replace = window.setTimeout(() => setReplaceOn(true), REPLACE_AT);
    return () => {
      window.clearTimeout(strike);
      window.clearTimeout(replace);
    };
  }, [reduced]);

  const word = (index: number) =>
    reduced
      ? {}
      : {
          initial: { y: '115%' },
          animate: { y: '0%' },
          transition: {
            duration: WORD_DURATION,
            delay: WORD_DELAY + index * WORD_STAGGER,
            ease: EASE_POWER3_OUT,
          },
        };

  return (
    <h1 className="hero-title">
      <span className="line">
        <motion.span className="w" {...word(0)}>
          {line1}
        </motion.span>
      </span>
      <span className="line">
        <motion.span className="w" {...word(1)}>
          {line2}{' '}
          {/*
            `aria-hidden`, and a plain span.

            The struck word stays on screen now, which left the h1 reading as
            "Engineered for Output Outcomes" — the strike is drawn by a
            pseudo-element, so nothing in the markup said the word had been
            crossed out and a screen reader announced the two as a list. The
            whole phrase is given to assistive tech once, below, and this copy
            is decoration.

            NOT `<s>`: that element carries a default `text-decoration:
            line-through`, which drew a SECOND rule on top of the one
            `.t-strike::after` draws — two parallel lines through the word. It
            would have earned nothing either, since this subtree is hidden from
            assistive tech anyway.
          */}
          <span
            className={cn('t-strike', strikeOn && 'struck')}
            aria-hidden="true"
          >
            {/*
              The word sits in its own span so the gap the strike runs through
              can be masked onto it. A mask on `.t-strike` would cut the strike
              line too — it is that element's ::after.
            */}
            <span className="t-ink">{struck}</span>
          </span>
          <span className={cn('t-add', replaceOn && 'show')}>
            {/*
              One span per character, each revealed on its own delay.

              This replaced a `clip-path` wipe with `steps()`, which looked wrong:
              steps() divides the WIDTH into equal slices, but letters are not
              equally wide, so every boundary landed mid-glyph — a letter showed
              half-drawn for 125ms before completing. Per-character spans mean a
              character is either fully there or not there at all.

              The word is repeated for assistive tech: the split spans are hidden
              from it, since they would otherwise be announced letter by letter.
            */}
            <em>
              {/*
                The whole swap in one phrase, so what is heard matches what is
                seen: the visible line is a correction, not two nouns in a row.
              */}
              <span className="sr-only">{`not ${struck}, but ${replacement}`}</span>
              <span aria-hidden="true">
                {Array.from(replacement, (char, index) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className="t-char"
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            </em>
          </span>
        </motion.span>
      </span>
    </h1>
  );
}
