'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PolyButton } from '@/components/ui';
import { heroContent } from '@/content/site';
import { useReducedMotion, useScrolled, useScrollScrub } from '@/hooks';
import { cn } from '@/lib/cn';
import { clamp01, EASE_POWER2_OUT, seg } from '@/lib/motion';
import { AnimatedHeadline } from './AnimatedHeadline';
import { HeroEmbers } from './HeroEmbers';
import { SoundToggle } from './SoundToggle';

/*
  Scroll parallax over the hero's own height: the video bed drifts down 22% of
  its height while the text block lifts 12% and fades to a quarter opacity.
  `scrub: true` in the original means no catch-up lag, so `catchUp: 0` here.
*/
const MEDIA_SHIFT = 22;
const CONTENT_SHIFT = -12;
const CONTENT_FADE_TO = 0.25;

/** Entrance delays, in seconds, resolved from the production timeline. */
const SUB_DELAY = 0.73;
const ACTIONS_DELAY = 0.93;

/*
  Where the clip's sound starts going and where it is gone, as a fraction of the
  hero scrolled past.

  Nothing for the first two thirds — the hero is still most of what is on screen
  there, and a clip that quietens the moment you touch the wheel reads as a
  fault. From two thirds the next section has the screen, and by a full height
  the hero is behind it and silent.
*/
const AUDIO_FADE = [2 / 3, 1] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [muted, setMuted] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const reduced = useReducedMotion();

  /*
    The scroll cue is reversible: shown whenever the page is at the top of the
    hero, hidden as soon as you scroll down, and back again if you return.

    `useScrolled` is exactly that, so no local state — an earlier version latched
    it permanently, which was wrong: coming back up to the hero left the cue
    missing from a view that otherwise looks untouched.

    Its own threshold default (24px) is used rather than a tighter one; a few px
    of wheel jitter or a trackpad rest should not flick the cue off and on.
  */
  const cueHidden = useScrolled();

  /*
    Autoplay gets blocked in more places than it used to — a muted inline clip
    is usually fine, but iOS may still hold out for a gesture. Retry on
    `canplay`, on window load, and once on the first interaction.
  */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => void video.play().catch(() => undefined);
    play();

    const onFirstGesture = () => play();
    video.addEventListener('canplay', play, { once: true });
    window.addEventListener('load', play, { once: true });
    document.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });
    document.addEventListener('click', onFirstGesture, { once: true });

    const onPlaying = () => setVideoPlaying(true);
    video.addEventListener('playing', onPlaying);
    if (video.readyState >= 3) setVideoPlaying(true);

    return () => {
      video.removeEventListener('canplay', play);
      window.removeEventListener('load', play);
      document.removeEventListener('touchstart', onFirstGesture);
      document.removeEventListener('click', onFirstGesture);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  /*
    The sound follows the hero off the screen.

    Its own listener rather than a line in the parallax scrub below, for two
    reasons: the scrub is disabled under `prefers-reduced-motion`, which would
    leave the clip playing at full volume for the whole page, and volume is not
    motion — someone who has asked for less of it has not asked to be shouted at.

    `volume` is set even while muted, so unmuting part-way down the page starts
    at the level the position implies instead of jumping to full.
  */
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const apply = () => {
      const height = section.offsetHeight || 1;
      const past = clamp01(-section.getBoundingClientRect().top / height);

      video.volume = 1 - seg(past, AUDIO_FADE[0], AUDIO_FADE[1]);
    };

    apply();
    window.addEventListener('scroll', apply, { passive: true });
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('scroll', apply);
      window.removeEventListener('resize', apply);
    };
  }, []);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) void video.play().catch(() => undefined);
  }, []);

  const applyParallax = useCallback((local: number, vh: number) => {
    const media = mediaRef.current;
    const inner = innerRef.current;
    if (!media || !inner) return;

    const height = sectionRef.current?.offsetHeight ?? vh;
    const p = clamp01(local / height);

    media.style.transform = `translateY(${MEDIA_SHIFT * p}%)`;
    inner.style.transform = `translateY(${CONTENT_SHIFT * p}%)`;
    inner.style.opacity = String(1 - (1 - CONTENT_FADE_TO) * p);
  }, []);

  useScrollScrub(sectionRef, applyParallax, { catchUp: 0, enabled: !reduced });

  const entrance = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.6, delay, ease: EASE_POWER2_OUT },
        };

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero-media" ref={mediaRef}>
        <video
          ref={videoRef}
          className="hero-video"
          poster={heroContent.video.poster}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={heroContent.video.src} type="video/mp4" />
        </video>

        <HeroEmbers hidden={videoPlaying} />
      </div>

      {/*
        The scrim and the toggle sit OUTSIDE `.hero-media` on purpose.

        `.hero-media` is what the parallax translates, and anything inside it
        travels along — so a scrim placed inside it was dragged 168px down the
        clip at full scroll and stopped covering the bottom of what it was there
        to cover. Out here its geometry is fixed to the hero itself.

        The parallax no longer runs, now that the hero is pinned, but the nesting
        still matters: it is what the reduced-motion path and any future movement
        would trip over.
      */}
      <div className="hero-scrim" />
      <SoundToggle muted={muted} onToggle={toggleSound} />

      <div className="hero-inner" ref={innerRef}>
        <AnimatedHeadline
          line1={heroContent.headline.line1}
          line2={heroContent.headline.line2}
          struck={heroContent.headline.struck}
          replacement={heroContent.headline.replacement}
        />

        <motion.p className="hero-sub" {...entrance(SUB_DELAY)}>
          {heroContent.subhead}
        </motion.p>

        <motion.div className="hero-actions" {...entrance(ACTIONS_DELAY)}>
          {heroContent.actions.map((action) => (
            <PolyButton
              key={action.href}
              href={action.href}
              variant={action.variant === 'accent' ? 'light' : 'dark'}
              withArrow
            >
              {action.label}
            </PolyButton>
          ))}
        </motion.div>
      </div>

      <div className={cn('hero-cue', cueHidden && 'is-gone')} aria-hidden="true">
        <span />
        Scroll
      </div>
    </section>
  );
}
