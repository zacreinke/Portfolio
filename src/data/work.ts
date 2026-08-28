import type { ImageMetadata } from 'astro';
import type { Category } from './site';

/* ---------------------------------------------------------------------------
   Adding work is two steps:
     1. Drop the file into src/assets/work/<category>/
     2. Add one entry below, referencing it by bare filename.
   The glob picks up anything in those folders, so no import statements to
   maintain and no chance of a stale path.
--------------------------------------------------------------------------- */

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/work/**/*.{png,jpg,jpeg,gif,webp,svg}',
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  byName.set(path.split('/').pop()!, mod.default);
}

/** Resolve a bare filename to its processed image, loudly if it is missing. */
function img(name: string): ImageMetadata {
  const found = byName.get(name);
  if (!found) {
    throw new Error(
      `[work.ts] No image named "${name}" under src/assets/work/. ` +
        `Available: ${[...byName.keys()].sort().join(', ')}`,
    );
  }
  return found;
}

/**
 * A carousel slide is either a still or an interactive model. Model slides
 * reference a GLB in public/models/ — see scripts/stl-to-glb.py.
 */
/** One selectable body in the 3D viewer. */
export type ModelPart = { label: string; file: string };

export type Slide =
  | { src: ImageMetadata; caption: string }
  /** A single GLB, or several parts offered in the viewer's dropdown. */
  | { model: string | ModelPart[]; caption: string }
  /** A multi-page document — read by scrolling, not by arrowing page to page. */
  | { doc: ImageMetadata[]; caption: string };

export const isImageSlide = (s: Slide): s is { src: ImageMetadata; caption: string } =>
  'src' in s;
export const isDocSlide = (s: Slide): s is { doc: ImageMetadata[]; caption: string } =>
  'doc' in s;

/** The still a tile shows: the first image, or a document's first page. */
export function coverOf(item: WorkItem): ImageMetadata {
  if (item.kind === 'image') return item.src;
  if (item.kind !== 'carousel') return item.poster;
  const still = item.slides.find(isImageSlide);
  if (still) return still.src;
  const doc = item.slides.find(isDocSlide);
  if (doc) return doc.doc[0]!;
  throw new Error(`[work.ts] "${item.id}" has no slide that can act as a cover`);
}

type Base = {
  id: string;
  title: string;
  caption: string;
  category: Category;
};

/**
 * One item is one coherent set. A carousel rotates on the tile, so every slide
 * in it has to be the same subject — a set that changes subject mid-rotation
 * reads as chaos no matter how the timing is tuned. Keep sets at roughly eight
 * slides; go longer only when the extra slides are variations of one thing
 * (see `guitar-prints`), and split by artefact rather than by client otherwise.
 */
export type WorkItem = Base &
  (
    | { kind: 'image'; src: ImageMetadata }
    | { kind: 'carousel'; slides: Slide[] }
    | { kind: 'video'; src: string; poster: ImageMetadata }
    /** Hosted player (YouTube, SoundCloud). `ratio` is width/height, default 16/9. */
    | { kind: 'embed'; embed: string; ratio?: number; poster: ImageMetadata }
  );

const yt = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;

const sc = (kind: 'tracks' | 'playlists', id: number) =>
  'https://w.soundcloud.com/player/?visual=true&show_artwork=true&color=%23212121' +
  `&url=https%3A%2F%2Fapi.soundcloud.com%2F${kind}%2F${id}`;

export const work: WorkItem[] = [
  /* ----------------------------- Graphic Design ---------------------------- */
  /* Bilflo was one 20-slide carousel holding identity, social and collateral.
     Split by artefact so a rotation never changes the subject. Two slides were
     dropped: bilflo-add-04-bf4 duplicated bilflo-square, and bilflo-buffalo.png
     is a white mark on transparency that rendered invisible on a white tile. */
  {
    id: 'bilflo-identity',
    title: 'Bilflo — Identity',
    caption: 'Logo and brand system for a workforce management platform',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('bilflo-add-01-bf1-ig.jpg'), caption: 'Primary lockup' },
      { src: img('bilflo-wide.png'), caption: 'Horizontal lockup' },
      { src: img('bilflo-square.png'), caption: 'Logotype, reversed' },
      { src: img('bilflo-logo-dark.png'), caption: 'Dark variant' },
      { src: img('bilflo-add-02-bf2-ig.jpg'), caption: 'Buffalo logomark' },
      { src: img('bilflo-add-05-bf5-ig.jpg'), caption: 'App icon' },
      { src: img('bilflo-add-03-bf3-ig.jpg'), caption: 'Logomark across the palette' },
      { src: img('bilflo-colors.png'), caption: 'Brand palette' },
      { src: img('bilflo-add-09-bilflo-logo-presentation.png'), caption: 'Logo presentation' },
    ],
  },
  {
    id: 'bilflo-collateral',
    title: 'Bilflo — Collateral',
    caption: 'Print, merch and trade-show material for the Bilflo launch',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('bilflo-add-07-bf7-compressed-ig.jpg'), caption: 'Business cards' },
      { src: img('bilflo-add-08-bilflo-shirts.jpg'), caption: 'Team shirts' },
      { src: img('bilflo-y-01-bilflo-banner-mockup-d1.webp'), caption: 'Trade-show banner' },
      { src: img('bilflo-y-02-automated-invoicing-summer-4.png'), caption: 'Summer of Automated Invoicing' },
      { src: img('bilflo-y-03-bilflo-free-gift.png'), caption: 'Free gift ticket, 3-month trial' },
      { src: img('bilflo-y-04-bilflo-staffing-world-2021.png'), caption: 'Staffing World 2021 ticket' },
      { src: img('logos-marks-11-amtec-bilflo-linkedin-banner.jpg'), caption: 'Amtec x Bilflo announcement banner' },
      {
        doc: [
          img('bilflo-core-flyer-01-core-flyer-front.jpg'),
          img('bilflo-core-flyer-02-core-flyer-back.jpg'),
        ],
        caption: 'Core flyer, front and back',
      },
    ],
  },
  {
    id: 'johnnys-mobile-detail',
    title: "Johnny's Mobile Detail",
    caption: 'Logo design for a mobile auto detailing service',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('johnnys-mobile-square.png'), caption: "Johnny's Mobile Detail — primary mark" },
      { src: img('johnnys-mobile.png'), caption: "Johnny's Mobile Detail — full lockup" },
      { src: img('johnnys-mobile-blue.png'), caption: "Johnny's Mobile Detail — blue colorway" },
      { src: img('johnnys-wheel.png'), caption: "Johnny's Mobile Detail — wheel icon" },
    ],
  },
  {
    id: 'in-your-prime',
    title: 'In Your Prime',
    caption: 'Logo design and product branding',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('in-your-prime-square-blue-white.png'), caption: 'In Your Prime — primary mark' },
      { src: img('iyp-white-logo-board.png'), caption: 'In Your Prime — logo board' },
      { src: img('iyp-product.jpg'), caption: 'In Your Prime — product photography' },
      { src: img('iyp-dimensions.jpg'), caption: 'In Your Prime — dimensions' },
      { src: img('iyp-close.jpg'), caption: 'In Your Prime — detail' },
      { src: img('iyp-far.jpg'), caption: 'In Your Prime — in context' },
      { src: img('iyp-hold.jpg'), caption: 'In Your Prime — in hand' },
    ],
  },
  {
    id: 'amtec-60',
    title: 'Amtec 60 Years',
    caption: 'Logo, banner & campaign design for a 60th anniversary',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-60th-square.png'), caption: 'Amtec 60 Years — anniversary mark' },
      { src: img('amtec-60th-wide.png'), caption: 'Amtec 60 Years — horizontal lockup' },
      { src: img('60th-invitation.jpg'), caption: 'Amtec 60 Years — event invitation' },
      { src: img('60-mug.jpg'), caption: 'Amtec 60 Years — branded merchandise' },
      { src: img('60-party.jpg'), caption: 'Amtec 60 Years — event signage' },
      { src: img('60-years.jpg'), caption: 'Amtec 60 Years — anniversary badge' },
      { src: img('amtec-60-years-collateral-01-amtec-60th-d8.png'), caption: 'Amtec 60th' },
      { src: img('amtec-60-years-collateral-02-amtec-60th-logo-id2.png'), caption: 'Amtec 60th Logo' },
      { src: img('amtec-60-years-collateral-03-3ft-panel-d3-2.webp'), caption: '3ft Panel' },
      { src: img('amtec-60-years-collateral-04-60th-party-program-front.webp'), caption: '60th Party Program Front' },
      { src: img('amtec-60-years-collateral-05-60th-invitation.png'), caption: '60th invitation' },
      { src: img('amtec-60-years-collateral-06-mugs-mu3.jpg'), caption: 'Mugs' },
      { src: img('amtec-60-years-collateral-07-stage-backdrop-d3.webp'), caption: 'Stage Backdrop' },
      { src: img('amtec-60-years-collateral-08-youtube-banner.webp'), caption: 'Youtube Banner' },
    ],
  },
  {
    id: 'blackmagic-collective',
    title: 'Blackmagic Collective',
    caption: 'Logo design for a filmmaker collective',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('bmc-3-square.png'), caption: 'Blackmagic Collective — primary mark' },
      { src: img('bmc-circle.png'), caption: 'Blackmagic Collective — circular badge' },
      { src: img('bmc-colors.png'), caption: 'Blackmagic Collective — brand palette' },
      { src: img('bmc-logos-2.png'), caption: 'Blackmagic Collective — logo system' },
    ],
  },
  {
    id: 'mic-drop',
    title: 'Mic Drop',
    caption: 'Logo design and collateral for a podcast brand',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('micdrop-3-square.png'), caption: 'Mic Drop — primary mark' },
      { src: img('mic-drop-2.png'), caption: 'Mic Drop — logo variations' },
      { src: img('mic-drop-colors.png'), caption: 'Mic Drop — brand palette' },
      { src: img('mic-drop-cards.jpg'), caption: 'Mic Drop — business cards' },
    ],
  },
  {
    id: 'inspire',
    title: 'Inspire',
    caption: 'Logo design',
    category: 'branding',
    kind: 'image',
    src: img('inspire-logo.png'),
  },
  {
    id: 'bad-badge',
    title: 'BAD',
    caption: 'Badge lettering and identity',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('bad-badge.png'), caption: 'Badge lettering' },
      { src: img('logos-marks-add-01-bad-d1-5-final.jpg'), caption: 'Wordmark' },
      { src: img('logos-marks-add-02-bad-inc-2-d5.png'), caption: 'BAD Inc. lockup' },
    ],
  },
  {
    id: 'cali-type',
    title: 'California',
    caption: 'Hand-drawn type study',
    category: 'branding',
    kind: 'image',
    src: img('cali-type.jpg'),
  },
  {
    id: 'zr-monogram',
    title: 'ZR Monogram',
    caption: 'Personal monogram',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('zr-monogram.jpg'), caption: 'Monogram' },
      { src: img('logos-marks-add-04-zr-d9.jpg'), caption: 'Monogram, alternate' },
    ],
  },

  /* ------------------------------ Illustration ----------------------------- */
  {
    id: 'guitars',
    title: 'Guitars',
    caption: 'An ongoing illustration series of guitars and basses',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('mustang-guitar.jpg'), caption: 'Fender Mustang' },
      { src: img('jag-guitar.jpg'), caption: 'Fender Jaguar' },
      { src: img('tele-guitar.jpg'), caption: 'Fender Telecaster' },
      { src: img('junior-guitar.jpg'), caption: 'Gibson Les Paul Junior' },
      { src: img('ryans-guitar.jpg'), caption: "Ryan's guitar" },
      { src: img('tylers-bass.jpg'), caption: "Tyler's bass" },
    ],
  },
  {
    id: 'mustang-floor',
    title: 'Mustang on the Floor',
    caption: 'Illustration',
    category: 'illustration',
    kind: 'image',
    src: img('mustang-guitar-floor.jpg'),
  },
  /* "The Shop" was 21 slides of two unrelated bodies of work — framed home
     decor and guitar print colorways. Separated so each set rotates within one
     subject. Guitar Prints keeps all twelve: they are colorways of four
     illustrations, so the set stays coherent even at that length. */
  {
    id: 'the-shop',
    title: 'The Shop — Framed Prints',
    caption: 'Printable illustrations sold as home decor',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('cacti-mockup.jpg'), caption: 'Cacti — framed print' },
      { src: img('cacti-pink-mockup.jpg'), caption: 'Cacti — pink colorway' },
      { src: img('pumpkins-mockup.jpg'), caption: 'Pumpkins — framed print' },
      { src: img('pumpkins-fall-mockup.jpg'), caption: 'Pumpkins — fall colorway' },
      { src: img('christmas-tree-mockup.jpg'), caption: 'Christmas Tree — framed print' },
      { src: img('christmas-tree-gray-mockup.jpg'), caption: 'Christmas Tree — gray colorway' },
      { src: img('emojis-mockup.jpg'), caption: 'Emojis — framed print' },
      { src: img('emojis-pink-mockup.jpg'), caption: 'Emojis — pink colorway' },
    ],
  },
  {
    id: 'guitar-prints',
    title: 'Guitar Prints',
    caption: 'Guitar illustrations offered as prints, three colorways each',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('the-shop-x-01-jaguar-black-purple-mu1.jpg'), caption: 'Jaguar — black on purple' },
      { src: img('the-shop-x-02-jaguar-sunburst-green-mu1.jpg'), caption: 'Jaguar — sunburst on green' },
      { src: img('the-shop-x-03-jaguar-white-blue-mu1.jpg'), caption: 'Jaguar — white on blue' },
      { src: img('the-shop-x-04-les-paul-black-gray-mu1.jpg'), caption: 'Les Paul — black on gray' },
      { src: img('the-shop-x-05-les-paul-gold-brown-mu1.jpg'), caption: 'Les Paul — gold on brown' },
      { src: img('the-shop-x-06-les-paul-sunburst-blue-mu1.jpg'), caption: 'Les Paul — sunburst on blue' },
      { src: img('the-shop-x-07-les-paul-junior-cream-purple-mu1.jpg'), caption: 'Les Paul Junior — cream on purple' },
      { src: img('the-shop-x-08-les-paul-junior-red-green-mu1.jpg'), caption: 'Les Paul Junior — red on green' },
      { src: img('the-shop-x-09-les-paul-junior-yellow-red-mu1.jpg'), caption: 'Les Paul Junior — yellow on red' },
      { src: img('the-shop-x-10-mustang-bronze-green-mu1.jpg'), caption: 'Mustang — bronze on green' },
      { src: img('the-shop-x-11-mustang-red-gray-mu1.jpg'), caption: 'Mustang — red on gray' },
      { src: img('the-shop-x-12-mustang-yellow-gray-mu1.jpg'), caption: 'Mustang — yellow on gray' },
    ],
  },
  {
    id: 'cacti',
    title: 'Cacti',
    caption: 'Illustration',
    category: 'illustration',
    kind: 'image',
    src: img('cacti.png'),
  },
  {
    id: 'be-my-quarantine',
    title: 'Be My Quarantine',
    caption: 'Illustration, 2020',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('be-my-quarantine.webp'), caption: 'Be My Quarantine — illustration' },
      { src: img('be-my-quarantine-01-bmq-d1-med.webp'), caption: 'Card artwork' },
      { src: img('be-my-quarantine-02-be-my-quarantine.jpg'), caption: 'Printed card' },
      { src: img('be-my-quarantine-03-be-my-quarantine.jpg'), caption: 'Printed card, alternate' },
      { src: img('be-my-quarantine-x-01-bmq-instructions.png'), caption: 'Instruction sheet' },
    ],
  },
  {
    id: 'airspeed-alive',
    title: 'Airspeed Alive',
    caption: 'Animated illustration',
    category: 'illustration',
    kind: 'image',
    src: img('airspeed-alive.gif'),
  },

  /* ------------------------------ Web / UI --------------------------------- */
  {
    id: 'bilflo-app',
    title: 'Bilflo App Illustrations',
    caption: 'Spot illustrations for a workforce management product UI',
    category: 'web-ui',
    kind: 'carousel',
    slides: [
      { src: img('bilflo-app-add-01-invoice.png'), caption: 'Invoice' },
      { src: img('bilflo-app-add-02-laptop.png'), caption: 'Laptop' },
      { src: img('bilflo-app-add-03-monitor.png'), caption: 'Monitor' },
      { src: img('bilflo-app-add-04-printer.png'), caption: 'Printer' },
      { src: img('bilflo-app-add-05-time-money.png'), caption: 'Time & Money' },
      { src: img('bilflo-app-add-06-time-clock.png'), caption: 'Time Clock' },
      { src: img('bilflo-app-y-01-bilflo-before-d3.webp'), caption: 'The back-office it replaced' },
      { src: img('bilflo-add-06-bf6-ig.jpg'), caption: 'Marketing site' },
    ],
  },
  {
    id: 'amtec-60-web',
    title: 'Amtec 60 Years — Web',
    caption: 'Anniversary campaign landing page',
    category: 'web-ui',
    kind: 'image',
    src: img('60th-party-page.jpg'),
  },

  /* -------------------------------- 3D ------------------------------------- */
  {
    id: 'baby-artemis',
    title: 'Baby Artemis',
    caption: 'Artemis rocket model with a collapsible exhaust flame',
    category: '3d',
    kind: 'carousel',
    slides: [
      { src: img('baby-artemis-with-collapsible-exhaust-flame.jpg'), caption: 'Baby Artemis — render' },
      { model: 'baby-artemis.glb', caption: 'Baby Artemis — interactive model' },
    ],
  },
  {
    id: 'starship-mini',
    title: 'Starship Mini',
    caption: 'Starship model with a collapsible exhaust flame',
    category: '3d',
    kind: 'carousel',
    slides: [
      { src: img('starship-mini-with-collapsible-exhaust-flame.jpg'), caption: 'Starship Mini — render' },
      { model: 'starship-mini.glb', caption: 'Starship Mini — interactive model' },
    ],
  },
  {
    id: 'vw-thing',
    title: 'VW Thing — Tooned',
    caption: 'Stylized Volkswagen Type 181 model',
    category: '3d',
    kind: 'carousel',
    slides: [
      { src: img('vw-thing-tooned.jpg'), caption: 'VW Thing — Tooned — render' },
      {
        model: [
          { label: 'Assembled', file: 'vw-thing-assembled.glb' },
          { label: 'Body', file: 'vw-thing-body.glb' },
          { label: 'Front seats', file: 'vw-thing-seats.glb' },
          { label: 'Steering wheel', file: 'vw-thing-steering-wheel.glb' },
          { label: 'Tire', file: 'vw-thing-tire.glb' },
          { label: 'Rim', file: 'vw-thing-rim.glb' },
        ],
        caption: 'VW Thing — Tooned — interactive model',
      },
    ],
  },
  {
    id: 'stubby-rod',
    title: 'Stubby Rod',
    caption: 'Hot rod pencil holder',
    category: '3d',
    kind: 'carousel',
    slides: [
      { src: img('stubby-rod-pencil-holder.webp'), caption: 'Stubby Rod — render' },
      {
        model: [
          { label: 'Assembled', file: 'stubby-rod-assembled.glb' },
          { label: 'Pencil body', file: 'stubby-rod-body.glb' },
          { label: 'Graphite tip', file: 'stubby-rod-graphite.glb' },
          { label: 'Eraser', file: 'stubby-rod-eraser.glb' },
          { label: 'Ferrule', file: 'stubby-rod-ferrule.glb' },
          { label: 'Tire', file: 'stubby-rod-tire.glb' },
          { label: 'Rim', file: 'stubby-rod-rim.glb' },
        ],
        caption: 'Stubby Rod — interactive model',
      },
    ],
  },
  {
    id: 'artemis-badge',
    title: 'Artemis Badge',
    caption: 'Printable Artemis mission badge',
    category: '3d',
    kind: 'carousel',
    slides: [
      { src: img('artemis-badge.jpg'), caption: 'Artemis Badge — render' },
      { model: 'artemis-badge.glb', caption: 'Artemis Badge — interactive model' },
    ],
  },
  {
    id: 'cross-shadow-box',
    title: 'Light of the World',
    caption: 'Cross shadow box',
    category: '3d',
    kind: 'carousel',
    slides: [
      { src: img('light-of-the-world-cross-shadow-box.jpg'), caption: 'Light of the World — render' },
      {
        model: [
          { label: 'Shadow box', file: 'cross-shadow-box-box.glb' },
          { label: 'Cross', file: 'cross-shadow-box-cross.glb' },
        ],
        caption: 'Light of the World — interactive model',
      },
    ],
  },
  {
    id: 'catalina-planter',
    title: 'The Catalina Planter',
    caption: 'Planter design',
    category: '3d',
    kind: 'carousel',
    slides: [
      { src: img('the-catalina-planter.jpg'), caption: 'The Catalina Planter — render' },
      { model: 'catalina-planter.glb', caption: 'The Catalina Planter — interactive model' },
    ],
  },
  {
    id: 'jet-engine-stand',
    title: 'Jet Engine Stand',
    caption: 'Display stand with label',
    category: '3d',
    kind: 'image',
    src: img('jet-engine-stand-with-label.jpg'),
  },
  {
    id: 'fuel-injectors',
    title: 'Long Fuel Injectors',
    caption: 'Jet engine fuel injector parts',
    category: '3d',
    kind: 'image',
    src: img('long-fuel-injectors-for-jet-engine.webp'),
  },

  /* ----------------------------- Videography ------------------------------- */
  {
    id: 'amtec-60-film',
    title: '60 Years — A Film About Amtec',
    caption: 'Anniversary documentary — directed, shot and edited',
    category: 'videography',
    kind: 'embed',
    embed: yt('zI2T0lRyQzE'),
    poster: img('amtec-60-years-film.jpg'),
  },
  {
    id: 'amtec-core-values',
    title: 'Our Core Values',
    caption: 'Internal brand film for Amtec Staffing',
    category: 'videography',
    kind: 'embed',
    embed: yt('BkUB8iTD6Rk'),
    poster: img('amtec-core-values.jpg'),
  },
  {
    id: 'amtec-careers',
    title: 'Amtec Careers — Join Our Team',
    caption: 'Recruitment film — directed, shot and edited',
    category: 'videography',
    kind: 'embed',
    embed: yt('L_z7NfojNkI'),
    poster: img('amtec-careers.jpg'),
  },
  {
    id: 'amtec-interview-generator',
    title: 'Behavioral Interview Questions Generator',
    caption: 'Product explainer — design, animation and edit',
    category: 'videography',
    kind: 'embed',
    embed: yt('q8QPTAAsfvk'),
    poster: img('amtec-interview-generator.jpg'),
  },
  {
    id: 'bilflo-overview',
    title: 'What is Bilflo?',
    caption: 'Product overview video — design, animation and edit',
    category: 'videography',
    kind: 'embed',
    embed: yt('c_o2Lxl6S9U'),
    poster: img('bilflo-overview.jpg'),
  },
  {
    id: 'bilflo-bulk-time',
    title: 'Import Bulk Time into Bilflo',
    caption: 'Feature walk-through — design and edit',
    category: 'videography',
    kind: 'embed',
    embed: yt('HR1UFMktr6I'),
    poster: img('bilflo-bulk-time.jpg'),
  },
  {
    id: 'bilflo-prismhr',
    title: 'PrismHR Integration',
    caption: 'Integration explainer — design, animation and edit',
    category: 'videography',
    kind: 'embed',
    embed: yt('DqIz9wwvEPc'),
    poster: img('bilflo-prismhr.jpg'),
  },
  {
    id: 'bilflo-top-echelon',
    title: 'Top Echelon Integration',
    caption: 'Integration explainer — design, animation and edit',
    category: 'videography',
    kind: 'embed',
    embed: yt('OVcthmeGzvg'),
    poster: img('bilflo-top-echelon.jpg'),
  },
  {
    id: 'bilflo-smartsearch',
    title: 'SmartSearch Integration',
    caption: 'Integration explainer — design, animation and edit',
    category: 'videography',
    kind: 'embed',
    embed: yt('JmMKb1mB7S0'),
    poster: img('bilflo-smartsearch.jpg'),
  },
  {
    id: 'amtec-short-foosball',
    title: 'Hiring Advice for Foosball Players',
    caption: 'Short-form social video',
    category: 'videography',
    kind: 'embed',
    embed: yt('5bBtQuMv1O8'),
    ratio: 9 / 16,
    poster: img('amtec-short-foosball.jpg'),
  },
  {
    id: 'amtec-short-impact',
    title: 'Big Impact With Small Change',
    caption: 'Short-form social video',
    category: 'videography',
    kind: 'embed',
    embed: yt('ebKX2KZQxS8'),
    ratio: 9 / 16,
    poster: img('amtec-short-impact.jpg'),
  },

  /* --------------------------------- Music ---------------------------------
     "Broken" is on the SoundCloud profile but is not public — its page returns
     no metadata to anonymous visitors, so an embed would fail. Make it public
     and it can be added here alongside the other singles.
  --------------------------------------------------------------------------- */
  {
    id: 'shine-ep',
    title: 'SHINE — EP',
    caption: 'Four-track EP, 2015 — written, performed and produced',
    category: 'music',
    kind: 'embed',
    embed: sc('playlists', 97200519),
    ratio: 1,
    poster: img('shine-ep.jpg'),
  },
  {
    id: 'me-without-you',
    title: 'Me Without You',
    caption: 'Single — written, performed and produced',
    category: 'music',
    kind: 'embed',
    embed: sc('tracks', 279867949),
    ratio: 1,
    poster: img('me-without-you.jpg'),
  },
  {
    id: 'make-me-rest',
    title: 'Make Me Rest',
    caption: 'Single — written, performed and produced',
    category: 'music',
    kind: 'embed',
    embed: sc('tracks', 221348745),
    ratio: 1,
    poster: img('make-me-rest.jpg'),
  },
  {
    id: 'summer-again',
    title: 'Summer Again',
    caption: 'Single — written, performed and produced',
    category: 'music',
    kind: 'embed',
    embed: sc('tracks', 175764332),
    ratio: 1,
    poster: img('summer-again.jpg'),
  },

  /* --------------------- Amtec / TriStaff, 2018–2026 ---------------------- */
  {
    id: 'amtec-christmas-cards',
    title: 'Amtec Christmas Cards',
    caption: 'The annual client holiday card, 2018 through 2025',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-christmas-cards-01-amtec-xmas-card-2018-front.jpg'), caption: '2018 — front' },
      { src: img('amtec-christmas-cards-02-amtec-xmas-client-card-back.webp'), caption: '2018 — client card, back' },
      { src: img('amtec-christmas-cards-03-2019-christmas-card-d3.png'), caption: '2019 — front' },
      { src: img('amtec-christmas-cards-04-2019-cc-d2-3-mu.jpg'), caption: '2019 — mockup' },
      { src: img('amtec-christmas-cards-05-christmas-card-2020-mu4.jpg'), caption: '2020 — front' },
      { src: img('amtec-christmas-cards-06-christmas-card-2020-mu4-back.jpg'), caption: '2020 — back' },
      { src: img('amtec-christmas-cards-07-christmas-card-d5.webp'), caption: 'Card artwork' },
      { src: img('amtec-christmas-cards-08-cc-2021-front-mu.jpg'), caption: '2021 — front' },
      { src: img('amtec-christmas-cards-09-cc-2021-back-mu.jpg'), caption: '2021 — back' },
      { src: img('amtec-christmas-cards-10-christmas-2022-front-mu2.jpg'), caption: '2022 — front' },
      { src: img('amtec-christmas-cards-11-christmas-2022-front-portrait-edit.webp'), caption: '2022 — front, portrait crop' },
      { src: img('amtec-christmas-cards-12-final-front-edit.jpg'), caption: 'Card front, final' },
      { src: img('amtec-christmas-cards-13-final-back-edit.jpg'), caption: 'Card back, final' },
      { src: img('amtec-christmas-cards-14-xmas-card-2024-mockup-1.jpg'), caption: '2024 — front' },
      { src: img('amtec-christmas-cards-15-xmas-2025-goody-edit-2.jpg'), caption: '2025 — front' },
      { src: img('amtec-christmas-cards-16-xmas-2025-test-mockup.jpg'), caption: '2025 — mockup' },
      { src: img('amtec-christmas-cards-17-front.jpg'), caption: 'Card front' },
      { src: img('amtec-christmas-cards-18-amtec-card-digital-gift.webp'), caption: 'Digital gift card' },
    ],
  },
  {
    id: 'amtec-holiday-campaigns',
    title: 'Amtec Holiday Campaigns',
    caption: 'Seasonal email, giveaway and social graphics',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-holiday-campaigns-01-xmas-email-banner.webp'), caption: 'Xmas email banner' },
      { src: img('amtec-holiday-campaigns-02-xmas-email-banner-2.webp'), caption: 'Xmas email banner 2' },
      { src: img('amtec-holiday-campaigns-03-xmas-winner.webp'), caption: 'Xmas winner' },
      { src: img('amtec-holiday-campaigns-04-christmas-idea-1.webp'), caption: 'Christmas idea 1' },
      { src: img('amtec-holiday-campaigns-05-christmas-2025-ideas.jpg'), caption: 'Christmas 2025 ideas' },
      { src: img('amtec-holiday-campaigns-06-thank-you-2024.webp'), caption: 'Thank you 2024' },
      { src: img('amtec-holiday-campaigns-x-01-2018-d2.jpg'), caption: '2018' },
    ],
  },
  {
    id: 'amtec-bitz',
    title: 'Amtec bitz Newsletters',
    caption: 'Industry newsletter identity and banner system',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-bitz-01-amtec-bitz-4-tri.webp'), caption: 'Newsletter, three editions' },
      { src: img('amtec-bitz-02-aero-defense-bitz-banner.png'), caption: 'Aerospace & Defense — banner' },
      { src: img('amtec-bitz-03-hr-bitz-banner-2.png'), caption: 'HR — banner' },
      { src: img('amtec-bitz-04-mfg-bitz-banner-2.png'), caption: 'Manufacturing — banner' },
      { src: img('amtec-bitz-05-construct-bitz-banner.png'), caption: 'Construction — banner' },
      { src: img('amtec-bitz-06-amtec-aero-defense-bitz-newsletter.jpg'), caption: 'Aerospace & Defense — newsletter' },
    ],
  },
  {
    id: 'amtec-conference-booths',
    title: 'Conference Booths & Invitations',
    caption: 'Booth design and event invitations for national HR conferences',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-conferences-01-shrm19-d1.webp'), caption: 'SHRM19 booth — first direction' },
      { src: img('amtec-conferences-02-shrm19-d2.webp'), caption: 'SHRM19 booth — second direction' },
      { src: img('amtec-conferences-03-shrm19-d3.png'), caption: 'SHRM19 booth — final' },
      { src: img('amtec-conferences-04-make-hiring-a-vacation-d3-4-small.jpg'), caption: '\u201cMake Hiring a Vacation\u201d campaign' },
      { src: img('amtec-conferences-05-mhav-pop-up-d2-mu.jpg'), caption: '\u201cMake Hiring a Vacation\u201d pop-up' },
      { src: img('amtec-conferences-06-high-roller-invitation-d2.jpg'), caption: 'High Roller invitation' },
      { src: img('amtec-conferences-07-plane-ticket-d1.png'), caption: 'Boarding-pass invitation' },
    ],
  },
  {
    id: 'amtec-event-social',
    title: 'Event Social Graphics',
    caption: 'Announcement graphics for conferences and company events',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-conferences-08-az-shrm-2024-social.png'), caption: 'AZ SHRM 2024' },
      { src: img('amtec-conferences-09-calshrm-2024-social.webp'), caption: 'CalSHRM 2024' },
      { src: img('amtec-conferences-10-cahr-2024-social.png'), caption: 'CAHR 2024' },
      { src: img('amtec-conferences-11-cahr-disney-social-2022.png'), caption: 'CAHR 2022, Disneyland' },
      { src: img('amtec-conferences-12-nv-shrm-2021-social.webp'), caption: 'NV SHRM 2021' },
      { src: img('amtec-conferences-13-shrm-2025-social.webp'), caption: 'SHRM 2025' },
      { src: img('amtec-conferences-14-tristaff-zoo-social.jpg'), caption: 'TriStaff zoo day' },
      { src: img('amtec-conferences-15-pihra-celu-2021-disney-web.png'), caption: 'PIHRA CELU 2021' },
      { src: img('amtec-conferences-16-al-madrigal.webp'), caption: 'Al Madrigal speaker announcement' },
      { src: img('amtec-conferences-17-raffle-winner.png'), caption: 'Raffle winner announcement' },
    ],
  },
  {
    id: 'amtec-signage',
    title: 'Amtec Office & Signage',
    caption: 'Suite signage, environmental graphics and office build-out',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-signage-01-suite-sign-idea.jpg'), caption: 'Suite Sign idea' },
      { src: img('amtec-signage-02-amtec-suite-sign-blueprints.png'), caption: 'Amtec Suite Sign Blueprints' },
      { src: img('amtec-signage-03-suite-sign-100-d1.webp'), caption: 'Suite Sign 100' },
      { src: img('amtec-signage-04-suite-sign-top-1.jpg'), caption: 'Suite Sign Top 1' },
      { src: img('amtec-signage-05-conference-table-frame-d2.png'), caption: 'Conference Table Frame' },
      { src: img('amtec-signage-06-construction-banner-d1.webp'), caption: 'Construction Banner' },
      { src: img('amtec-signage-07-construction-banner.jpg'), caption: 'Construction banner' },
      { src: img('amtec-signage-08-az-ribbon-cutting-portrait.webp'), caption: 'Az ribbon cutting portrait' },
    ],
  },
  {
    id: 'amtec-merch',
    title: 'Amtec Branded Merchandise',
    caption: 'Promotional product design and mockups',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-merch-01-lanyard-mu5.jpg'), caption: 'Lanyard' },
      { src: img('amtec-merch-02-mailer-box-mu1.jpg'), caption: 'Mailer Box' },
      { src: img('amtec-merch-03-socks-2020-d3-0.webp'), caption: 'Socks, 2020' },
      { src: img('amtec-merch-04-socks-2020-d8-1.png'), caption: 'Socks, 2020 — alternate' },
      { src: img('amtec-merch-05-shades-d1.webp'), caption: 'Shades' },
      { src: img('amtec-merch-06-mug-2022-d3.jpg'), caption: 'Mug, 2022' },
      { src: img('amtec-merch-07-mug-2022-d4.jpg'), caption: 'Mug, 2022 — alternate' },
      { src: img('amtec-merch-08-core-values-badge-tumbler.jpg'), caption: 'Core values badge tumbler' },
      { src: img('amtec-merch-09-core-values-badge-dribbble-2.webp'), caption: 'Core values badge dribbble 2' },
    ],
  },
  {
    id: 'tristaff-brand',
    title: 'TriStaff Brand System',
    caption: 'Identity rollout for Amtec\'s TriStaff division',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('tristaff-brand-01-ts-business-card-1.jpg'), caption: 'Business cards' },
      { src: img('tristaff-brand-02-ts-chapstick-1.jpg'), caption: 'Chapstick' },
      { src: img('tristaff-brand-03-ts-pen-1.jpg'), caption: 'Pens' },
      { src: img('tristaff-brand-04-ts-table-cloth-1.jpg'), caption: 'Table cloth' },
      { src: img('tristaff-brand-05-ts-tote-1.jpg'), caption: 'Tote bag' },
      { src: img('tristaff-brand-06-direct-hire-recruiting-tristaff.png'), caption: 'Direct hire recruiting' },
      { src: img('tristaff-brand-07-employer-of-record-tristaff.png'), caption: 'Employer of record' },
      { src: img('tristaff-brand-08-executive-search-tristaff.png'), caption: 'Executive search' },
      { src: img('tristaff-brand-09-temp-staffing-tristaff.png'), caption: 'Temporary staffing' },
      { src: img('tristaff-brand-10-tristaff-hot-jobs-2.jpg'), caption: 'Hot jobs' },
    ],
  },
  {
    id: 'economic-reports',
    title: 'US Economic Report Series',
    caption: 'Monthly labour-market report design',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('economic-reports-01-economic-report-dec-2018-desktop.webp'), caption: 'Economic Report Dec 2018 Desktop' },
      { src: img('economic-reports-02-economic-report-mar-2019-desktop.webp'), caption: 'Economic Report Mar 2019 Desktop' },
      { src: img('economic-reports-03-economic-report-january-2021.png'), caption: 'Economic report january 2021' },
      { src: img('economic-reports-04-economic-report-february-2021.png'), caption: 'Economic report february 2021' },
      { src: img('economic-reports-05-economic-report-february-2021-email.png'), caption: 'Economic report february 2021 email' },
      { src: img('economic-reports-06-linkedin-february-2021-economic-report.png'), caption: 'LinkedIn February 2021 Economic Report' },
    ],
  },
  {
    id: 'job-post-ads',
    title: 'Job Post Social Ads',
    caption: 'A templated system for open-role advertising',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('job-post-ads-01-civil-engineering-project-manager.jpg'), caption: 'Civil Engineering Project Manager' },
      { src: img('job-post-ads-02-hvac-service-manager.jpg'), caption: 'HVAC Service Manager' },
      { src: img('job-post-ads-03-project-manager-commercial-general-contracto.jpg'), caption: 'Project Manager (Commercial General Contractor) Social' },
      { src: img('job-post-ads-04-construction-superintendent.jpg'), caption: 'Construction superintendent' },
    ],
  },
  {
    id: 'campaign-graphics',
    title: 'Campaign & Webinar Graphics',
    caption: 'Email headers, webinar promotion and offer campaigns',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('campaign-graphics-01-0-markup-d1.jpg'), caption: '0% markup' },
      { src: img('campaign-graphics-02-0-markup-d2.jpg'), caption: '0% markup, alternate' },
      { src: img('campaign-graphics-03-enroll-team-d1.jpg'), caption: 'Enroll your team' },
      { src: img('campaign-graphics-04-enroll-team-d2.jpg'), caption: 'Enroll your team, alternate' },
      { src: img('campaign-graphics-05-keep-employees-d1.jpg'), caption: 'Keep your employees' },
      { src: img('campaign-graphics-06-keep-employees-d2.jpg'), caption: 'Keep your employees, alternate' },
      { src: img('campaign-graphics-07-attracting-retaining-webinar-banner-4.png'), caption: 'Attracting & retaining — webinar banner' },
      { src: img('campaign-graphics-08-ai-wont-save-your-hiring.png'), caption: '“AI won’t save your hiring”' },
      { src: img('campaign-graphics-09-improve-your-hiring-process-2.webp'), caption: 'Improve your hiring process' },
      { src: img('campaign-graphics-10-improve-your-hiring-process-zoom-2.png'), caption: 'Improve your hiring process — Zoom background' },
      { src: img('campaign-graphics-11-hire-better-email.png'), caption: 'Hire better — email' },
      { src: img('campaign-graphics-12-remote-workers-email.png'), caption: 'Remote workers — email' },
      { src: img('campaign-graphics-13-indeed-banner-3.jpg'), caption: 'Indeed banner' },
      { src: img('campaign-graphics-14-google-forms-banner.png'), caption: 'Google Forms banner' },
    ],
  },
  /* ---------------------------------------------------------------------------
     These were one 21-slide "Logos & Marks" carousel — a folder, not a piece.
     A rotation that cycles Simplee Coffee -> a LinkedIn banner -> a glass
     logomark is incoherent at any interval, so each client now stands alone and
     duplicate versions of a mark sit together as one item.
  --------------------------------------------------------------------------- */
  {
    id: 'simplee-coffee',
    title: 'Simplee Coffee',
    caption: 'Identity for a coffee roaster',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('logos-marks-01-simplee-coffee-1.png'), caption: 'Primary mark' },
      { src: img('logos-marks-02-simplee-coffee-2.png'), caption: 'Alternate lockup' },
    ],
  },
  {
    id: 'hypersonic-staffing',
    title: 'Hypersonic Staffing',
    caption: 'Identity for a staffing agency',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-03-hypersonic-staffing.jpg'),
  },
  {
    id: 'keystone-recruiters',
    title: 'Keystone Recruiters',
    caption: 'Identity for a recruiting firm',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-04-keystone-recruiters.jpg'),
  },
  {
    id: 'tunable-tunes',
    title: 'Tunable Tunes',
    caption: 'Identity for a music education brand',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('logos-marks-05-tunable-tunes-2.jpg'), caption: 'Primary mark' },
      { src: img('logos-marks-x-03-tunable-tunes-march-2022.jpg'), caption: 'Revised mark' },
    ],
  },
  {
    id: 'the-work-weekly',
    title: 'The Work Weekly',
    caption: 'Identity for a careers newsletter',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-06-tww-white.png'),
  },
  {
    id: 'knockout',
    title: 'Knockout',
    caption: 'Badge mark',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-07-knockout-square.png'),
  },
  {
    id: 'rooted-roots',
    title: 'Rooted Roots',
    caption: 'Identity for a plant shop',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-09-rooted-roots-mu.webp'),
  },
  {
    id: 'amtec-logomark',
    title: 'Amtec Logomark',
    caption: 'Animated glass treatment of the Amtec mark',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-10-amtec-logomark-glass.gif'),
  },
  {
    id: 'csp-member',
    title: 'CSP Member',
    caption: 'Certification badge',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-12-csp-member-d3-1.jpg'),
  },
  {
    id: 'bee-podcast',
    title: 'Bee Podcast',
    caption: 'Identity for a podcast',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-add-03-bee-podcast-d3.png'),
  },
  {
    id: 'revd-up',
    title: "Rev'd Up",
    caption: 'Vertical lockup for an automotive brand',
    category: 'branding',
    kind: 'image',
    src: img('logos-marks-add-06-revd-up-lockup-vertical-light-xl.webp'),
  },
  {
    id: 'foothills',
    title: 'Foothills',
    caption: 'Identity exploration for an outdoor brand',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('logos-marks-x-01-foothills-d1.jpg'), caption: 'Mark, first direction' },
      { src: img('logos-marks-x-02-foothills-d3.jpg'), caption: 'Mark, third direction' },
    ],
  },
  {
    id: 'amtec-culture',
    title: 'Recognition & Culture',
    caption: 'Anniversary, appreciation and internal event graphics',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('amtec-culture-01-happy-workiversary-zac-7.webp'), caption: 'Happy workiversary zac 7' },
      { src: img('amtec-culture-02-happy-workiversary-barrett-20.webp'), caption: 'Happy workiversary barrett 20' },
      { src: img('amtec-culture-03-core-values-2022.png'), caption: 'Core Values 2022' },
      { src: img('amtec-culture-04-rds-linkedin.jpg'), caption: 'Rds linkedin' },
      { src: img('amtec-culture-05-owners-only-retreat-2019-d2.webp'), caption: 'Owners Only Retreat 2019' },
      { src: img('amtec-culture-06-ruths-chris-invite.png'), caption: 'Ruths chris invite' },
      { src: img('amtec-culture-07-nfuse-invite-2026.webp'), caption: 'Nfuse invite 2026' },
    ],
  },
  {
    id: 'amtec-brand-docs',
    title: 'Amtec Brand Documents',
    caption: 'Style guide, process and onboarding collateral',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      {
        doc: [
          img('amtec-brand-docs-01-amtec-me-style-guide-p01.jpg'),
          img('amtec-brand-docs-02-amtec-me-style-guide-p02.jpg'),
          img('amtec-brand-docs-03-amtec-me-style-guide-p03.jpg'),
          img('amtec-brand-docs-04-amtec-me-style-guide-p04.jpg'),
          img('amtec-brand-docs-05-amtec-me-style-guide-p05.jpg'),
          img('amtec-brand-docs-06-amtec-me-style-guide-p06.jpg'),
        ],
        caption: 'Amtec.Me brand style guide',
      },
      {
        doc: [
          img('amtec-brand-docs-07-the-amtec-process-p01.jpg'),
          img('amtec-brand-docs-08-the-amtec-process-p02.jpg'),
        ],
        caption: 'The Amtec Process',
      },
      {
        doc: [
          img('amtec-brand-docs-09-welcome-to-amtec-p01.jpg'),
          img('amtec-brand-docs-10-welcome-to-amtec-p02.jpg'),
          img('amtec-brand-docs-11-welcome-to-amtec-p03.jpg'),
          img('amtec-brand-docs-12-welcome-to-amtec-p04.jpg'),
          img('amtec-brand-docs-13-welcome-to-amtec-p05.jpg'),
          img('amtec-brand-docs-14-welcome-to-amtec-p06.jpg'),
          img('amtec-brand-docs-15-welcome-to-amtec-p07.jpg'),
          img('amtec-brand-docs-16-welcome-to-amtec-p08.jpg'),
          img('amtec-brand-docs-17-welcome-to-amtec-p09.jpg'),
          img('amtec-brand-docs-18-welcome-to-amtec-p10.jpg'),
          img('amtec-brand-docs-19-welcome-to-amtec-p11.jpg'),
          img('amtec-brand-docs-20-welcome-to-amtec-p12.jpg'),
          img('amtec-brand-docs-21-welcome-to-amtec-p13.jpg'),
          img('amtec-brand-docs-22-welcome-to-amtec-p14.jpg'),
          img('amtec-brand-docs-23-welcome-to-amtec-p15.jpg'),
        ],
        caption: 'Welcome to Amtec',
      },
      {
        doc: [
          img('amtec-brand-docs-24-amtec-benefits-summary.jpg'),
        ],
        caption: 'Benefits summary',
      },
    ],
  },
  {
    id: 'amtec-social-guides',
    title: 'Social Carousel Guides',
    caption: 'Editorial slide series built for social',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      {
        doc: [
          img('amtec-social-guides-01-5-highest-paying-careers-in-california-p01.jpg'),
          img('amtec-social-guides-02-5-highest-paying-careers-in-california-p02.jpg'),
          img('amtec-social-guides-03-5-highest-paying-careers-in-california-p03.jpg'),
          img('amtec-social-guides-04-5-highest-paying-careers-in-california-p04.jpg'),
          img('amtec-social-guides-05-5-highest-paying-careers-in-california-p05.jpg'),
          img('amtec-social-guides-06-5-highest-paying-careers-in-california-p06.jpg'),
          img('amtec-social-guides-07-5-highest-paying-careers-in-california-p07.jpg'),
        ],
        caption: '5 Highest Paying Careers in California',
      },
      {
        doc: [
          img('amtec-social-guides-08-how-to-find-a-career-you-love-p01.jpg'),
          img('amtec-social-guides-09-how-to-find-a-career-you-love-p02.jpg'),
          img('amtec-social-guides-10-how-to-find-a-career-you-love-p03.jpg'),
          img('amtec-social-guides-11-how-to-find-a-career-you-love-p04.jpg'),
          img('amtec-social-guides-12-how-to-find-a-career-you-love-p05.jpg'),
          img('amtec-social-guides-13-how-to-find-a-career-you-love-p06.jpg'),
          img('amtec-social-guides-14-how-to-find-a-career-you-love-p07.jpg'),
        ],
        caption: 'How to Find a Career You Love',
      },
      {
        doc: [
          img('amtec-social-guides-15-how-to-refer-someone-for-a-job-p01.jpg'),
          img('amtec-social-guides-16-how-to-refer-someone-for-a-job-p02.jpg'),
          img('amtec-social-guides-17-how-to-refer-someone-for-a-job-p03.jpg'),
          img('amtec-social-guides-18-how-to-refer-someone-for-a-job-p04.jpg'),
          img('amtec-social-guides-19-how-to-refer-someone-for-a-job-p05.jpg'),
          img('amtec-social-guides-20-how-to-refer-someone-for-a-job-p06.jpg'),
        ],
        caption: 'How to Refer Someone for a Job',
      },
      {
        doc: [
          img('amtec-social-guides-21-top-5-highest-paying-trade-jobs-p01.jpg'),
          img('amtec-social-guides-22-top-5-highest-paying-trade-jobs-p02.jpg'),
          img('amtec-social-guides-23-top-5-highest-paying-trade-jobs-p03.jpg'),
          img('amtec-social-guides-24-top-5-highest-paying-trade-jobs-p04.jpg'),
          img('amtec-social-guides-25-top-5-highest-paying-trade-jobs-p05.jpg'),
          img('amtec-social-guides-26-top-5-highest-paying-trade-jobs-p06.jpg'),
          img('amtec-social-guides-27-top-5-highest-paying-trade-jobs-p07.jpg'),
        ],
        caption: 'Top 5 Highest Paying Trade Jobs',
      },
      {
        doc: [
          img('amtec-social-guides-28-the-fight-for-fair-work-p01.jpg'),
          img('amtec-social-guides-29-the-fight-for-fair-work-p02.jpg'),
          img('amtec-social-guides-30-the-fight-for-fair-work-p03.jpg'),
          img('amtec-social-guides-31-the-fight-for-fair-work-p04.jpg'),
          img('amtec-social-guides-32-the-fight-for-fair-work-p05.jpg'),
        ],
        caption: 'The Fight for Fair Work',
      },
    ],
  },
  {
    id: 'amtec-print',
    title: 'Print Collateral',
    caption: 'Brochures, flyers, invitations and certificates',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      {
        doc: [
          img('amtec-print-01-amtec-vacation-brochure-redesign-2023-p01.jpg'),
          img('amtec-print-02-amtec-vacation-brochure-redesign-2023-p02.jpg'),
          img('amtec-print-03-amtec-vacation-brochure-redesign-2023-p03.jpg'),
          img('amtec-print-04-amtec-vacation-brochure-redesign-2023-p04.jpg'),
          img('amtec-print-05-amtec-vacation-brochure-redesign-2023-p05.jpg'),
          img('amtec-print-06-amtec-vacation-brochure-redesign-2023-p06.jpg'),
          img('amtec-print-07-amtec-vacation-brochure-redesign-2023-p07.jpg'),
          img('amtec-print-08-amtec-vacation-brochure-redesign-2023-p08.jpg'),
          img('amtec-print-09-amtec-vacation-brochure-redesign-2023-p09.jpg'),
          img('amtec-print-10-amtec-vacation-brochure-redesign-2023-p10.jpg'),
          img('amtec-print-11-amtec-vacation-brochure-redesign-2023-p11.jpg'),
          img('amtec-print-12-amtec-vacation-brochure-redesign-2023-p12.jpg'),
          img('amtec-print-13-amtec-vacation-brochure-redesign-2023-p13.jpg'),
          img('amtec-print-14-amtec-vacation-brochure-redesign-2023-p14.jpg'),
          img('amtec-print-15-amtec-vacation-brochure-redesign-2023-p15.jpg'),
          img('amtec-print-16-amtec-vacation-brochure-redesign-2023-p16.jpg'),
        ],
        caption: 'Vacation brochure redesign, 2023',
      },
      {
        doc: [
          img('amtec-print-17-construction-flyer-2023-p01.jpg'),
          img('amtec-print-18-construction-flyer-2023-p02.jpg'),
        ],
        caption: 'Construction flyer, 2023',
      },
      {
        doc: [
          img('amtec-print-19-tristaff-flyer-2024-p01.jpg'),
          img('amtec-print-20-tristaff-flyer-2024-p02.jpg'),
        ],
        caption: 'TriStaff flyer, 2024',
      },
      {
        doc: [
          img('amtec-print-21-halloween-networking-amtec-p01.jpg'),
          img('amtec-print-22-halloween-networking-amtec-p02.jpg'),
          img('amtec-print-23-halloween-networking-amtec-p03.jpg'),
          img('amtec-print-24-halloween-networking-amtec-p04.jpg'),
          img('amtec-print-25-halloween-networking-amtec-p05.jpg'),
          img('amtec-print-26-halloween-networking-amtec-p06.jpg'),
          img('amtec-print-27-halloween-networking-amtec-p07.jpg'),
        ],
        caption: 'Halloween Networking',
      },
      {
        doc: [
          img('amtec-print-28-az-office-opening.jpg'),
        ],
        caption: 'Arizona office grand opening',
      },
      {
        doc: [
          img('amtec-print-29-happy-boss-s-day-p01.jpg'),
          img('amtec-print-30-happy-boss-s-day-p02.jpg'),
          img('amtec-print-31-happy-boss-s-day-p03.jpg'),
          img('amtec-print-32-happy-boss-s-day-p04.jpg'),
        ],
        caption: 'Happy Boss\'s Day',
      },
      {
        doc: [
          img('amtec-print-33-vaccinate-oc-flyer.jpg'),
        ],
        caption: 'Vaccinate OC flyer',
      },
      {
        doc: [
          img('amtec-print-34-win-a-day-at-disneyland.jpg'),
        ],
        caption: 'Win a Day at Disneyland',
      },
      {
        doc: [
          img('amtec-print-35-kevin-certificate-of-appreciation.jpg'),
        ],
        caption: 'Certificate of appreciation',
      },
      {
        doc: [
          img('amtec-print-36-people-s-care-case-study-p01.jpg'),
          img('amtec-print-37-people-s-care-case-study-p02.jpg'),
          img('amtec-print-38-people-s-care-case-study-p03.jpg'),
        ],
        caption: 'People\'s Care case study',
      },
      {
        doc: [
          img('amtec-print-39-yodump-sticker.jpg'),
        ],
        caption: 'Yodump sticker',
      },
    ],
  },
  {
    id: 'amtec-illustration',
    title: 'Amtec Spot Illustrations',
    caption: 'Editorial and campaign illustration',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('amtec-illustration-01-amtec-tools-d1.jpg'), caption: 'Tools of the trade' },
      { src: img('amtec-illustration-02-2020-saviors.jpg'), caption: 'Saviors of 2020' },
      { src: img('amtec-illustration-03-behavioral.png'), caption: 'Behavioral interviewing' },
      { src: img('amtec-illustration-04-power-of-collab.png'), caption: 'The power of collaboration' },
      { src: img('amtec-illustration-05-water-cooler-d1.png'), caption: 'Water cooler' },
      { src: img('amtec-illustration-06-75k-copy.webp'), caption: '$75k' },
      { src: img('amtec-illustration-07-biq-cover.png'), caption: 'Behavioral interview questions — cover' },
      { src: img('amtec-illustration-08-how-to-retain-top-engineer-ebook.jpg'), caption: 'How to retain top engineers — ebook' },
      { src: img('amtec-illustration-09-purple-squirrel-sub-d1.png'), caption: 'Purple squirrel' },
    ],
  },
  {
    id: 'hiring-scott',
    title: 'Hiring Scott',
    caption: 'Brand and video series for a recruiting channel',
    category: 'videography',
    kind: 'carousel',
    slides: [
      { src: img('hiring-scott-01-hiring-scott-logo-final-green.png'), caption: 'Series logo' },
      { src: img('hiring-scott-02-hs-intro-3.gif'), caption: 'Title animation' },
      { src: img('hiring-scott-03-hiring-scott-videos.jpg'), caption: 'Episode thumbnails' },
    ],
  },
  {
    id: 'amtec-web',
    title: 'Amtec Web & Product',
    caption: 'Site design, landing pages and process diagrams',
    category: 'web-ui',
    kind: 'carousel',
    slides: [
      { src: img('amtec-web-01-orvac-hero-d1.jpg'), caption: 'Orvac Hero' },
      { src: img('amtec-web-02-amtec-phone-d4-1.jpg'), caption: 'Mobile site' },
      { src: img('amtec-web-03-amtec-phone-d5.jpg'), caption: 'Mobile site — alternate' },
      { src: img('amtec-web-04-rpo-process-blog.png'), caption: 'Rpo process blog' },
      { src: img('amtec-web-05-amtec-global-website-p01.jpg'), caption: 'Amtec global website — page 01' },
      { src: img('amtec-web-06-amtec-global-website-p02.jpg'), caption: 'Amtec global website — page 02' },
      { src: img('amtec-web-07-amtec-global-website-p03.jpg'), caption: 'Amtec global website — page 03' },
      { src: img('amtec-web-08-amtec-global-website-p04.jpg'), caption: 'Amtec global website — page 04' },
      { src: img('amtec-web-09-amtec-global-website-p05.jpg'), caption: 'Amtec global website — page 05' },
      { src: img('amtec-web-10-amtec-global-website-p06.jpg'), caption: 'Amtec global website — page 06' },
      { src: img('amtec-web-add-01-amtec-phone-d4.jpg'), caption: 'Mobile navigation' },
    ],
  },

  /* ------------------------- Eager Eyes & clients ------------------------- */
  {
    id: 'eager-eyes-vehicles',
    title: 'Vehicles',
    caption: 'An illustration series of cars and vans',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('eager-eyes-vehicles-01-bug-d1-drbl.webp'), caption: 'Bug' },
      { src: img('eager-eyes-vehicles-02-bus-truck-d3-drbl.jpg'), caption: 'Bus Truck' },
      { src: img('eager-eyes-vehicles-04-porsche-911.jpg'), caption: 'Porsche 911' },
      { src: img('eager-eyes-vehicles-05-jag-e-star-wars-d3.jpg'), caption: 'Jag E Star Wars' },
    ],
  },
  {
    id: 'eager-eyes-caps',
    title: 'Caps',
    caption: 'Illustrated cap series',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('eager-eyes-caps-01-hat-angel-ee.png'), caption: 'Hat Angel' },
      { src: img('eager-eyes-caps-02-hat-dodger-ee.png'), caption: 'Hat Dodger' },
      { src: img('eager-eyes-caps-03-hat-pokemon-ee.png'), caption: 'Hat Pokemon' },
      { src: img('eager-eyes-caps-04-hat-top-ee.png'), caption: 'Hat TOP' },
    ],
  },
  {
    id: 'eager-eyes-gear',
    title: 'Music Gear',
    caption: 'Guitars, amps and pedals',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('eager-eyes-gear-01-gg-guitar-d1.jpg'), caption: 'GG guitar' },
      { src: img('eager-eyes-gear-02-gibson-es-335-iphone-2x.jpg'), caption: 'Gibson ES-335' },
      { src: img('eager-eyes-gear-03-les-paul-skinny.jpg'), caption: 'Les Paul' },
      { src: img('eager-eyes-gear-05-twin-reverb-d3.webp'), caption: 'Twin Reverb' },
      { src: img('eager-eyes-gear-06-mxr-phase-90.jpg'), caption: 'MXR Phase 90' },
      { src: img('eager-eyes-gear-07-workstation-wlppr-d2.jpg'), caption: 'Workstation wallpaper' },
      { src: img('eager-eyes-gear-08-speaker-a7x-ee.png'), caption: 'Adam A7X monitor' },
      { src: img('krk-speaker.png'), caption: 'KRK Rokit monitor' },
      { src: img('recording-studio-2.jpg'), caption: 'Recording studio' },
    ],
  },
  {
    id: 'eager-eyes-lighthouses',
    title: 'Lighthouses',
    caption: 'Illustration and print series',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('eager-eyes-lighthouses-01-paul-s-lighthouse.png'), caption: 'Paul\'s Lighthouse' },
      { src: img('eager-eyes-lighthouses-02-tombstone-lighthouse.webp'), caption: 'Tombstone Lighthouse' },
      { src: img('eager-eyes-lighthouses-03-lighthouse-image.jpg'), caption: 'Lighthouse Image' },
    ],
  },
  {
    id: 'eager-eyes-objects',
    title: 'Objects',
    caption: 'Everyday things, drawn flat',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('eager-eyes-objects-01-airpods-d2.png'), caption: 'Airpods' },
      { src: img('eager-eyes-objects-02-chucks.jpg'), caption: 'Chucks' },
      { src: img('eager-eyes-objects-03-drone-dribbble-d2.jpg'), caption: 'Drone' },
      { src: img('eager-eyes-objects-04-robot-arm.png'), caption: 'Robot Arm' },
      { src: img('eager-eyes-objects-05-low-battery.gif'), caption: 'Low Battery' },
      { src: img('eager-eyes-objects-06-yodump-bg-d1.png'), caption: 'Yodump' },
      { src: img('vans-2.png'), caption: 'Vans' },
    ],
  },
  {
    id: 'algorri-trucks',
    title: 'Algorri Trucks',
    caption: 'Chevrolet dealership brand exploration',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('algorri-trucks-01-algorri-trucks.png'), caption: 'Algorri Trucks wordmark' },
      { src: img('algorri-trucks-02-chevy-today-algorri.png'), caption: '“Chevy Today” lockup' },
      { src: img('algorri-trucks-03-47-chevy-badge.png'), caption: '1947 Chevy badge' },
      { src: img('algorri-trucks-04-chevy-usa.png'), caption: 'Chevy USA' },
      { src: img('algorri-trucks-05-chevy-trippy.png'), caption: 'Psychedelic treatment' },
      { src: img('algorri-trucks-06-chevy-pattern-usa.webp'), caption: 'Repeat pattern' },
    ],
  },
  {
    id: 'sauce-posters',
    title: 'Sauce Poster Series',
    caption: 'Hot sauce label posters',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('sauce-posters-01-awesome-sauce-d2-drbl.jpg'), caption: 'Awesome Sauce' },
      { src: img('sauce-posters-02-lame-sauce-d2-drbl.jpg'), caption: 'Lame Sauce' },
      { src: img('sauce-posters-03-tone-sauce-d3-drbl.jpg'), caption: 'Tone Sauce' },
    ],
  },
  {
    id: 'clearly-filtered',
    title: 'Clearly Filtered',
    caption: 'Product marketing for a water filtration brand',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('clearly-filtered-01.jpg'), caption: 'Product hero' },
      { src: img('clearly-filtered-02.jpg'), caption: 'Clean water anywhere' },
      { src: img('clearly-filtered-03.jpg'), caption: 'Affinity Filtration technology' },
      { src: img('clearly-filtered-04.jpg'), caption: 'Silicon mouthpiece & easy-grip handle' },
      { src: img('clearly-filtered-05.jpg'), caption: 'Everyday hydration' },
    ],
  },
  {
    id: 'door-bubbles',
    title: 'Doorway',
    caption: 'Geometric illustration',
    category: 'illustration',
    kind: 'image',
    src: img('door-bubbles.png'),
  },

  /* --------------------------- Client brand work --------------------------- */
  {
    id: 'evergreen-identity',
    title: 'Evergreen — Identity',
    caption: 'Badge mark and brand system for an outdoor company',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('evergreen-01-evergreen-badge-mu1-1.webp'), caption: 'Badge, embroidered' },
      { src: img('evergreen-02-evergreen-badge-mu2.webp'), caption: 'Badge, applied' },
      { src: img('evergreen-03-evergreen-badge-mu2-1.webp'), caption: 'Badge, alternate colorway' },
      {
        doc: [
          img('evergreen-16-evergreen-style-guide-p01.jpg'),
          img('evergreen-17-evergreen-style-guide-p02.jpg'),
          img('evergreen-18-evergreen-style-guide-p03.jpg'),
          img('evergreen-19-evergreen-style-guide-p04.jpg'),
          img('evergreen-20-evergreen-style-guide-p05.jpg'),
          img('evergreen-21-evergreen-style-guide-p06.jpg'),
          img('evergreen-22-evergreen-style-guide-p07.jpg'),
          img('evergreen-23-evergreen-style-guide-p08.jpg'),
          img('evergreen-24-evergreen-style-guide-p09.jpg'),
          img('evergreen-25-evergreen-style-guide-p10.jpg'),
          img('evergreen-26-evergreen-style-guide-p11.jpg'),
          img('evergreen-27-evergreen-style-guide-p12.jpg'),
        ],
        caption: 'Brand style guide, 12 pages',
      },
    ],
  },
  {
    id: 'evergreen-lockups',
    title: 'Evergreen — Lockups',
    caption: 'Tagline lockups set over landscape photography',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('evergreen-04-overlay-logomark.jpg'), caption: 'Logomark over landscape' },
      { src: img('evergreen-05-overlay-1.jpg'), caption: '\u201cGo to Grow\u201d' },
      { src: img('evergreen-06-overlay-2.jpg'), caption: '\u201cGo 2 Grow\u201d' },
      { src: img('evergreen-07-overlay-2-1.webp'), caption: '\u201cGo 2 Grow\u201d, alternate' },
      { src: img('evergreen-08-overlay-3.jpg'), caption: '\u201cGo & Grow\u201d' },
      { src: img('evergreen-09-overlay-3-1.webp'), caption: '\u201cGo & Grow\u201d, alternate' },
      { src: img('evergreen-10-overlay-4.jpg'), caption: 'Banner lockup' },
    ],
  },
  {
    id: 'evergreen-social',
    title: 'Evergreen — Social',
    caption: 'The tagline campaign applied to Instagram',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('evergreen-11-insta-overlay-logomark-mu.jpg'), caption: 'Logomark' },
      { src: img('evergreen-12-insta-overlay-1-mu.jpg'), caption: '\u201cGo to Grow\u201d' },
      { src: img('evergreen-13-insta-overlay-2-1-mu.jpg'), caption: '\u201cGo 2 Grow\u201d' },
      { src: img('evergreen-14-insta-overlay-3-1-mu.jpg'), caption: '\u201cGo & Grow\u201d' },
      { src: img('evergreen-15-insta-overlay-4-mu.jpg'), caption: 'Banner lockup' },
    ],
  },
  {
    id: 'ordinary-girl',
    title: 'Ordinary Girl with an Extraordinary God',
    caption: 'Book cover and identity',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('ordinary-girl-01-d2-1.png'), caption: 'Book cover' },
      { src: img('ordinary-girl-02-ggj-d1.jpg'), caption: 'GGJ' },
      { src: img('ordinary-girl-03-m2-1.jpg'), caption: 'M2.1' },
      { src: img('ordinary-girl-04-m3-4.jpg'), caption: 'M3.4' },
      {
        doc: [
          img('ordinary-girl-05-ordinary-girl-extraordinary-god-d3-4.jpg'),
        ],
        caption: 'Book cover, final',
      },
    ],
  },
  {
    id: 'ray-johnson-memorial',
    title: 'Ray Johnson Memorial',
    caption: 'Memorial program and title card',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('ray-johnson-memorial-01-rmj-title-slide.webp'), caption: 'Title slide' },
      {
        doc: [
          img('ray-johnson-memorial-02-ray-johnson-s-memorial-program-p01.jpg'),
          img('ray-johnson-memorial-03-ray-johnson-s-memorial-program-p02.jpg'),
        ],
        caption: 'Memorial program',
      },
    ],
  },
  {
    id: 'eager-eyes-brand',
    title: 'Eager Eyes',
    caption: 'My own studio identity, site and merch',
    category: 'branding',
    kind: 'carousel',
    slides: [
      { src: img('logos-marks-add-05-eg-lockup-xl.png'), caption: 'Primary lockup' },
      { src: img('eager-eyes-brand-01-eager-eyes-presentation.png'), caption: 'Brand presentation' },
      { src: img('eager-eyes-brand-02-website-mu.jpg'), caption: 'Website' },
      { src: img('eager-eyes-brand-03-eyeball-coaster.webp'), caption: 'Eyeball coaster' },
    ],
  },
  {
    id: 'bilflo-display-ads',
    title: 'Bilflo Display Ads',
    caption: 'A templated display campaign for a workforce platform',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('bilflo-display-ads-01-bilflo-ad-1.png'), caption: 'Automate Your Staffing Agency' },
      { src: img('bilflo-display-ads-02-bilflo-ad-2.png'), caption: 'Reduce Labor Costs' },
      { src: img('bilflo-display-ads-03-bilflo-ad-3.png'), caption: 'Hire More than Ever Before' },
      { src: img('bilflo-display-ads-04-bilflo-ad-4.png'), caption: 'Back-Office Automation Software' },
      { src: img('bilflo-display-ads-05-bilflo-ad-5.png'), caption: 'Automate Your Staffing Agency, light' },
      { src: img('bilflo-display-ads-06-bilflo-ad-6.png'), caption: 'Imagine Automating' },
      { src: img('bilflo-display-ads-07-bilflo-ad-7.png'), caption: 'Double Your Back-Office Capacity' },
      { src: img('bilflo-display-ads-08-bilflo-ad-8.png'), caption: 'Save Up to 75% on Labor' },
      { src: img('bilflo-display-ads-09-bilflo-ad-9.png'), caption: 'Recruitment Back-Office Software' },
      { src: img('bilflo-display-ads-10-bilflo-ad-10.png'), caption: 'Imagine Automating, dark' },
    ],
  },
];
