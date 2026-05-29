# reckziegel.me

Personal site for Kurt Reckziegel. Static site built with [Astro 5](https://astro.build), deployed to Hostinger shared hosting. Auto-deploys via GitHub Actions on every push to `main`.

Source published for transparency and as a portfolio piece; not maintained as a reusable template.

Lighthouse scores 100/100/100/100 across accessibility, best practices, SEO, and performance.

---

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # generate ./dist/ locally (GitHub Actions does this on push)
npm run preview    # serve ./dist/ locally to sanity-check the production build
npm run og         # regenerate /public/og-image.png from scripts/build-og.mjs
```

Deploying is `git push` — see [Deploying](#deploying). Requires Node 20+ (project tested on Node 24).

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
| Apache config (404, cache) | `public/.htaccess`                               |
| Deploy workflow            | `.github/workflows/deploy.yml`                   |

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

## Deploying

This site auto-deploys via GitHub Actions. Push to `main`, the workflow at `.github/workflows/deploy.yml` runs, builds the site, and uploads `./dist/` over FTPS to Hostinger. End-to-end takes ~60 seconds.

### Day-to-day workflow

```bash
# 1. Edit something (case study, bio, CSS, whatever)
# 2. (Optional) Preview locally
npm run dev          # http://localhost:4321

# 3. Commit and push — that's the deploy
git add .
git commit -m "Short description of the change"
git push
```

Watch the run at `gh run watch` in the terminal, or in the browser at the **Actions** tab of the GitHub repo. When it goes green, hard-refresh `https://reckziegel.me/` (Cmd+Shift+R) to see the change live.

### How the auto-deploy works

The workflow file lives at `.github/workflows/deploy.yml`. It triggers on:

- Any push to the `main` branch
- Manual runs from the **Actions** tab on GitHub (the "Run workflow" button)

Steps each run:

1. Check out the latest code from the repo
2. Set up Node 24
3. Run `npm ci` (deterministic install from `package-lock.json`)
4. Run `npm run build` to generate `./dist/`
5. Sync `./dist/` to Hostinger via FTPS using [SamKirkland/FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action). Only changed files get uploaded — the action tracks state via `.ftp-deploy-sync-state.json` on the server.

### Required GitHub Secrets

Three encrypted secrets configured under **Settings → Secrets and variables → Actions** on the GitHub repo:

| Secret name    | Value                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `FTP_SERVER`   | FTP hostname or IP from hPanel → **Files → FTP Accounts**. **Bare hostname only** — no `ftp://` prefix, no trailing slash. |
| `FTP_USERNAME` | FTP username (looks like `u123456789` or `u123456789.reckziegel.me`)                           |
| `FTP_PASSWORD` | FTP password                                                                                   |

### Server-dir gotcha

The workflow's `server-dir` is set to `/domains/reckziegel.me/public_html/` — that's the actual document root for this site on Hostinger's premium hosting layout.

**Do NOT change this to `/public_html/`** (the obvious-looking default). That folder exists at the FTP account's home directory level, but it's **NOT** the live document root for the domain. Files uploaded there go nowhere visible to the public.

If you ever set up auto-deploy for a different domain on the same hosting account, the pattern is: `/domains/<that-domain>/public_html/`.

### One-time setup already done

- **Domain + DNS + SSL**: `reckziegel.me` points at Hostinger nameservers; Let's Encrypt cert is auto-provisioned. No action needed unless you change registrars.
- **`.htaccess`**: Lives at `public/.htaccess` in the repo, which Astro copies to `dist/.htaccess` at build time. Two responsibilities: it serves the custom 404 (`ErrorDocument 404 /404.html`) and sets cache headers (HTML 5 min, images/PDF 30 days, fingerprinted CSS/JS/fonts 1 year). Modify with care — wrong cache rules can stale-serve broken updates.

### After a deploy, verify

For trivial content edits, hard-refresh and eyeball the live site. For anything bigger:

1. Hit `https://reckziegel.me/` in a **private window** to bypass cache
2. Click into a case study, confirm it loads at `/work/<slug>/`
3. Hit a deliberately bad URL like `/nope/` and confirm the custom 404 still serves
4. (For major changes) re-run the Lighthouse audit — see section below

### Manual fallback (emergency only)

If auto-deploy is broken and you need to push a fix urgently:

```bash
npm run build
```

Then upload contents of `dist/` manually to `/domains/reckziegel.me/public_html/` via Hostinger File Manager.

**Important**: in hPanel File Manager, the **"Access files of reckziegel.me"** shortcut routes you directly into the correct doc root. The **"Access all files"** option lands you at the account home, where there's a leftover `/public_html/` that's a dead-end trap. Use the domain-specific shortcut.

### Common gotchas

- **The leftover `/public_html/`** at the home directory level is from initial Hostinger setup and isn't served. Don't upload there. If you see old files there, ignore them.
- **Cache headers** mean your browser might serve cached HTML for up to 5 minutes after a deploy. Hard-refresh (Cmd+Shift+R) to see fresh content immediately.
- **Don't commit secrets**: No secrets in this codebase currently. If you ever add one (API key, etc.), put it in `.env` (already in `.gitignore`) and reference via environment variables.
- **Lockfile discipline**: If you `npm install` a new dependency locally, commit both `package.json` AND `package-lock.json`. The Actions runner uses `npm ci` which fails if the lockfile is out of sync.
- **Pretty URLs**: Astro generates `/work/foo/index.html`, which serves cleanly at `/work/foo/` with no extra `.htaccess` config required.

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
