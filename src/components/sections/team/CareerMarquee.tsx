import { Reveal } from '@/components/ui';
import { careerRows, teamContent } from '@/content/team';

/*
  The two rows are one wall now, so they are flattened into a single list of
  cells. Keeping them as rows would have meant two grids that could not share
  column widths — the mark in row 1 column 3 would sit on a different vertical
  line from the one below it.
*/
const logos = careerRows.flat();

/**
 * "Where they've built" — a ruled wall of company marks.
 *
 * Built as the clients band is, and for the same reason: the two say the same
 * kind of thing in the same shape, one about the people and one about the work,
 * so a reader meeting the second should recognise the first.
 *
 * It used to be two tracks sliding in opposite directions. The marquee is gone
 * along with the duplicated lists it needed — a track travels -50% of its own
 * width to loop seamlessly, which is why every logo was rendered twice.
 */
export function CareerMarquee() {
  return (
    <Reveal className="careers-wall">
      <div className="cm-track">
        {logos.map((logo) => (
          <span className="cm-logo" key={logo.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt={logo.alt} />
          </span>
        ))}
      </div>
    </Reveal>
  );
}

/** The band's heading, so Careers.tsx can set it beside the wall. */
export const careerHeading = teamContent.careerLabel;
