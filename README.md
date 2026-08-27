# Portfolio

Zac Reinke's portfolio — [zacreinke.github.io/Portfolio](https://zacreinke.github.io/Portfolio/)

Built with [Astro](https://astro.build) 7 and Tailwind CSS 4. Static output, no client
framework. Deploys to GitHub Pages automatically on every push to `master`.

## Running it

```bash
nvm use          # Node 22 (see .nvmrc)
npm install
npm run dev      # http://localhost:4321/Portfolio/
npm run build    # -> dist/
npm run preview  # serve the built site
```

## Adding work

Two steps:

1. Drop the file into `src/assets/work/<category>/` — one of `graphic-design`,
   `illustration`, `web-ui`, `3d`, `videography`, `music`.
2. Add an entry to the `work` array in `src/data/work.ts`, referencing the file by
   its bare filename.

Four kinds of item are supported:

| `kind` | Use for | Fields |
| --- | --- | --- |
| `image` | a single still | `src` |
| `carousel` | a project with several shots | `slides: [{ src, caption }]` |
| `video` | a self-hosted MP4 in `public/work/video/` | `src`, `poster` |
| `embed` | a hosted player (SoundCloud, YouTube) | `embed`, `poster`, optional `ratio` |

Carousel slides are flattened into the lightbox's linear sequence, so one set of
arrows walks every frame in the active tab.

## Interactive 3D

A carousel slide can be a model instead of a still — the render stays as the
cover, the model sits behind it:

```ts
slides: [
  { src: img('starship-mini.jpg'), caption: 'Starship Mini — render' },
  { model: 'starship-mini.glb',    caption: 'Starship Mini — interactive model' },
]
```

GLBs live in `public/models/`. To add one, convert an STL with Blender:

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
  --python scripts/stl-to-glb.py -- public/models/thing.glb 40000 ~/path/Thing.stl
```

The second argument is a triangle budget — anything above it gets decimated.
25–40k keeps files small without visible loss. Pass several STLs to join a
multi-part print, as long as the files already share a coordinate space.

Exported without Draco deliberately: the decoder is a ~250KB download and these
meshes are 68–440KB uncompressed, so it would cost more than it saves. STL
carries no colour, so every model gets the same neutral resin material.

`@google/model-viewer` is ~283KB gzipped and is code-split into its own chunk —
it is only fetched when someone actually opens a model, or arrows next to one.

Tabs come from `categories` in `src/data/site.ts`. A category with no items shows a
"coming soon" state instead of an empty grid.

Big video files bloat the repo and count against the 1 GB Pages limit — host anything
substantial on YouTube or Vimeo and use `kind: 'embed'`.

## Design

Colors and type are lifted from the resume in `../Resumes/resume-design.html` so the
two read as one identity: five colors, no accents, three weights, emphasis carried by
size, tracking and opacity. Tokens live in `src/styles/global.css`.
