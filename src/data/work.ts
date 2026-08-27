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

export type Slide = { src: ImageMetadata; caption: string };

type Base = {
  id: string;
  title: string;
  caption: string;
  category: Category;
};

export type WorkItem = Base &
  (
    | { kind: 'image'; src: ImageMetadata }
    | { kind: 'carousel'; slides: Slide[] }
    | { kind: 'video'; src: string; poster: ImageMetadata }
    | { kind: 'embed'; html: string; poster: ImageMetadata }
  );

export const work: WorkItem[] = [
  /* ----------------------------- Graphic Design ---------------------------- */
  {
    id: 'bilflo',
    title: 'Bilflo',
    caption: 'Logo & illustrative design for a workforce management platform',
    category: 'graphic-design',
    kind: 'carousel',
    slides: [
      { src: img('bilflo-square.png'), caption: 'Bilflo — primary logo lockup' },
      { src: img('bilflo-wide.png'), caption: 'Bilflo — horizontal lockup' },
      { src: img('bilflo-colors.png'), caption: 'Bilflo — brand palette' },
      { src: img('bilflo-logo-dark.png'), caption: 'Bilflo — dark variant' },
      { src: img('bilflo-buffalo.png'), caption: 'Bilflo — buffalo logomark study' },
    ],
  },
  {
    id: 'johnnys-mobile-detail',
    title: "Johnny's Mobile Detail",
    caption: 'Logo design for a mobile auto detailing service',
    category: 'graphic-design',
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
    category: 'graphic-design',
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
      { src: img('60-mug.png'), caption: 'Amtec 60 Years — branded merchandise' },
      { src: img('60-party.jpg'), caption: 'Amtec 60 Years — event signage' },
      { src: img('60-years.jpg'), caption: 'Amtec 60 Years — anniversary badge' },
    ],
  },
  {
    id: 'blackmagic-collective',
    title: 'Blackmagic Collective',
    caption: 'Logo design for a filmmaker collective',
    category: 'graphic-design',
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
    category: 'graphic-design',
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
    category: 'graphic-design',
    kind: 'image',
    src: img('inspire-logo.png'),
  },
  {
    id: 'bad-badge',
    title: 'Bad Badge',
    caption: 'Badge lettering and illustration',
    category: 'graphic-design',
    kind: 'image',
    src: img('bad-badge.png'),
  },
  {
    id: 'cali-type',
    title: 'California',
    caption: 'Hand-drawn type study',
    category: 'graphic-design',
    kind: 'image',
    src: img('cali-type.png'),
  },
  {
    id: 'zr-monogram',
    title: 'ZR Monogram',
    caption: 'Personal monogram',
    category: 'graphic-design',
    kind: 'image',
    src: img('zr-monogram.png'),
  },

  /* ------------------------------ Illustration ----------------------------- */
  {
    id: 'guitars',
    title: 'Guitars',
    caption: 'An ongoing illustration series of guitars and basses',
    category: 'illustration',
    kind: 'carousel',
    slides: [
      { src: img('mustang-guitar.png'), caption: 'Fender Mustang' },
      { src: img('jag-guitar.png'), caption: 'Fender Jaguar' },
      { src: img('tele-guitar.png'), caption: 'Fender Telecaster' },
      { src: img('junior-guitar.png'), caption: 'Gibson Les Paul Junior' },
      { src: img('ryans-guitar.png'), caption: "Ryan's guitar" },
      { src: img('tylers-bass.png'), caption: "Tyler's bass" },
    ],
  },
  {
    id: 'mustang-floor',
    title: 'Mustang on the Floor',
    caption: 'Illustration',
    category: 'illustration',
    kind: 'image',
    src: img('mustang-guitar-floor.png'),
  },
  {
    id: 'the-shop',
    title: 'The Shop',
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
    id: 'cacti',
    title: 'Cacti',
    caption: 'Illustration',
    category: 'illustration',
    kind: 'image',
    src: img('cacti.png'),
  },
  {
    id: 'porsche',
    title: 'Porsche',
    caption: 'Flat-four illustration',
    category: 'illustration',
    kind: 'image',
    src: img('porsche.png'),
  },
  {
    id: 'bus-truck',
    title: 'Bus & Truck',
    caption: 'Vehicle illustrations',
    category: 'illustration',
    kind: 'image',
    src: img('bus-truck.png'),
  },
  {
    id: 'bug',
    title: 'Bug',
    caption: 'VW Beetle illustration',
    category: 'illustration',
    kind: 'image',
    src: img('bug.png'),
  },
  {
    id: 'chucks',
    title: 'Chucks',
    caption: 'Sneaker illustration',
    category: 'illustration',
    kind: 'image',
    src: img('chucks-2.png'),
  },
  {
    id: 'vans',
    title: 'Vans',
    caption: 'Sneaker illustration',
    category: 'illustration',
    kind: 'image',
    src: img('vans-2.png'),
  },
  {
    id: 'drone',
    title: 'Drone',
    caption: 'Illustration',
    category: 'illustration',
    kind: 'image',
    src: img('drone.png'),
  },
  {
    id: 'robot-arm',
    title: 'Robot Arm',
    caption: 'Illustration',
    category: 'illustration',
    kind: 'image',
    src: img('robot-arm.png'),
  },
  {
    id: 'twin-amp',
    title: 'Twin Amp',
    caption: 'Amplifier illustration',
    category: 'illustration',
    kind: 'image',
    src: img('twin-amp.png'),
  },
  {
    id: 'krk-speaker',
    title: 'KRK Speaker',
    caption: 'Studio monitor illustration',
    category: 'illustration',
    kind: 'image',
    src: img('krk-speaker.png'),
  },
  {
    id: 'a7x-speaker',
    title: 'A7X Speaker',
    caption: 'Studio monitor illustration',
    category: 'illustration',
    kind: 'image',
    src: img('a7x-speaker.png'),
  },
  {
    id: 'recording-studio',
    title: 'Recording Studio',
    caption: 'Illustrated studio scene',
    category: 'illustration',
    kind: 'image',
    src: img('recording-studio-2.png'),
  },
  {
    id: 'be-my-quarantine',
    title: 'Be My Quarantine',
    caption: 'Illustration, 2020',
    category: 'illustration',
    kind: 'image',
    src: img('be-my-quarantine.png'),
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
      { src: img('time-clock.png'), caption: 'Bilflo — time tracking' },
      { src: img('invoice.png'), caption: 'Bilflo — invoicing' },
      { src: img('time-and-money.png'), caption: 'Bilflo — billing' },
      { src: img('printer.png'), caption: 'Bilflo — reporting' },
      { src: img('laptop.png'), caption: 'Bilflo — dashboard' },
      { src: img('monitor.png'), caption: 'Bilflo — analytics' },
    ],
  },
  {
    id: 'light-phone-tools',
    title: 'Light Phone Tools',
    caption: 'Interface design for a suite of minimalist Light Phone III tools',
    category: 'web-ui',
    kind: 'carousel',
    slides: [
      { src: img('lp3-home.png'), caption: 'Light Phone Tools — home' },
      { src: img('lp3-tuner.png'), caption: 'Light Phone Tools — tuner' },
      { src: img('lp3-tuner-live.png'), caption: 'Light Phone Tools — tuner, listening' },
      { src: img('lp3-tone-a2.png'), caption: 'Light Phone Tools — tone generator' },
      { src: img('lp3-tone-sharp.png'), caption: 'Light Phone Tools — pitch offset' },
      { src: img('lp3-centered.png'), caption: 'Light Phone Tools — centered readout' },
      { src: img('lp3-tuner-perm.png'), caption: 'Light Phone Tools — permissions' },
      { src: img('lp3-live-v2.png'), caption: 'Light Phone Tools — live view' },
      { src: img('lp3-demo-v2.png'), caption: 'Light Phone Tools — demo mode' },
      { src: img('lp3-nodemo.png'), caption: 'Light Phone Tools — standard mode' },
      { src: img('lp3.png'), caption: 'Light Phone Tools — device' },
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
    kind: 'image',
    src: img('baby-artemis-with-collapsible-exhaust-flame.jpg'),
  },
  {
    id: 'starship-mini',
    title: 'Starship Mini',
    caption: 'Starship model with a collapsible exhaust flame',
    category: '3d',
    kind: 'image',
    src: img('starship-mini-with-collapsible-exhaust-flame.jpg'),
  },
  {
    id: 'vw-thing',
    title: 'VW Thing — Tooned',
    caption: 'Stylized Volkswagen Type 181 model',
    category: '3d',
    kind: 'image',
    src: img('vw-thing-tooned.jpg'),
  },
  {
    id: 'stubby-rod',
    title: 'Stubby Rod',
    caption: 'Hot rod pencil holder',
    category: '3d',
    kind: 'image',
    src: img('stubby-rod-pencil-holder.png'),
  },
  {
    id: 'artemis-badge',
    title: 'Artemis Badge',
    caption: 'Printable Artemis mission badge',
    category: '3d',
    kind: 'image',
    src: img('artemis-badge.jpg'),
  },
  {
    id: 'cross-shadow-box',
    title: 'Light of the World',
    caption: 'Cross shadow box',
    category: '3d',
    kind: 'image',
    src: img('light-of-the-world-cross-shadow-box.png'),
  },
  {
    id: 'catalina-planter',
    title: 'The Catalina Planter',
    caption: 'Planter design',
    category: '3d',
    kind: 'image',
    src: img('the-catalina-planter.jpg'),
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
    id: 'james-jawharp',
    title: 'James — Jaw Harp',
    caption: 'Short-form video, shot and edited',
    category: 'videography',
    kind: 'video',
    src: 'work/video/james-jawharp.mp4',
    poster: img('james-jawharp-poster.jpg'),
  },

  /* --------------------------------- Music ---------------------------------
     Nothing here yet. To add a track, drop a cover into
     src/assets/work/music/ and add an entry like:

       {
         id: 'some-track',
         title: 'Some Track',
         caption: 'Written, performed and produced',
         category: 'music',
         kind: 'embed',
         html: '<iframe src="https://open.spotify.com/embed/track/…" …></iframe>',
         poster: img('some-track-cover.jpg'),
       }
  --------------------------------------------------------------------------- */
];
