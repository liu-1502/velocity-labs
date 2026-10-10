import { Reveal } from '@/components/ui';
import { partners, workContent } from '@/content/work';

/**
 * Client and design-partner logos, in a band of their own.
 *
 * It used to be the last block inside Work, under the pinned card rail. On its
 * own it can carry a rule top and bottom, the way the careers band does, and
 * its spacing comes from the section's padding rather than a margin.
 *
 * A ruled wall on desktop, an auto-scrolling marquee below 760px — that split
 * lives entirely in site.css. The list is rendered TWICE because the mobile
 * marquee needs a second copy to loop against; on desktop the CSS hides
 * everything from the 8th child on, which is exactly the duplicate half.
 */
export function Partners() {
  return (
    <section className="section partners-band" id="partners">
      {/* A section heading like every other band's, centred over the wall. */}
      <div className="section-head">
        <Reveal as="h2">{workContent.partnersLabel}</Reveal>
      </div>
      <Reveal className="partners">
        <div className="partners-marquee">
          <div className="pm-track">
            {[...partners, ...partners].map((partner, i) => (
              <span
                className="plogo"
                key={`${partner.name}-${i}`}
                style={{ '--logo-s': partner.scale ?? 1 } as React.CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.logo} alt={i < partners.length ? partner.name : ''} />
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
