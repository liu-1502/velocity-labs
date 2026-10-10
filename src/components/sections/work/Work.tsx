import { Reveal } from '@/components/ui';
import { workContent } from '@/content/work';
import { WorkGrid } from './WorkGrid';

/**
 * Track record: six projects in a 3 × 2 grid. The partner logos are their own
 * band.
 *
 * The horizontal rail this replaced is still here as `Pillars.tsx`, unused, with
 * its CSS still in site.css — see `backups/work-rail-horizontal`. To go back,
 * wrap the heading in `<Pillars>` again in place of `<WorkGrid />`.
 */
export function Work() {
  return (
    <section className="section work" id="work">
      <div className="section-head">
        <Reveal as="h2">
          {workContent.headline.lead} <em>{workContent.headline.emphasis}</em>
        </Reveal>
        <Reveal as="p" className="lede">
          {workContent.lede}
        </Reveal>
      </div>

      <WorkGrid />
    </section>
  );
}
