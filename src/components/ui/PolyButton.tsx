'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Lucide `arrow-up-right`, inlined.
 *
 * Lucide's own geometry, not a redraw — it ships under ISC, which permits
 * commercial use without attribution in the output. Inlined rather than pulling
 * in `lucide-react` because this is the only icon the site uses.
 */
export function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

interface PolyButtonProps {
  href: string;
  children: ReactNode;
  /** `light` is the white primary, `dark` the outlined secondary. */
  variant?: 'dark' | 'light';
  size?: 'md' | 'lg';
  /** Adds the arrow that swaps out diagonally on hover. */
  withArrow?: boolean;
  className?: string;
}

/**
 * The site's only button. Chamfered frame, cursor spotlight, optional arrow.
 *
 * Exists as one component rather than a class you hand-apply because the
 * spotlight needs a mousemove listener and three separate layers in the markup —
 * duplicating that at every call site is how the four buttons would drift apart.
 *
 * Renders `<a>` for in-page anchors and mailto (Lenis intercepts those to scroll
 * them smoothly, and Link would fight it) and `<Link>` for real routes, which is
 * also what `next/no-html-link-for-pages` wants.
 */
export function PolyButton({
  href,
  children,
  variant = 'dark',
  size = 'md',
  withArrow = false,
  className,
}: PolyButtonProps) {
  const classes = cn(
    'btn-poly',
    variant === 'light' && 'btn-poly-light',
    size === 'lg' && 'btn-poly-lg',
    className,
  );

  const inner = (
    <>
      <span className="btn-poly-label">{children}</span>
      {withArrow ? (
        // Two copies: the first leaves top-right on hover, the second arrives
        // from bottom-left.
        <span className="btn-poly-icon" aria-hidden="true">
          <Arrow />
          <Arrow />
        </span>
      ) : null}
    </>
  );

  const isRoute = !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('http');

  if (isRoute) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {inner}
    </a>
  );
}
