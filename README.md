# reckziegel.me

Personal site for Kurt Reckziegel. Static site built with [Astro 5](https://astro.build), deployed to Hostinger shared hosting.

Lighthouse scores 100/100/100/100 across accessibility, best practices, SEO, and performance.

---

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # produces ./dist/ ready to upload
npm run preview    # serve ./dist/ locally to sanity-check the build
npm run og         # regenerate /public/og-image.png from scripts/build-og.mjs
```

Requires Node 20+ (project tested on Node 24).

---

## Where things live

| What                       | Where                                            |
| -------------------------- | ------------------------------------------------ |
| Bio copy                   | `src/content/bio.md`                             |
| Case studies               | `src/content/work/*.mdx`                         |
| Publications list          | `src/data/publications.ts`                       |
| Logo SVGs                  | `src/assets/logos/`                              |
| Logo manifest (URLs etc.)  | `src/data/logos.ts`                              |
| Inline `<Logo />` component| `src/components/Logo.astro`                      |
| Bio token parser           | `src/lib/parseBio.ts`                            |
| Home page                  | `src/pages/index.astro`                          |
| Work detail template       | `src/layouts/WorkDetail.astro`                   |
| Head / meta / OG / schema  | `src/layouts/Base.astro`                         |
| Global CSS                 | `src/styles/global.css`                          |
| 404 page                   | `src/pages/404.astro`                            |
| Favicon                    | `public/favicon.svg`                             |
| Headshot                   | `public/headshot.jpg`                            |
| OG share image             | `public/og-image.png` (regen with `npm run og`)  |
| Resume PDF                 | `public/Kurt Reckziegel Resume.pdf`              |
| `robots.txt`               | `public/robots.txt`                              |

---

## Content updates

### Adding or editing a case study

1. Create or open `src/content/work/<slug>.mdx`.
2. Frontmatter required:
   ```yaml
   ---
   title: "Case study headline."
   client: "Client Name"
   timeframe: "2024–2025"
   order: 5            # controls position in the home-page list (lower = higher)
   summary: "One-paragraph summary that becomes the meta description and intro."
   ---
   ```
3. Body is MDX — Markdown plus inline JSX. To use an inline brand logo:
   ```mdx
   import Logo from '../../components/Logo.astro';

   <Logo name="peloton" /> is where we built…
   ```
   - Use `label="Peloton's"` to override the rendered text (useful when the apostrophe-s needs to sit *before* the icon).
   - The route `/work/<slug>/` is generated automatically. Prev/next links between cases are sorted by `order`.

### Adding a brand logo

1. Drop the SVG into `src/assets/logos/<slug>.svg`. Must have a `viewBox` attribute (build will error if missing).
2. (Optional) In `src/data/logos.ts`:
   - Add a `labelOverrides` entry if the display name isn't title-case of the slug (e.g. `'ab-inbev': 'AB InBev'`).
   - Add a `urlOverrides` entry to make the logo a link.
   - Add to `fullBleed` set if the SVG fills its viewBox edge-to-edge (gets rounded corners).
   - Add to `replacesText` set if the brand identity is a wordmark only (no preceding text label, like VICE).
   - Add a `scaleOverrides` entry to adjust visual weight if the mark feels too small/large.
3. Reference it in `bio.md` as `{logo:<slug>}` or in a case study as `<Logo name="<slug>" />`.

### Updating the bio

Edit `src/content/bio.md`. Special tokens recognized by the parser:

- `{logo:slug}` — inline brand logo + label
- `{flag:🇨🇦|Canadian living stateside}` — hover-flag treatment (cursor turns into the emoji)
- `{slash}` — hand-drawn pink slash where a `/` would normally go

### Updating publications

Edit `src/data/publications.ts`. Each entry has a `title`, `outlet`, `year`, and `url`.

---

## Deploying to Hostinger

### One-time setup

1. **Domain**: Confirm `reckziegel.me` is registered and either pointing to Hostinger's nameservers (`ns1.dns-parking.com` etc.) or has an A record pointing at your Hostinger account's IP. Hostinger will tell you which to use under **Domains → DNS**.
2. **SSL**: Hostinger auto-provisions a free Let's Encrypt cert for any domain pointed at the account. Confirm under **SSL** in hPanel that the cert is active and "Force HTTPS" is enabled.
3. **File access**: Decide between Hostinger's File Manager (browser-based, fine for occasional updates) or FTP (faster for bulk uploads — credentials under **Files → FTP Accounts** in hPanel).

### Every deploy

```bash
npm run build
```

This produces a fully self-contained static site in `./dist/`. The structure looks like:

```
dist/
├── index.html                    ← home page
├── 404.html                      ← custom 404
├── favicon.svg
├── headshot.jpg
├── og-image.png
├── robots.txt
├── sitemap-index.xml
├── sitemap-0.xml
├── Kurt Reckziegel Resume.pdf
├── _astro/                       ← font + CSS bundles
└── work/
    ├── peloton-repositioning/
    │   └── index.html
    ├── textnow-ai-brief/
    │   └── index.html
    └── …
```

Upload the **contents** of `dist/` (not the folder itself) into Hostinger's `public_html/`. After upload the structure inside `public_html/` should be identical to what's inside `dist/` locally.

#### Via Hostinger File Manager

1. hPanel → **Files → File Manager**
2. Open `public_html/`
3. Delete any default Hostinger placeholder files (typically `default.php` or `index.html` from their setup wizard)
4. Drag the contents of your local `dist/` into the browser window. The File Manager handles nested folder uploads correctly.

#### Via FTP

```bash
# example using lftp; substitute your FTP creds from hPanel
lftp -e "mirror -R --delete dist/ public_html/; quit" \
  -u "$HOSTINGER_FTP_USER","$HOSTINGER_FTP_PASS" \
  ftp.reckziegel.me
```

`mirror -R --delete` does a full sync — anything in `public_html/` that doesn't exist in local `dist/` gets removed. Safe for this site since `dist/` is the complete output.

### After deploy

1. Hit `https://reckziegel.me/` in a private browser window to bypass any local cache
2. Click a case study, confirm it loads at `https://reckziegel.me/work/<slug>/`
3. Hit a deliberately bad URL like `/nope/` and confirm the custom 404 shows
4. Run a fresh Lighthouse audit against production (the dev preview already scores 100s, but verify with the deployed copy)

### Common gotchas

- **Pretty URLs**: Astro generates `/work/foo/index.html`, so `/work/foo/` works natively with no `.htaccess` config needed.
- **Don't upload `node_modules/`, `src/`, or `dist/` itself as a folder**: only the contents of `dist/`.
- **Don't commit secrets**: There are no secrets in this project. If you ever add an API key, put it in `.env` and never commit that file.
- **Favicon cache**: Browsers cache favicons aggressively. After updating, hard-refresh (Cmd+Shift+R) to see the new one.

---

## What's in the site

A short reference for future-you so you remember what's in there:

- **Home page**: bio with inline brand logos, three-line tagline with hand-drawn pink scribbles (question mark, "brands" circle, double underline), tilted sticker logos, click-to-copy email, pronunciation speaker, Selected Work list, Publications list.
- **Case studies**: 12 of them, one per `.mdx` file. Each has the inline-logo treatment for first-mention brands.
- **Identity wordmark on inner pages**: small tilted headshot + name, links home.
- **Footer**: scribble divider, LinkedIn + resume download, hand-drawn "I personally built this from scratch" with a "Go me!" tooltip.
- **Animations**: Multi-wave page-load motion on home (identity pops, bio settles, right column slides, scribbles draw in last). Inner pages use a simpler settle-up. Respects `prefers-reduced-motion`.
- **Easter eggs**:
  - Konami code (↑↑↓↓←→←→BA) makes every inline logo wiggle. Type again to stop.
  - Click headshot for a spin.
  - Console message visible when DevTools is open.
  - "Canadian living stateside" turns the cursor into a 🇨🇦.
  - Big-screen note between columns on very wide viewports.
- **SEO/metadata**: Per-page titles + descriptions, canonical URLs, OG + Twitter cards, Person JSON-LD schema, sitemap-index, robots.txt.
- **Performance**: Single self-hosted font (Caveat, weight 700 only), inline SVGs, no JS framework runtime, no external trackers, no analytics.

---

## Stack

- [Astro 5](https://astro.build) — static site generator
- [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) — JSX-in-Markdown for case studies
- [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — generates `/sitemap-index.xml`
- [@fontsource/caveat](https://fontsource.org/fonts/caveat) — self-hosted handwriting font
- [sharp](https://sharp.pixelplumbing.com/) — used by `scripts/build-og.mjs` to rasterize the OG image

No client-side framework runtime. No analytics. No CDN dependencies at runtime.

---

## Local Lighthouse audit

Lighthouse is installed as a devDependency. To re-audit at any point:

```bash
npm run build
npm run preview    # in one terminal
# in another terminal:
npx lighthouse http://localhost:4322/ \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=accessibility,best-practices,seo,performance \
  --throttling-method=provided \
  --preset=desktop \
  --view
```

`--view` opens the HTML report in a browser when done.
