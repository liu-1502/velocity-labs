import type { MetadataRoute } from 'next';
import { caseStudies } from '@/content/case-studies';
import { siteConfig } from '@/content/site';

/*
 * `force-static` so this survives `output: 'export'`.
 *
 * A metadata route is a Route Handler underneath, and an exported site has no
 * request to handle — Next refuses to build it until it is told the output is
 * the same every time. It is: this function reads nothing but `siteConfig`.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    /*
      One entry per case study. Driven off the content rather than listed by
      hand, so a project added to `work.ts` cannot be left out of the sitemap.
    */
    ...caseStudies.map((study) => ({
      url: `${siteConfig.url}/work/${study.slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
