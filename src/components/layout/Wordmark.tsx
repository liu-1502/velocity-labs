import type { ElementType } from 'react';
import { siteConfig } from '@/content/site';

interface WordmarkProps {
  /** `a` in the header, `span` in the footer — matching production. */
  as?: ElementType;
  href?: string;
}

/** "velocity.labs" with the dot in accent. */
export function Wordmark({ as: Tag = 'span', href }: WordmarkProps) {
  return (
    <Tag className="brand" href={href}>
      {siteConfig.wordmark.first}
      <span>.</span>
      {siteConfig.wordmark.second}
    </Tag>
  );
}
