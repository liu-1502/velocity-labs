export { Contact } from './Contact';
export { Hero } from './hero/Hero';
/*
  Editorial treatment. The previous pinned-video section is still on disk as
  `./PhilosophyVideo.tsx` (renamed from Philosophy.tsx — a `philosophy/` folder
  beside a `Philosophy.tsx` file is the same path on macOS, and TypeScript
  refuses the ambiguity). To restore it:
      export { Philosophy } from './PhilosophyVideo';
*/
export { Philosophy } from './philosophy';
export { Careers, Team } from './team';
export { Partners, Work } from './work';
export { Why, WhyIntro } from './why';
