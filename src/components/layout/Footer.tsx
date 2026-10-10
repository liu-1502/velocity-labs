import { footerContent } from '@/content/site';
import { Wordmark } from './Wordmark';

export function Footer() {
  return (
    <footer className="footer">
      <Wordmark />
      <span className="foot-copy">{footerContent.copyright(new Date().getFullYear())}</span>
      {/*
        The wordmark again, at page scale, standing on the foot of the document.

        Live text, not artwork. The material is painted on in CSS — see
        `.footer .foot-mark .brand` — which keeps the mark in the site's own
        letterforms, crisp at any pixel density, and the same two words the
        header carries rather than a picture of them.

        `aria-hidden`: it IS those same two words, set as an ornament. Announcing
        them twice would make the footer read as "velocity labs … velocity labs"
        and say nothing new either time.
      */}
      <span className="foot-mark" aria-hidden="true">
        <Wordmark />
      </span>
    </footer>
  );
}
