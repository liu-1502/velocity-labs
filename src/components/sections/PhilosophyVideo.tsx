'use client';

import { useCallback, useEffect, useRef } from 'react';
import { philosophyContent, philosophyPillars } from '@/content/philosophy';
import { useReducedMotion, useReveal, useScrollScrub } from '@/hooks';
import { cn } from '@/lib/cn';
import { clamp01 } from '@/lib/motion';

/*
  Geometry the clip expands FROM.

  These are the formulas the production script interpolates from, and they are
  viewport-derived rather than read off the element — deliberately so, because
  GSAP re-evaluates them on every refresh. Note they use the DESKTOP values at
  every width: the stylesheet has a ≤760px override for the frame's top and
  height, but the script's own values overwrite it on the first scroll update,
  so mobile animates from the desktop geometry too. Reproduced as-is.
*/
const startTop = (vh: number) => Math.round(Math.min(330, Math.max(248, vh * 0.34)));
const startWidth = (vw: number) => Math.min(1080, Math.round(vw * 0.9));
const startHeight = (vw: number) => Math.min(460, Math.round(vw * 0.42));

/** Fraction of the viewport height each scrub runs over (`end: '+=48%'`). */
const EXPAND_SPAN = 0.48;
const HEAD_SPAN = 0.26;

/**
 * Labels are tied to the video's playhead, not to scroll.
 *
 * The clip is a 28s boomerang — it zooms in over the first 14s and back out
 * over the second 14s — so each label appears on the way in and disappears
 * again symmetrically on the way out.
 */
const ZOOM_SECONDS = 14;
const labelThreshold = (index: number, total: number) =>
  ZOOM_SECONDS * 0.06 + (index / total) * ZOOM_SECONDS * 0.82;

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Philosophy — the heading and the clip are pinned together, then the clip
 * scrubs from a contained 1080×460 card out to full-bleed while the heading
 * fades up and away. Once it is edge to edge the video starts, and the six
 * labels surface in sequence as it zooms.
 */
export function Philosophy() {
  const stageRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);

  const reduced = useReducedMotion();

  /*
    Entrance for the heading, on the site's generic reveal trigger (top past 86%
    of the viewport). It stacks with the fade-OUT below instead of fighting it:
    this class animates the three CHILDREN, while `apply` keeps driving the
    parent's own opacity. The two multiply, and the trigger fires while the stage
    is still approaching — `local` is negative there, so headFade is 0 and the
    parent is still fully opaque.
  */
  const headShown = useReveal(headRef);

  /** Rewind and play — fired once, the moment the clip fills the screen. */
  const startVideo = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = 0;
    } catch {
      // Safari can throw if metadata has not landed yet; playing is enough.
    }
    void video.play().catch(() => undefined);
  }, []);

  const apply = useCallback(
    (local: number, vh: number) => {
      const head = headRef.current;
      const frame = frameRef.current;
      if (!head || !frame) return;

      const vw = window.innerWidth;
      const expand = clamp01(local / (EXPAND_SPAN * vh));
      const headFade = clamp01(local / (HEAD_SPAN * vh));

      head.style.opacity = String(1 - headFade);
      head.style.transform = `translateY(${-24 * headFade}px)`;

      frame.style.top = `${lerp(startTop(vh), 0, expand)}px`;
      frame.style.width = `${lerp(startWidth(vw), vw, expand)}px`;
      frame.style.height = `${lerp(startHeight(vw), vh, expand)}px`;
      frame.style.borderRadius = `${24 * (1 - expand)}px`;
      frame.style.borderWidth = `${1 - expand}px`;

      if (expand >= 0.985) startVideo();
    },
    [startVideo],
  );

  useScrollScrub(stageRef, apply, { catchUp: 0.45, enabled: !reduced });

  /* Reduced motion: no scrub at all — the clip simply sits full-width. */
  useEffect(() => {
    if (!reduced) return;

    const frame = frameRef.current;
    if (!frame) return;

    frame.style.width = '100vw';
    frame.style.height = '72vh';
    frame.style.borderRadius = '0';
    frame.style.borderWidth = '0';
    startVideo();
  }, [reduced, startVideo]);

  /* Labels surface and retreat with the playhead. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const total = philosophyPillars.length;
    const thresholds = philosophyPillars.map((_, i) => labelThreshold(i, total));

    const onTimeUpdate = () => {
      const t = video.currentTime;
      // Past the halfway point the clip is zooming back out, so mirror time.
      const effective = t <= ZOOM_SECONDS ? t : 2 * ZOOM_SECONDS - t;

      video.parentElement?.querySelectorAll('.phil-label').forEach((label, i) => {
        label.classList.toggle('shown', effective >= (thresholds[i] ?? 0));
      });
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  /* Don't burn frames decoding a 28s clip that is scrolled off screen. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!startedRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) void video.play().catch(() => undefined);
          else video.pause();
        }
      },
      { threshold: 0.04 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="philv-stage" id="philosophy" ref={stageRef}>
      <div className="philv-sticky">
        <div
          className={cn('section-head philv-head', headShown && 'is-in')}
          ref={headRef}
        >
          <span className="kicker">{philosophyContent.kicker}</span>
          <h2>
            {philosophyContent.headline.lead} <em>{philosophyContent.headline.emphasis}</em>
          </h2>
          <p className="lede">{philosophyContent.lede}</p>
        </div>

        <div className="philv2-frame" ref={frameRef}>
          <video
            ref={videoRef}
            className="philv2-video"
            poster={philosophyContent.video.poster}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={philosophyContent.video.src} type="video/mp4" />
          </video>

          <div className="philv2-scrim" />

          {philosophyPillars.map((pillar) => (
            <span
              key={pillar.id}
              className="phil-label"
              style={
                {
                  '--x': `${pillar.position.x}%`,
                  '--y': `${pillar.position.y}%`,
                  '--d': `${pillar.floatDelay}s`,
                } as React.CSSProperties
              }
            >
              {pillar.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
