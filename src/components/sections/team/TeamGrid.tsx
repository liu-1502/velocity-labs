import { Reveal } from '@/components/ui';
import { teamMembers } from '@/content/team';

/**
 * The two leadership cards.
 *
 * Two columns on desktop, stacked one above the other below 900px.
 *
 * Below 760px this used to become a horizontal scroll-snap carousel with dot
 * indicators under it, and the dots carried the only state this component had:
 * a scroll listener tracking which card you had swiped to, and a `goTo` that
 * scrolled to the one you tapped. The carousel is gone — a sideways swipe inside
 * a page that is already scrolling vertically left the card parked between snap
 * points — and with it the listener, the state and the `'use client'` directive
 * that existed only to allow them. There is nothing interactive left here.
 */
export function TeamGrid() {
  return (
    <div className="team-grid">
      {teamMembers.map((member) => (
        <Reveal as="article" className="member" key={member.id}>
          {/*
              Plain <img>, not next/image: these are SVGs, which next/image
              passes through unoptimised anyway, and they are drawn to the slot's
              own aspect ratio so there is nothing to resize.
            */}
          <div className="m-portrait">
            {/*
                Two portraits stacked in their own box, not siblings of the role
                badge: `.m-portrait` is a column, so a second image there would
                take a row of its own and push the badge down.
              */}
            <span className="m-photos">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="m-photo" src={member.portrait} alt="" aria-hidden="true" />
              {member.portraitHover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="m-photo m-photo-hover"
                  src={member.portraitHover}
                  alt=""
                  aria-hidden="true"
                />
              )}
            </span>
            {/* The role rides with the portrait, not with the copy. */}
            <span className="m-role">{member.role}</span>
          </div>

          <div className="m-body">
            <h3>{member.name}</h3>
            <p className="m-tag">{member.tagline}</p>
            <ul>
              {member.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
