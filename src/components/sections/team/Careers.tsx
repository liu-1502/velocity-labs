import { Reveal } from '@/components/ui';
import { CareerMarquee, careerHeading } from './CareerMarquee';

/**
 * The career logo band — where the two of them worked before.
 *
 * Built as the clients band is: a centred heading over a ruled wall of marks.
 * The two sections say the same kind of thing in the same shape, one about the
 * people and one about the work.
 *
 * It lives in `team/` because it shares that content file, but it renders after
 * the leadership cards and before the projects.
 *
 * It has to be a direct child of `main`: `.hero ~ *` is what gives every
 * post-hero section its opaque background, and a wrapper would put it out of
 * that selector's reach.
 */
export function Careers() {
  return (
    <section className="section careers" id="careers">
      {/* A section heading like the clients band's, centred over the wall. */}
      <div className="section-head">
        <Reveal as="h2">{careerHeading}</Reveal>
      </div>

      <CareerMarquee />
    </section>
  );
}
