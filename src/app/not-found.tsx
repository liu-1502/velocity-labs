import { PolyButton } from '@/components/ui';

/**
 * 404. Not part of the ported design — production has no such page — so it
 * simply reuses the site's own `.section` / `.kicker` / `.btn` classes rather
 * than inventing a second set of layout primitives.
 */
export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <div style={{ minHeight: '60svh', display: 'grid', placeContent: 'center', gap: '18px' }}>
        <span className="kicker">404</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}>
          This page doesn&apos;t exist.
        </h1>
        <p className="lede" style={{ margin: '0 auto' }}>
          The link may be out of date, or the page may have moved.
        </p>
        <span style={{ justifySelf: 'center' }}>
          <PolyButton href="/" variant="light">
            Back to home
          </PolyButton>
        </span>
      </div>
    </section>
  );
}
