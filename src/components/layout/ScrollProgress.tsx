'use client';

import { useEffect, useRef } from 'react';

/**
 * Accent hairline across the top of the viewport tracking overall page
 * progress.
 *
 * Width, not `scaleX`, and no spring — production writes the percentage
 * straight to `style.width` on every scroll event. A spring here adds a visible
 * lag that the real bar does not have.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${scrollable > 0 ? (y / scrollable) * 100 : 0}%`;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />;
}
