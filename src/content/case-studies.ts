import type { CaseStudy } from '@/types';

/**
 * The long form of each project in `work.ts`.
 *
 * ⚠️ TEMPLATE COPY — READ BEFORE SHIPPING.
 *
 * Nothing in `brief` or `outcome.body` below was supplied by the client. Each
 * one restates and expands what that project's card already says and nothing
 * more, so the pages have a shape to design against while the real write-ups
 * are being written. Replace them.
 *
 * Two things are deliberately NOT invented, because a case study is evidence
 * and a made-up number is worse than a missing one:
 *
 * 1. `outcome.stats` carries only figures the site already publishes — BTSE's
 *    daily volume and Yuzu's AUM, both of which are in those projects'
 *    descriptions. The other four are empty arrays, and the figure strip simply
 *    does not render. Fill them from the engagement, not from memory.
 * 2. `build.shots` is empty everywhere. The gallery renders its five slots as
 *    empty frames until real screenshots land — same arrangement, same spacing,
 *    so dropping them in later changes nothing else on the page.
 *
 * `approach` is omitted on every project on purpose: they all inherit
 * `defaultApproach`, which is the studio's own process as already stated in
 * `philosophy.ts`. Override it on a project only where that project genuinely
 * ran differently.
 */

export const caseStudyContent = {
  /** Shown above the title on every case page. */
  backLabel: 'All work',
  sections: {
    brief: { number: '01', kicker: 'The brief' },
    build: { number: '02', kicker: 'What we built' },
    approach: { number: '03', kicker: 'How we worked' },
    outcome: { number: '04', kicker: 'Outcome' },
  },
  /** The pager at the foot of the page. */
  next: { kicker: 'Next project' },
  cta: {
    headline: 'Have something like this to build?',
    label: 'Get in Touch',
  },
} as const;

/**
 * The process every case page falls back to.
 *
 * Four of the six principles in `philosophy.ts`, in the order a project meets
 * them. They are the same promises, so they stay worded the same — if one
 * changes there, change it here.
 */
export const defaultApproach = [
  {
    title: 'Discovery before specification',
    body: 'Before a feature was specced we watched people do the job it replaces. The spec usually changes after that, and it is cheaper to change it then.',
  },
  {
    title: 'A shared channel, not an account manager',
    body: 'The client had a channel with the engineers writing the code, and a standing invitation to the morning standup.',
  },
  {
    title: 'Something on staging every week',
    body: 'Work was judged by using it rather than by reading a percentage. Two-week plans, re-planned on Fridays, so a wrong assumption cost a sprint instead of a quarter.',
  },
  {
    title: 'Reviewed, tested, handed over',
    body: 'Every change was read by a second engineer before it merged. Tests, a README and a recorded walkthrough came with the handover.',
  },
] as const;

export const caseStudies: CaseStudy[] = [
  {
    slug: 'novaland',
    summary:
      "A loyalty and rewards programme for one of Vietnam's largest real estate groups, taken from an internal points scheme to a consumer app its members actually open.",
    facts: [
      { label: 'Client', value: 'Novaland Group' },
      { label: 'Sector', value: 'Real estate · HOSE listed' },
      { label: 'Scope', value: 'Mobile app · Loyalty platform' },
      { label: 'Status', value: 'Shipped' },
    ],
    brief: [
      'Novaland runs hospitality, entertainment and residential brands that each had their own idea of what a member was. Points earned in one place could not be spent in another, and the group had no single view of who its best customers were.',
      'The job was one programme across all of them: a tier a member can see themselves moving up, offers worth opening the app for, and a redemption flow short enough to finish standing at a counter.',
    ],
    build: {
      lede: 'The member-facing app and the platform underneath it.',
      /*
        Four phone screens across, not the landscape arrangement: these are the
        app's own store graphics, and a portrait capture dropped into a 16:9
        frame is a thin strip of interface between two wide margins.

        Exported at 923 x 2000, which is the row's own default ratio — the
        `ratio` on each is therefore redundant today and written anyway, so a
        re-export at some other size cannot silently start cropping.
      */
      layout: 'row',
      shots: [
        {
          src: '/assets/work/novaland/home.webp',
          alt: 'App home — points balance, the six service categories, and the offers and rewards rails below them',
          ratio: '923 / 2000',
        },
        {
          src: '/assets/work/novaland/entertainment.webp',
          alt: 'Entertainment brand page — Nova Dreams with its offers tab and the information tab behind it',
          ratio: '923 / 2000',
        },
        {
          src: '/assets/work/novaland/account.webp',
          alt: 'Account — membership tier with points to the next rank, above settings, FAQ and support',
          ratio: '923 / 2000',
        },
        {
          src: '/assets/work/novaland/redeem.webp',
          alt: 'Redemption — points detail with its transaction record, and the QR code a cashier scans',
          ratio: '923 / 2000',
        },
      ],
    },
    outcome: {
      stats: [],
      body: 'Live across the group’s brands, with points earned and redeemed against one balance.',
    },
  },
  {
    slug: 'btse',
    summary:
      'Back-office tooling and the data pipelines underneath it for a global crypto exchange — the part of an exchange its customers never see and its finance team lives in.',
    facts: [
      { label: 'Client', value: 'BTSE' },
      { label: 'Sector', value: 'Crypto exchange' },
      { label: 'Scope', value: 'Back office · Data pipelines' },
      { label: 'Status', value: 'Shipped' },
    ],
    brief: [
      'An exchange settling institutional clients has to answer one question every month, per client, without argument: what is owed, and how was it worked out. BTSE was answering it in spreadsheets assembled by hand from several systems.',
      'We built the invoicing side of the back office — client and fee configuration, a calculation that shows its own working line by line, and a settlement summary a client can be sent as it stands.',
    ],
    build: {
      lede: 'Invoice management, fee configuration, and the breakdown that explains a settlement.',
      shots: [
        {
          src: '/assets/work/btse/client-configs.webp',
          alt: 'Client config for Nimbus Exchange — fixed fees, maker/taker tiers, isolated markets, and a quick preview of the net settle amount',
          ratio: '2000 / 1250',
        },
        {
          src: '/assets/work/btse/clients.webp',
          alt: 'Client management — searchable list of clients with code, alias, nature, contract start and status',
          ratio: '2000 / 1250',
        },
        {
          src: '/assets/work/btse/invoice-breakdown.webp',
          alt: 'Invoice calculation breakdown — settlement summary and the detailed trading service fee working',
          ratio: '2000 / 1250',
        },
      ],
    },
    outcome: {
      stats: [{ value: 'USD 100M+', label: 'Daily trading volume handled' }],
      body: 'Every figure on an invoice traces back to the trades behind it, so a disputed line is opened rather than argued.',
    },
  },
  {
    slug: 'yuzu',
    summary:
      'End-to-end Web3 architecture — front end, back end, infrastructure and smart contracts — for a platform curating on-chain structured products.',
    facts: [
      { label: 'Client', value: 'Yuzu Money' },
      { label: 'Sector', value: 'Fintech · Web3' },
      { label: 'Scope', value: 'FE · BE · Infra · Smart contracts' },
      { label: 'Status', value: 'Shipped' },
    ],
    brief: [
      'Yuzu packages on-chain structured products for people who want the yield without running the positions themselves. That means the hard parts are all on the same side of the line: the contracts that hold the money, the infrastructure that watches them, and an interface that has to make both legible.',
      'We took the whole stack, which is the only way the three stay consistent — a balance shown in the app is the balance the contract holds, and the history behind it reconciles.',
    ],
    build: {
      lede: 'The member dashboard, the earn flow, and the transaction history behind both.',
      /*
        No `ratio` overrides: every frame is the site's 16:9. These three are
        exported at 1782x856 and 2000x1422, so the frame crops the difference —
        15% off the sides of the first, 21% off the top and bottom of the other
        two. Re-exported at 16:9 they fill their frames exactly.
      */
      shots: [
        {
          src: '/assets/work/yuzu/dashboard.webp',
          alt: 'Member dashboard — total balance, savings and interest earned above a growth chart and recent activity',
          ratio: '2000 / 1422',
        },
        {
          src: '/assets/work/yuzu/earn.webp',
          alt: 'Earn — global metrics beside the USDC to syzUSD conversion panel',
          ratio: '2000 / 1422',
        },
        {
          src: '/assets/work/yuzu/transaction-history.png',
          alt: 'Transaction history — earnings tab listing stakes and redemptions with amount, fee and status',
          ratio: '2000 / 1422',
          /*
            Same story as `portfolio.png` on Digital Collectibles, and the same
            answer. This is a partial capture — 1782 x 856, AR 2.08 — standing
            beside `earn.webp` at AR 1.41, and it was declared at its own ratio
            so nothing would be cropped off it. That made the frame a letterbox
            next to a landscape, and the row came out ragged.

            A frame in a row has to be the same shape as the frame beside it.
            The row keeps its ratio and the shot is CONTAINED in it: the row is
            square again and not a pixel of the capture is lost, it simply shows
            smaller with the frame's own surface above and below.

            Replacing it with a full 2000 x 1422 export fixes it properly, and
            then the `fit` line comes out.
          */
          fit: 'contain',
        },
      ],
      /*
        The app. Exported at 923x2000, which is 9:19.5 exactly — the row's own
        ratio — so these fill their frames with nothing cropped.
      */
      mobile: [
        {
          src: '/assets/work/yuzu/app-home.webp',
          alt: 'App home — total balance, savings and interest earned above the earn shortcut and recent activity',
          ratio: '923 / 2000',
        },
        {
          src: '/assets/work/yuzu/app-deposit.webp',
          alt: 'Deposit — adding funds and the deposit screen beside it',
          ratio: '923 / 2000',
        },
        {
          src: '/assets/work/yuzu/app-deposit-address.webp',
          alt: 'Deposit address — Bitcoin QR code with the address, minimum deposit and confirmation thresholds',
          ratio: '923 / 2000',
        },
        {
          src: '/assets/work/yuzu/app-earn.webp',
          alt: 'Earn — total earnings over fixed and flexible plans for USDT, BTC and ETH',
          ratio: '923 / 2000',
        },
      ],
    },
    outcome: {
      stats: [{ value: 'USD 50M+', label: 'Assets under management' }],
      body: 'One team across contracts, services and interface, so there was no seam to argue across when a number disagreed.',
    },
  },
  {
    slug: 'telesales-sip',
    summary:
      'An outbound telesales portal wired straight into SIP trunk providers, built for teams dialling at volume.',
    facts: [
      { label: 'Sector', value: 'Telecom' },
      { label: 'Scope', value: 'Agent portal · SIP integration' },
      { label: 'Users', value: 'Telesales agents · Supervisors' },
      { label: 'Status', value: 'Shipped' },
    ],
    brief: [
      'A telesales floor is bottlenecked on the seconds between calls. Every one spent finding the next number, waiting for a dial tone, or writing a note into a second system is a call not made.',
      'We built the agent portal around that: batch dialling, call routing, answering-machine detection, and call notes saved on hangup — so an agent moves to the next conversation without leaving the screen.',
    ],
    build: {
      lede: 'The agent portal, the dialler, and the supervisor view over the queue.',
      /* All three exported at 2000 x 1250, so nothing is cropped. */
      shots: [
        {
          src: '/assets/work/telesales-sip/dashboard.webp',
          alt: 'Agent portal home — five active channels with auto-dial on, beside a queue of 54 pending numbers',
          ratio: '2000 / 1250',
        },
        {
          src: '/assets/work/telesales-sip/contacts.webp',
          alt: 'Contacts — 140 numbers with the outcome of the last call on each and a one-tap dial',
          ratio: '2000 / 1250',
        },
        {
          src: '/assets/work/telesales-sip/history.webp',
          alt: 'Call history — total calls, contact rate and voicemails over a log of every call with its outcome and duration',
          ratio: '2000 / 1250',
        },
      ],
    },
    outcome: {
      stats: [],
      body: 'Agents work one screen: active channels on the left, the pending queue on the right, notes written where the call is.',
    },
  },
  {
    slug: 'digital-collectibles',
    summary:
      'A consumer marketplace for graded collectibles — browsing, trading, and a portfolio that values what you hold.',
    facts: [
      { label: 'Sector', value: 'Web3 consumer' },
      { label: 'Scope', value: 'Marketplace · Trading · Portfolio' },
      { label: 'Users', value: 'Collectors · Agents' },
      { label: 'Status', value: 'Shipped' },
    ],
    brief: [
      'Collectibles trade on condition, and condition is a grade. A marketplace that ignores it is a photo gallery with prices attached; one that respects it has to carry grade through search, listing, valuation and settlement without the collector having to think about it.',
      'We built the consumer side — filtered browsing by grade, year and price, a portfolio that marks holdings to market, and the agent tooling that lets a dealer work on behalf of a buyer.',
    ],
    build: {
      lede: 'Marketplace, the listing page, and the portfolio behind them.',
      /*
        All three are declared at 2000 x 1422, the ratio the first two are
        exported at.

        `portfolio.png` is only 774 x 822 — a partial capture, cut off down the
        right edge mid-column. It was declared at its own ratio for a while so
        that nothing was cropped off it; that made the frame a portrait standing
        beside a landscape one, which was the bug. A frame in a row has to be the
        same shape as the frame next to it.

        So the frame matches the row and the shot is CONTAINED in it: the row is
        square again and not one pixel of the capture is cut. It shows smaller
        than its neighbour, with the frame's own surface either side — which is
        the honest reading of a file that is 774px wide in a 2000px row.

        Replacing it with a full-width 2000 x 1422 export fixes it properly, and
        then the `fit` line comes out and the ratio line stays.
      */
      shots: [
        {
          src: '/assets/work/digital-collectibles/marketplace.webp',
          alt: 'Marketplace — hot deals above the full listing grid, with price, grade, year and expansion filters down the side',
          ratio: '2000 / 1422',
        },
        {
          src: '/assets/work/digital-collectibles/listing.webp',
          alt: 'Listing page — a graded card with its details, price history and related listings by grade',
          ratio: '2000 / 1422',
        },
        {
          src: '/assets/work/digital-collectibles/portfolio.png',
          alt: 'Portfolio — net value, gross assets and outstanding debt over the cash, margin and agent-credit accounts',
          ratio: '2000 / 1422',
          fit: 'contain',
        },
      ],
    },
    outcome: {
      stats: [],
      body: 'Grade is a first-class field end to end, so a filtered search and a portfolio valuation agree with each other.',
    },
  },
  {
    slug: 'poker',
    summary:
      'Real-time multiplayer poker with matchmaking and tournament support — the latency-sensitive half of a gaming platform.',
    facts: [
      { label: 'Sector', value: 'Real-time gaming' },
      { label: 'Scope', value: 'Game server · Matchmaking · Tournaments' },
      { label: 'Users', value: 'Players at a shared table' },
      { label: 'Status', value: 'Shipped' },
    ],
    brief: [
      'Poker is unforgiving to build because every player at a table has to see the same hand in the same order, and a dropped connection cannot be allowed to decide a pot.',
      'We built the real-time layer: table state that survives a reconnect, matchmaking that fills seats without stalling, and a tournament structure that runs blind levels and payouts on its own.',
    ],
    build: {
      lede: 'The table, the lobby, and the store behind them.',
      /*
        Four phone screens across — the app has no web product to pair them
        with. Every shot carries `ratio` because this set is exported inside a
        device frame at 0.5725, where the row's own default is the 9:19.5 of a
        bare capture; without it the frame would crop the bezel off two sides.
      */
      layout: 'row',
      shots: [
        {
          src: '/assets/work/poker/table-nlh.webp',
          alt: "No-limit hold'em table running it twice, with pot-fraction bet sizing under the board",
          ratio: '1145 / 2000',
        },
        {
          src: '/assets/work/poker/table-ofc.png',
          alt: 'Open-face Chinese table — both players\u2019 rows set, with the hand to sort along the bottom',
          ratio: '1145 / 2000',
        },
        {
          src: '/assets/work/poker/store.webp',
          alt: 'Store — chip and gem packages under a promoted casino event',
          ratio: '1145 / 2000',
        },
        {
          src: '/assets/work/poker/lobby.webp',
          alt: 'Lobby — sit-and-go and friends play, with join and host as the two ways in',
          ratio: '1145 / 2000',
        },
      ],
    },
    outcome: {
      stats: [],
      body: 'Table state is authoritative on the server, so a reconnecting player rejoins the hand rather than the lobby.',
    },
  },
];

/** The case study for a project id, or `undefined` while one has not been written. */
export function caseStudyFor(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
