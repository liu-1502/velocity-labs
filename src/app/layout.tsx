import type { Metadata, Viewport } from 'next';
import { Footer, Header, ScrollProgress, SmoothScroll } from '@/components/layout';
import { siteConfig } from '@/content/site';
import { inter, spaceGrotesk } from './fonts';
import './globals.css';
// Ported production stylesheet. Imported AFTER globals so its unlayered
// rules win over Tailwind's utility layer where the two overlap.
import './site.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'product studio',
    'software development',
    'fintech',
    'web3',
    'MVP development',
    'Southeast Asia',
  ],
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <SmoothScroll />
        <ScrollProgress />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
