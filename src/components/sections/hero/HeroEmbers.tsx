'use client';

import { useEffect, useRef } from 'react';

/** Particle count, drift speed and radius ranges are the production values. */
const COUNT = 46;

interface Ember {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
}

/**
 * Ember field painted behind the hero video.
 *
 * It sits at `z-index: -1`, so it is only ever seen in the moment before the
 * clip has decoded its first frame — the hero would otherwise flash flat black
 * on a cold load. `Hero` fades it out as soon as the video reports `playing`.
 */
export function HeroEmbers({ hidden }: { hidden: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Reduced motion: the original skips this entirely, leaving a bare canvas.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /*
      Canvas takes a resolved colour string — it cannot read `var(--accent)` —
      so the accent is pulled out of the stylesheet once here. It used to be the
      brand orange hardcoded in the draw call, which meant the embers silently
      kept the old colour whenever the brand changed.
    */
    const accentHex = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();
    const [, r, g, b] = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(accentHex) ?? [];
    const accentRgb =
      r && g && b
        ? `${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)}`
        : '249,115,22'; // orange-500, for when the token is not a plain hex

    let width = 0;
    let height = 0;
    let embers: Ember[] = [];

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    resize();

    embers = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.4,
      speed: Math.random() * 0.5 + 0.15,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    window.addEventListener('resize', resize);

    let frame = 0;
    const loop = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#0b0b0d';
      context.fillRect(0, 0, width, height);

      for (const ember of embers) {
        ember.y -= ember.speed;
        // Recycle from the bottom, at a fresh horizontal position.
        if (ember.y < -5) {
          ember.y = height + 5;
          ember.x = Math.random() * width;
        }
        context.beginPath();
        context.arc(ember.x, ember.y, ember.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${accentRgb},${ember.opacity})`;
        context.fill();
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-fallback"
      style={{ opacity: hidden ? 0 : 1 }}
      aria-hidden="true"
    />
  );
}
