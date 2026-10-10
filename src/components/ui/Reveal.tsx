'use client';

import { motion } from 'framer-motion';
import { useMemo, useRef, type ElementType, type HTMLAttributes, type Ref } from 'react';
import { useReducedMotion, useReveal } from '@/hooks';
import { cn } from '@/lib/cn';
import { quartOut } from '@/lib/motion';

interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Render as the real element — `article`, `h2`, … — not a wrapper. */
  as?: ElementType;
}

/**
 * The site's generic scroll-in: 34px up, fading, once, when the element's top
 * passes 86% of the viewport. 0.8s on GSAP's `power3.out`.
 *
 * Two things are deliberate:
 *
 * 1. It renders AS the element it animates rather than wrapping it. A wrapper
 *    would break every layout that reveals a grid child (`.member`,
 *    `.pillar`) — the extra div becomes the grid item and the card inside it
 *    stops stretching.
 * 2. The curve is the exact quartic, not a CSS transition. The conventional
 *    easeOutQuart bezier measured ~0.04 below production through the middle of
 *    the fade, which reads as a draggier reveal.
 */
export function Reveal({ as, className, children, ...props }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const shown = useReveal(ref);
  const reduced = useReducedMotion();

  // motion.create builds a component per tag, so it must not run every render.
  const Tag = useMemo(() => motion.create((as ?? 'div') as ElementType), [as]);

  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={cn('reveal', shown && 'is-in', className)}
      initial={reduced ? false : { opacity: 0, y: 34 }}
      animate={shown || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: quartOut }}
      {...props}
    >
      {children}
    </Tag>
  );
}
