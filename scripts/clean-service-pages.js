/**
 * Clean exported service page HTML without re-parsing (preserves structure).
 * Same approach as clean-region-pages.js, no Cheerio, no Prettier.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, '../site');

const SERVICES = [
  'ai', 'seo', 'ads', 'website-erstellung',
  'seo-services', 'seo-analyse', 'website-optimierung', 'landing-page-design',
  'google-ads', 'facebook-ads', 'meta-ads', 'digitale-werbung',
  'search-engine-marketing', 'email-marketing', 'google-maps-optimierung',
  'google-business-profile', 'lead-generierung', 'conversion-optimierung',
  'web-analyse-setup',
];

function splitFrontMatter(raw) {
  if (!raw.startsWith('---')) return { fm: '', body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: raw };
  return { fm: raw.slice(0, end + 4) + '\n', body: raw.slice(end + 4).trim() };
}

function stripFooter(html) {
  return html
    .replace(/\s*\{% include "service-regions\.njk" %\}[\s\S]*?\{% include "service-cta\.njk" %\}/g, '')
    .replace(/\s*\{% set ctaTitle[\s\S]*?\{% include "service-cta\.njk" %\}/g, '')
    .replace(/\s*\{% set ctaText[\s\S]*?%\}/g, '')
    .replace(/\s*\{% set ctaButton[\s\S]*?%\}/g, '')
    .trim();
}

function extractMain(body) {
  const match = body.match(/<main class="max-w-4xl mx-auto px-4 py-32">([\s\S]*?)<\/main>/);
  if (match) return match[1];
  // Blob export: nested wrappers around main
  const blob = body.match(/<main class="max-w-4xl mx-auto px-4 py-32">([\s\S]*)<\/main>/);
  if (blob) return blob[1];
  return body
    .replace(/<div class="min-h-screen[^"]*">/g, '')
    .replace(/<\/div>\s*$/g, '');
}

function cleanContent(html) {
  let out = html;

  // Strip outer min-h-screen wrappers if present
  out = out.replace(/^(\s*<div class="min-h-screen[^"]*">\s*)+/i, '');
  out = out.replace(/(\s*<\/div>\s*)+$/i, '');

  // Remove CTA gradient block (re-injected later)
  out = out.replace(
    /<section class="bg-gradient-to-r from-yellow-500 to-orange-500[\s\S]*?<\/section>/g,
    ''
  );

  // Remove inline regions block (replaced by service-regions.njk include)
  out = out.replace(
    /<section class="mb-16">\s*<h2[^>]*>Unternehmen aus der Region[\s\S]*?<\/section>/g,
    ''
  );

  // Trailing slash on internal links
  out = out.replace(/href="(\/[^"#?]*?)"/g, (match, href) => {
    if (!href.endsWith('/') && !href.includes('.')) return `href="${href}/"`;
    return match;
  });

  return out.trim();
}

function formatHtml(html) {
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'source', 'track', 'wbr',
  ]);
  let depth = 1;
  return html
    .replace(/></g, '>\n<')
    .split('\n')
    .map((raw) => {
      const line = raw.trim();
      if (!line) return '';
      if (line.startsWith('</')) depth = Math.max(1, depth - 1);
      const out = `${'  '.repeat(depth)}${line}`;
      const tag = line.match(/^<([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      const isVoid = tag && (voidTags.has(tag) || line.endsWith('/>'));
      const isSelfClosingPair =
        line.startsWith('<') && line.includes('</') && !line.startsWith('</');
      if (
        line.startsWith('<') &&
        !line.startsWith('</') &&
        !line.startsWith('<!') &&
        !isVoid &&
        !isSelfClosingPair
      ) {
        depth++;
      }
      return out;
    })
    .filter(Boolean)
    .join('\n');
}

for (const slug of SERVICES) {
  const filePath = path.join(siteDir, slug, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing', slug);
    continue;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { fm, body } = splitFrontMatter(raw);
  const main = extractMain(stripFooter(body));
  const cleaned = cleanContent(main);
  const pretty = formatHtml(cleaned);
  const output = `${fm}<main class="max-w-4xl mx-auto px-4 py-32">\n${pretty}\n</main>\n`;
  fs.writeFileSync(filePath, output);
  console.log(`✓ ${slug}/ (${output.split('\n').length} lines)`);
}

console.log('Done cleaning service pages.');
