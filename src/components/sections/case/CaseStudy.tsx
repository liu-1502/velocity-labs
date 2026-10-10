import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Arrow, PolyButton, Reveal } from '@/components/ui';
import { caseStudyContent, defaultApproach } from '@/content/case-studies';
import type { CaseStudy as CaseStudyContent, Project } from '@/types';

/**
 * How many empty frames the build gallery draws while a project has no
 * screenshots at all, per layout.
 *
 * Only then. A project WITH screenshots renders exactly those and no padding —
 * three pictures followed by two empty boxes reads as a section that failed to
 * load, not as one still being filled. The counts are each layout's own full
 * arrangement, so the empty state is the shape the real shots will land in; see
 * `.cs-shots` in site.css.
 */
export const BUILD_SLOTS = { feature: 5, row: 4 } as const;

/**
 * The outcome section, temporarily hidden.
 *
 * The figures are not signed off yet, and a case study's results block is the
 * one part of it a reader is entitled to take literally. Flip this back when
 * `outcome` in `case-studies.ts` carries numbers the client has confirmed — the
 * content and the markup are both still here.
 */
const SHOW_OUTCOME = false;

const { sections, next: nextCopy, cta, backLabel } = caseStudyContent;

/** The `01 / The brief` pair that opens each section. */
function SectionHead({
  number,
  kicker,
  title,
  lede,
}: {
  number: string;
  kicker: string;
  title?: string;
  lede?: string;
}) {
  return (
    <div className="cs-head">
      <Reveal as="div" className="cs-head-rule">
        <span className="cs-num">{number}</span>
        <span className="kicker">{kicker}</span>
      </Reveal>
      {title && <Reveal as="h2">{title}</Reveal>}
      {lede && (
        <Reveal as="p" className="lede">
          {lede}
        </Reveal>
      )}
    </div>
  );
}

interface CaseStudyProps {
  study: CaseStudyContent;
  /** The matching entry in `projects` — it owns the title, domain and hero shot. */
  project: Project;
  /** The project after this one in the grid, for the pager. Absent on the last. */
  next?: { project: Project; href: string };
}

/**
 * One case study, the whole page below the header.
 *
 * Everything the card already carries is read off `project` rather than copied
 * into `case-studies.ts`, so a title changed in one place cannot disagree with
 * itself in the other.
 */
export function CaseStudy({ study, project, next }: CaseStudyProps) {
  const approach = study.approach ?? defaultApproach;
  const layout = study.build.layout ?? 'feature';
  const shots =
    study.build.shots.length > 0
      ? study.build.shots
      : Array.from({ length: BUILD_SLOTS[layout] }, () => undefined);
  const mobile = study.build.mobile ?? [];

  return (
    <article
      className="cs"
      /*
        The project's colours — the two tints for the closing panel, and the
        accent the rest of the page runs on. Set on the article so everything
        inside inherits, and inline because they are per project.
      */
      style={
        {
          ...(project.tint
            ? { '--wg-a': project.tint[0], '--wg-b': project.tint[1] }
            : {}),
          /*
            The whole page runs on this project's colour rather than the site's
            orange — see `accent` on `Project`. Setting the token is all it takes:
            every rule that already reads `--accent` follows.
          */
          ...(project.accent ? { '--accent': project.accent } : {}),
        } as CSSProperties
      }
    >
      {/* ---- hero ---------------------------------------------------- */}
      <header className="section cs-hero">
        <Link className="cs-back" href="/#work">
          <span className="cs-back-icon" aria-hidden="true">
            <Arrow />
          </span>
          {backLabel}
        </Link>

        <Reveal as="span" className="kicker cs-kicker">
          {project.number} — {project.domain}
        </Reveal>
        <Reveal as="h1">{project.title}</Reveal>
        <Reveal as="p" className="lede cs-summary">
          {study.summary ?? project.description}
        </Reveal>

        <Reveal as="dl" className="cs-facts">
          {study.facts.map((fact) => (
            <div className="cs-fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </Reveal>
      </header>

      {/*
        The card's own screenshot, full width.

        Deliberately the same file: the image the reader clicked is the image
        that greets them, which is what makes the navigation feel like a zoom
        rather than a jump. A project with no shot yet gets the empty frame.
      */}
      <div className="cs-shot-wrap">
        {project.shot && !project.shot.placeholder ? (
          <div className="cs-shot">
            <img src={project.shot.src} alt={project.shot.alt} decoding="async" />
          </div>
        ) : (
          <div className="cs-shot is-empty" aria-hidden="true" />
        )}
      </div>

      {/* ---- 01 the brief -------------------------------------------- */}
      <section className="section cs-section">
        <SectionHead number={sections.brief.number} kicker={sections.brief.kicker} />
        <div className="cs-prose">
          {study.brief.map((paragraph, i) => (
            <Reveal as="p" key={i}>
              {paragraph}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- 02 what we built ---------------------------------------- */}
      <section className="section cs-section">
        <SectionHead
          number={sections.build.number}
          kicker={sections.build.kicker}
          lede={study.build.lede}
        />
        {/*
          The real shots, or five empty frames while there are none. An empty
          one is `aria-hidden` and carries no caption, so a reader on a screen
          reader meets an empty section rather than five announcements of
          nothing.
        */}
        <div className={layout === 'row' ? 'cs-shots cs-shots-row' : 'cs-shots'}>
          {shots.map((shot, i) =>
            shot ? (
              <figure
                /*
                  `is-contain` keeps the whole screenshot inside the frame —
                  see `fit` on `CaseShot`. Only a shot that is not at the row's
                  ratio needs it.
                */
                className={shot.fit === 'contain' ? 'cs-frame is-contain' : 'cs-frame'}
                key={shot.src}
                style={shot.ratio ? { aspectRatio: shot.ratio } : undefined}
              >
                <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
                {shot.caption && <figcaption>{shot.caption}</figcaption>}
              </figure>
            ) : (
              <div className="cs-frame is-empty" key={`slot-${i}`} aria-hidden="true" />
            ),
          )}
        </div>

        {/*
          The app, under the web product. A second grid rather than more cells
          in the first: these are portrait, and a phone screen sharing a row
          with a desktop capture is either a sliver or four times its height.
        */}
        {mobile.length > 0 && (
          <div className="cs-shots cs-shots-row cs-shots-second">
            {mobile.map((shot) => (
              <figure
                className="cs-frame"
                key={shot.src}
                style={shot.ratio ? { aspectRatio: shot.ratio } : undefined}
              >
                <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
                {shot.caption && <figcaption>{shot.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* ---- 03 how we worked ---------------------------------------- */}
      <section className="section cs-section">
        <SectionHead number={sections.approach.number} kicker={sections.approach.kicker} />
        <ol className="cs-steps">
          {approach.map((step, i) => (
            <Reveal as="li" className="cs-step" key={step.title}>
              <span className="cs-step-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---- 04 outcome ---------------------------------------------- */}
      {SHOW_OUTCOME && (
      <section className="section cs-section">
        <SectionHead number={sections.outcome.number} kicker={sections.outcome.kicker} />
        {/*
          The strip only exists when there is a figure to put in it. An empty
          one would be four boxes of punctuation, and a case study with nothing
          to report is better off saying so in a sentence.
        */}
        {study.outcome.stats.length > 0 && (
          <Reveal as="div" className="cs-stats">
            {study.outcome.stats.map((stat) => (
              <div className="cs-stat" key={stat.label}>
                <span className="cs-stat-value">{stat.value}</span>
                <span className="cs-stat-label">{stat.label}</span>
              </div>
            ))}
          </Reveal>
        )}
        {study.outcome.body && (
          <div className="cs-prose">
            <Reveal as="p">{study.outcome.body}</Reveal>
          </div>
        )}
      </section>
      )}

      {/* ---- pager + CTA --------------------------------------------- */}
      <section className="section cs-foot">
        {next && (
          <Link className="cs-next" href={next.href}>
            <span className="kicker">{nextCopy.kicker}</span>
            {/*
              The arrow sits INSIDE the name, not beside it.

              The name is centred, and anything that shares the row with it
              shifts that centre. As a child it can be positioned against the
              name's own right edge and taken out of flow, so the name is dead
              centre at rest and stays exactly where it is when the arrow fades
              in on hover.
            */}
            <span className="cs-next-title">
              <span className="cs-next-label">
                {next.project.title}
                <span className="cs-next-icon" aria-hidden="true">
                  <Arrow />
                </span>
              </span>
            </span>
          </Link>
        )}

        <div className="cs-cta">
          <Reveal as="h2">{cta.headline}</Reveal>
          <Reveal as="div" className="cs-cta-action">
            {/*
              A box of the button's own size for the sheen to live in.

              `.cs-cta-action` is the centring flex row and runs the full 680 —
              a pseudo-element on it would sweep a band across the whole column.
              `PolyButton` already uses both of its own pseudo-elements for the
              frame, so the light needs a wrapper either way. Same construction
              as `.contact-cta` on the home page.
            */}
            <span className="cs-cta-glow">
              <PolyButton href="/#contact" variant="light" withArrow>
                {cta.label}
              </PolyButton>
            </span>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
