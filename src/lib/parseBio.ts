// Parses src/content/bio.md into structured data + a token stream.
//
// Frontmatter: simple `key: value` lines (no quoting/multi-line needed for this site).
// Body: paragraphs separated by blank lines. Inline `{logo:slug}` tokens are
// extracted so the page can render them as <Logo /> components instead of text.

export interface BioData {
  name: string;
  pronounced: string;
  tagline: string;
  email: string;
  linkedin: string;
}

export type BioToken =
  | { type: 'text'; value: string }
  | { type: 'logo'; slug: string }
  | { type: 'flag'; emoji: string; text: string }
  | { type: 'slash' };

export interface ParsedBio {
  data: BioData;
  paragraphs: BioToken[][];
}

const REQUIRED_KEYS: (keyof BioData)[] = [
  'name',
  'pronounced',
  'tagline',
  'email',
  'linkedin',
];

export function parseBio(raw: string): ParsedBio {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('bio.md: frontmatter block not found');
  const [, frontmatter, body] = match;

  const data: Record<string, string> = {};
  for (const line of frontmatter.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) data[m[1]] = m[2].trim();
  }

  for (const key of REQUIRED_KEYS) {
    if (!data[key]) throw new Error(`bio.md: missing required frontmatter "${key}"`);
  }

  const paragraphs = body
    .trim()
    .split(/\n{2,}/)
    .map(tokenize);

  return { data: data as unknown as BioData, paragraphs };
}

function tokenize(paragraph: string): BioToken[] {
  const out: BioToken[] = [];
  // Match {logo:slug}, {flag:emoji|text}, or the bare {slash} token.
  const re =
    /\{logo:([a-z0-9-]+)\}|\{flag:([^|}]+)\|([^}]+)\}|\{slash\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(paragraph)) !== null) {
    if (m.index > last) {
      out.push({ type: 'text', value: paragraph.slice(last, m.index) });
    }
    if (m[1] !== undefined) {
      out.push({ type: 'logo', slug: m[1] });
    } else if (m[2] !== undefined && m[3] !== undefined) {
      out.push({ type: 'flag', emoji: m[2], text: m[3] });
    } else {
      out.push({ type: 'slash' });
    }
    last = re.lastIndex;
  }
  if (last < paragraph.length) {
    out.push({ type: 'text', value: paragraph.slice(last) });
  }
  return out;
}
