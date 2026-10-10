'use client';

import { cn } from '@/lib/cn';

interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

/**
 * Mute/unmute for the hero clip.
 *
 * Both glyphs are always in the markup; CSS shows one and hides the other via
 * the `.on` class, so there is no layout shift on toggle. They are emoji, run
 * through `grayscale(1)` — the same treatment as production. An icon font or
 * inline SVG would render at a different weight and optical size.
 */
export function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      className={cn('sound-toggle', !muted && 'on')}
      onClick={onToggle}
      aria-label="Toggle sound"
      aria-pressed={!muted}
    >
      <span className="si-muted">🔇</span>
      <span className="si-on">🔊</span>
    </button>
  );
}
