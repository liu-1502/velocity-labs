import {
  Careers,
  Contact,
  Hero,
  Partners,
  Philosophy,
  Team,
  Why,
  WhyIntro,
  Work,
} from '@/components/sections';

/**
 * Single-page marketing site.
 *
 * Section order maps 1:1 to the nav anchors in `src/content/site.ts`:
 *   #top → #philosophy → #team → #work → #why → #contact
 *
 * `#careers` and `#partners` are the two sections with no nav anchor, and both
 * are logo bands: where the team came from, read before the projects, and who
 * the projects were for, read after them.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      {/*
        The client logos, directly under the hero.

        They used to sit after Work, inside the wrapper below, on the reasoning
        that they are who those projects were FOR and so belong after them. True,
        but it put the one piece of outside evidence on the page at 35% of its
        length — the sixth screen of eighteen — behind the point where most of
        the decision to stay or go has been made.

        Here they answer the question the hero's claim raises, in the slot where
        a B2B page conventionally answers it. The careers band keeps its own
        position after Team, where "they" has a referent.
      */}
      <Partners />
      <Philosophy />
      <Team />
      <Careers />
      <Work />
      {/*
        The wrapper the clients band used to be sticky within. It holds only the
        intro card now; it stays because `.why-intro` is measured against it.
      */}
      <div className="why-open">
        <WhyIntro />
      </div>
      <Why />
      <Contact />
    </>
  );
}
