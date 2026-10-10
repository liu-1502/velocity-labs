import { Reveal } from '@/components/ui';
import { teamContent } from '@/content/team';
import { TeamGrid } from './TeamGrid';

/**
 * The leadership cards.
 *
 * The career logo marquee used to ride along in a fragment here; it is now
 * `./Careers.tsx` and renders after the Work section instead.
 */
export function Team() {
  return (
    <section className="section team" id="team">
      <div className="section-head">
        <Reveal as="h2">
          {teamContent.headline.lead} <em>{teamContent.headline.emphasis}</em>
        </Reveal>
      </div>

      <TeamGrid />
    </section>
  );
}
