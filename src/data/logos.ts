// Auto-discovers every SVG in src/assets/logos/ at build time.
// To add a logo:
//   1. Drop foo.svg into src/assets/logos/
//   2. (optional) Add a label override below if "Foo" isn't the right name
//   3. (optional) Add a URL below so the inline logo becomes a link

const svgModules = import.meta.glob('../assets/logos/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Override the default Title Case label for any slug whose display name
// doesn't follow the simple convention (e.g. "AB InBev", not "Ab Inbev").
const labelOverrides: Record<string, string> = {
  'ab-inbev': 'AB InBev',
  'jmsb': 'JMSB',
  'textnow': 'TextNow',
  '1021-creative': '1021 Creative',
  'vice': 'VICE',
  'youtube': 'YouTube',
  'telus': 'TELUS',
};

// Slugs whose SVG has a solid color extending to the viewBox edges.
// Logo component renders these with rounded corners.
const fullBleed = new Set<string>(['kudare']);

// Slugs whose brand identity *is* the wordmark (no separate icon).
// Logo component renders ONLY the SVG (no preceding word) for these.
const replacesText = new Set<string>(['vice']);

// Destination URLs. Slugs without an entry render as non-link spans.
// Some entries point to context-specific pages rather than the brand's
// main site (e.g. AB InBev → ZX Ventures LinkedIn, VICE → Virtue Worldwide).
const urlOverrides: Record<string, string> = {
  wikimedia: 'https://wikimediafoundation.org/',
  youtube: 'https://www.youtube.com/trends/',
  snap: 'https://ar.snap.com/lens-studio',
  textnow: 'https://www.textnow.com',
  rolex: 'https://www.rolex.com',
  ernesta: 'https://www.ernestarugs.com/',
  '1021-creative': 'https://www.1021creative.com',
  matterport: 'https://matterport.com',
  peloton: 'https://www.onepeloton.com',
  'ab-inbev': 'https://www.linkedin.com/company/zx-ventures/about/',
  vice: 'https://www.virtueworldwide.com',
  jmsb: 'https://www.concordia.ca/jmsb.html',
  kudare: 'https://kudare.co',
  betterment: 'https://www.betterment.com/work',
  unilever: 'https://www.unilever.com/',
  target: 'https://corporate.target.com/',
  telus: 'https://www.telus.com/en/about',
};

function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function pathToSlug(path: string): string {
  const match = path.match(/\/([^/]+)\.svg$/);
  if (!match) throw new Error(`Unexpected logo path: ${path}`);
  return match[1];
}

// Safeguard: every SVG must declare a viewBox or it can't scale into the
// inline chip area (browser falls back to width/height attrs, which CSS
// then overrides, and the icon "disappears" or renders as a sliver).
function assertViewBox(slug: string, svg: string): void {
  if (!/<svg\b[^>]*\bviewBox\s*=/i.test(svg)) {
    throw new Error(
      `Logo "${slug}" is missing a viewBox attribute. ` +
        `Add viewBox="0 0 W H" to src/assets/logos/${slug}.svg ` +
        `(W and H usually match the existing width/height attributes).`,
    );
  }
}

// Inlining multiple SVGs into one HTML page can cause id collisions when
// two SVGs use the same short ids inside <defs> (e.g. id="a" for one
// gradient and id="a" for another's clipPath). The browser matches the
// first id in the DOM, so the later SVG's url(#a) reference resolves to
// the wrong element — usually rendering parts of the icon invisible.
// We prefix every id and every url(#…)/href="#…" reference with the slug
// so each SVG's internal namespace is isolated.
function namespaceIds(slug: string, svg: string): string {
  const prefix = `logo-${slug.replace(/[^a-z0-9-]/gi, '-')}-`;

  const ids = new Set<string>();
  const idRe = /\bid="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = idRe.exec(svg)) !== null) {
    ids.add(match[1]);
  }

  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const next = prefix + id;
    svg = svg
      .replace(new RegExp(`\\bid="${esc}"`, 'g'), `id="${next}"`)
      .replace(new RegExp(`url\\(\\s*#${esc}\\s*\\)`, 'g'), `url(#${next})`)
      .replace(new RegExp(`\\bhref="#${esc}"`, 'g'), `href="#${next}"`)
      .replace(new RegExp(`xlink:href="#${esc}"`, 'g'), `xlink:href="#${next}"`);
  }

  return svg;
}

// Deterministic small rotation per slug (degrees). Makes inline logos
// feel hand-placed/stuck-on like stickers. Same slug always gets the
// same tilt — no surprises on rebuild.
function rotationFor(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  // Range [-4, 4], skip 0 so every logo has some life
  const raw = (Math.abs(hash) % 9) - 4;
  return raw === 0 ? 2 : raw;
}

// Per-logo visual-weight scaling. Most marks are roughly square and
// render at consistent inline size. Some (Peloton's vertical wave-Y)
// are tall-narrow and need a small boost to feel the same weight as
// the rest. Default is 1.0.
const scaleOverrides: Record<string, number> = {
  peloton: 1.3,
};

export interface Logo {
  label: string;
  svg: string;
  fullBleed: boolean;
  replacesText: boolean;
  rotation: number;
  scale: number;
  url?: string;
}

export const logos: Record<string, Logo> = Object.fromEntries(
  Object.entries(svgModules).map(([path, svg]) => {
    const slug = pathToSlug(path);
    assertViewBox(slug, svg);
    return [
      slug,
      {
        label: labelOverrides[slug] ?? slugToLabel(slug),
        svg: namespaceIds(slug, svg),
        fullBleed: fullBleed.has(slug),
        replacesText: replacesText.has(slug),
        rotation: rotationFor(slug),
        scale: scaleOverrides[slug] ?? 1,
        url: urlOverrides[slug],
      },
    ];
  }),
);
