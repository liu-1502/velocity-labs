import type { MetadataRoute } from 'next';
import { siteConfig } from '@/content/site';

/*
 * `force-static` so this survives `output: 'export'`.
 *
 * A metadata route is a Route Handler underneath, and an exported site has no
 * request to handle — Next refuses to build it until it is told the output is
 * the same every time. It is: this function reads nothing but `siteConfig`.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
