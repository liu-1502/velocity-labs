/** Shared content types. Every entry in `src/content` is typed against these. */

export interface NavLink {
  label: string;
  href: string;
  /** Renders as the filled accent pill in the header. */
  cta?: boolean;
}

export interface PhilosophyPillar {
  id: string;
  label: string;
  /**
   * Position within the philosophy video frame, as a percentage of the
   * frame's width/height. The label is centred on this point.
   */
  position: { x: number; y: number };
  /** Offset (seconds) into the shared float loop, so labels drift out of sync. */
  floatDelay: number;
}

/** One row of the philosophy list — see `components/sections/philosophy`. */
export interface PhilosophyPrinciple {
  id: string;
  /** Display numeral shown hanging in the left margin, e.g. "01". */
  number: string;
  title: string;
  /**
   * One or two sentences naming a concrete practice. These are promises the
   * team has to keep — see the warning in `content/philosophy.ts`.
   */
  body: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Single-letter monogram shown in the avatar tile. */
  initial: string;
  /** Line-art portrait, black on white. See `public/assets/img/team`. */
  portrait: string;
  /** Optional second portrait, cross-faded in while the card is hovered. */
  portraitHover?: string;
  tagline: string;
  highlights: string[];
  /** Optional company logos, relative to /public. */
  logos?: Array<{ src: string; alt: string }>;
}

/** Which illustration a pillar shows above its copy. See `PillarVisual`. */
export type ProjectVisual = 'chip' | 'orbit' | 'call' | 'cube' | 'cards';

export interface Project {
  id: string;
  /** Display order badge, e.g. "01". */
  number: string;
  domain: string;
  title: string;
  description: string;
  visual: ProjectVisual;
  logo?: { src: string; alt: string };
  /**
   * Screenshot for the card's image slot, 16:9 to match `.wg-visual`. Absent
   * means the slot stays the empty placeholder it was.
   *
   * `placeholder` marks a stand-in rather than this project's own screenshot:
   * the slot is tinted so the six read apart, and the image is decorative, so
   * its `alt` is empty.
   */
  shot?: { src: string; alt: string; placeholder?: boolean };
  /**
   * The two colours the hover fill is tinted with, deep end first.
   *
   * The card's hover fill is the SAME artwork the closing section ends on — one
   * file, one set of tones — recoloured per project so each card answers in its
   * own palette. The pair is laid over it as a diagonal ramp and blended in
   * `color` mode, which takes the hue and saturation from the pair and the
   * luminance from the picture: the modelling and the grain survive, only the
   * colour changes.
   *
   * A PAIR rather than the single `hue-rotate` this started as. Rotating hue
   * moves the whole gradient together, and the gradient's own hue span is only
   * 12-26 degrees, so it could never express a project whose artwork runs from
   * one colour to another — Novaland's blue-to-green is 65 degrees on its own.
   *
   * Absent leaves the card the gradient's own orange.
   */
  tint?: readonly [string, string];
  /**
   * The accent colour this project's own page runs on.
   *
   * A case study is that project's screen, not the studio's, so everything the
   * site would paint in its orange — section numerals, kickers, rules, the
   * hover marks — is painted in this instead. It is set as `--accent` on the
   * article, so every rule that already reads that token follows without being
   * touched.
   *
   * NOT either end of `tint`. Those are chosen as the dark and light ends of a
   * FILL and are measured against the fill's own luminance; this is text on the
   * page's #0a0a0a and has to clear 4.5:1 there. Yuzu's fill starts at #0e7a3a,
   * which is 3.64:1 and fails; its accent is #2fbf5f at 8.24:1.
   */
  accent?: string;
  /**
   * Case-study destination. While it is absent the card still shows its hover
   * affordance but is not clickable — filling this in is all that is needed to
   * turn the whole card into a link.
   */
  href?: string;
}

/**
 * One frame in a case study's build gallery.
 *
 * The gallery is a fixed five-slot template (`BUILD_SLOTS` in
 * `components/sections/case`): fewer entries than that leaves the remaining
 * frames empty rather than collapsing the layout, so the rhythm of the section
 * is the same before and after the screenshots arrive.
 */
export interface CaseShot {
  src: string;
  alt: string;
  /** One line under the frame. Omit and the frame carries no caption. */
  caption?: string;
  /**
   * The frame's aspect ratio, as a CSS value — `'2000 / 1422'`.
   *
   * Frames crop to fill, so a frame whose ratio is not the screenshot's own
   * eats the interface at two edges. Set this to the export's real pixel
   * dimensions and nothing is cropped. Omit it only when the shot already
   * matches the 16:10 default.
   */
  ratio?: string;
  /**
   * Fit the WHOLE screenshot inside the frame instead of cropping it to fill.
   *
   * The default is `cover`: the frame's ratio wins and whatever does not fit is
   * cut off. That is right for a capture exported at the frame's own ratio, and
   * wrong for one that is not — there the choice is between cutting the picture
   * and breaking the row, because a frame standing beside another frame has to
   * be the same shape as it.
   *
   * `'contain'` is the third option: keep the frame's ratio, keep the whole
   * picture, and let the frame's own surface show either side of it. Use it for
   * a shot that is not at the row's ratio and cannot afford to lose any of its
   * interface. A correctly exported screenshot never needs it.
   */
  fit?: 'contain';
}

/**
 * The long form of one `Project`.
 *
 * It does not repeat what the project already knows. Title, domain, display
 * number and the hero screenshot all come from the matching entry in
 * `projects` — this adds only what the card had no room for.
 */
export interface CaseStudy {
  /** The `Project.id` this expands. One case study per project, at most. */
  slug: string;
  /** Replaces the card's description at the top of the page when present. */
  summary?: string;
  /** The fact list beside the hero — label/value pairs, in display order. */
  facts: Array<{ label: string; value: string }>;
  /** "The brief", one paragraph per entry. */
  brief: string[];
  /**
   * "What we built" — the gallery.
   *
   * `layout` picks the arrangement, and the two exist because the material
   * does: `feature` is one wide frame over two pairs, for landscape desktop
   * captures; `row` is four portrait frames across, for phone screens, which
   * laid into a landscape grid would be mostly empty space either side.
   * Defaults to `feature`.
   */
  build: {
    lede?: string;
    layout?: 'feature' | 'row';
    shots: CaseShot[];
    /**
     * Phone screens, as a second row under the first gallery — for a project
     * that shipped a web product AND an app, where one set is landscape and the
     * other portrait and neither belongs in the other's grid. Always the
     * four-across row, so `layout` does not apply to it.
     */
    mobile?: CaseShot[];
  };
  /**
   * "How we worked", numbered rows. Omit to inherit the studio's default
   * process from `defaultApproach` — override only where a project genuinely
   * ran differently.
   */
  approach?: Array<{ title: string; body: string }>;
  /** "Outcome". An empty `stats` hides the figure strip entirely. */
  outcome: { stats: Array<{ value: string; label: string }>; body?: string };
}

export interface Partner {
  name: string;
  logo: string;
  /**
   * Optical weight correction, 1 = no change.
   *
   * One height for every logo renders them at wildly different visual masses,
   * because a wordmark six times wider than it is tall carries far more ink at
   * the same height than a near-square glyph does. This multiplies the row's
   * base height per logo so the marks read as equals. See `partners` in
   * `content/work.ts` for where the numbers come from.
   */
  scale?: number;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
  description: string;
}
