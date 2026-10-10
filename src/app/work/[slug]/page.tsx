import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseStudy } from '@/components/sections/case';
import { caseStudies, caseStudyFor } from '@/content/case-studies';
import { projects } from '@/content/work';

/**
 * One case study per project, at `/work/<project id>`.
 *
 * Statically generated: the content is six objects in `src/content`, so there
 * is nothing to render at request time. `dynamicParams = false` makes any other
 * slug a 404 at build rather than an empty page at runtime.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

/** The project and its case study, or null when either half is missing. */
function load(slug: string) {
  const study = caseStudyFor(slug);
  const index = projects.findIndex((project) => project.id === slug);
  const project = index === -1 ? undefined : projects[index];
  if (!study || !project) return null;

  /*
    The pager walks the grid in order and wraps, so the last project leads back
    to the first instead of dead-ending. Six pages, one ring.
  */
  const nextProject = projects[(index + 1) % projects.length];
  const next = nextProject ? { project: nextProject, href: `/work/${nextProject.id}` } : undefined;

  return { study, project, next };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = load(slug);
  if (!data) return {};

  const description = data.study.summary ?? data.project.description;

  return {
    title: data.project.title,
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: data.project.title,
      description,
      url: `/work/${slug}`,
      type: 'article',
      ...(data.project.shot && !data.project.shot.placeholder
        ? { images: [{ url: data.project.shot.src, alt: data.project.shot.alt }] }
        : {}),
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = load(slug);
  if (!data) notFound();

  return <CaseStudy study={data.study} project={data.project} next={data.next} />;
}
