import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const allowedStatuses = new Set(['stable', 'experimental', 'trial-pending']);
const externalMode = process.argv.includes('--external');
const errors = [];
const warnings = [];

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function stripFencedCode(content) {
  return content
    .replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
    .replace(/^~~~[^\n]*\n[\s\S]*?^~~~\s*$/gm, '');
}

function normalizeExternalUrl(url) {
  return url.replace(/[.,;:!?]+$/g, '');
}

const manifestPath = path.join(root, 'docs/release-status-v0.3.0.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.release !== '0.3.0') errors.push(`release manifest version is ${manifest.release}, expected 0.3.0`);

const skillDirents = await readdir(path.join(root, 'skills'), { withFileTypes: true });
const skillNames = skillDirents.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const skillSet = new Set(skillNames);
const manifestNames = Object.keys(manifest.skills ?? {}).sort();

for (const name of skillNames) {
  if (!(name in manifest.skills)) errors.push(`missing shipping status: ${name}`);
}
for (const name of manifestNames) {
  if (!skillSet.has(name)) errors.push(`shipping manifest contains non-public Skill: ${name}`);
  if (!allowedStatuses.has(manifest.skills[name])) errors.push(`invalid shipping status for ${name}: ${manifest.skills[name]}`);
}

for (const name of skillNames) {
  const skillFile = path.join(root, 'skills', name, 'SKILL.md');
  if (!await exists(skillFile)) {
    errors.push(`missing SKILL.md: ${name}`);
    continue;
  }
  const content = await readFile(skillFile, 'utf8');
  const frontmatter = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatter) {
    errors.push(`missing YAML frontmatter: skills/${name}/SKILL.md`);
    continue;
  }
  const declaredName = frontmatter[1].match(/^name:\s*([^\n]+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  if (declaredName !== name) errors.push(`frontmatter name mismatch: skills/${name}/SKILL.md declares ${declaredName ?? '<missing>'}`);
  if (!/^description:\s*(?:>|\||[^\n]+)/m.test(frontmatter[1])) errors.push(`frontmatter description missing: skills/${name}/SKILL.md`);
}

const markdownFiles = (await walk(root)).filter((file) => file.endsWith('.md') && !file.includes(`${path.sep}.git${path.sep}`));
const externalUrls = new Set();
for (const file of markdownFiles) {
  const content = stripFencedCode(await readFile(file, 'utf8'));
  const fileLabel = relative(file);

  for (const match of content.matchAll(/\bfuture\s+`([^`]+)`/g)) {
    if (skillSet.has(match[1])) errors.push(`${fileLabel}: stale future routing to existing Skill \`${match[1]}\``);
  }

  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1].trim();
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
    const titleCut = target.match(/^(\S+)(?:\s+["'].*["'])$/);
    if (titleCut) target = titleCut[1];
    if (/^https?:\/\//i.test(target)) {
      externalUrls.add(normalizeExternalUrl(target));
      continue;
    }
    if (/^(?:mailto:|tel:|data:|javascript:)/i.test(target) || target.startsWith('#')) continue;
    target = target.split('#')[0].split('?')[0];
    if (!target) continue;
    try { target = decodeURIComponent(target); } catch {}
    const resolved = path.resolve(path.dirname(file), target);
    if (!await exists(resolved)) errors.push(`${fileLabel}: broken relative markdown link -> ${target}`);
  }

  for (const match of content.matchAll(/https?:\/\/[^\s<>"'`]+/g)) {
    let url = normalizeExternalUrl(match[0]);
    while (url.endsWith(')') && (url.match(/\(/g)?.length ?? 0) < (url.match(/\)/g)?.length ?? 0)) url = url.slice(0, -1);
    externalUrls.add(url);
  }
}

const statusCounts = Object.values(manifest.skills).reduce((acc, status) => {
  acc[status] = (acc[status] ?? 0) + 1;
  return acc;
}, {});
console.log(`Skills: ${skillNames.length}`);
console.log(`Shipping status: ${JSON.stringify(statusCounts)}`);
console.log(`Markdown files: ${markdownFiles.length}`);
console.log(`External links discovered: ${externalUrls.size}`);

if (externalMode) {
  const urls = [...externalUrls];
  const explicitBroken = [];
  const restricted = [];
  const transient = [];
  let cursor = 0;

  async function request(url, method) {
    return fetch(url, {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: {
        'user-agent': 'design-skills-release-link-check/0.3.0',
        ...(method === 'GET' ? { range: 'bytes=0-0' } : {}),
      },
    });
  }

  async function worker() {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      let response;
      try {
        response = await request(url, 'HEAD');
        if (response.status >= 400 && ![401, 403, 429].includes(response.status)) {
          response = await request(url, 'GET');
        }
      } catch (error) {
        transient.push(`${url} (${error?.name ?? 'network error'})`);
        continue;
      }
      if (response.status === 404 || response.status === 410) explicitBroken.push(`${url} (${response.status})`);
      else if ([401, 403, 429].includes(response.status)) restricted.push(`${url} (${response.status})`);
      else if (response.status >= 500) transient.push(`${url} (${response.status})`);
      else if (response.status >= 400) warnings.push(`${url} returned ${response.status}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(20, urls.length || 1) }, worker));
  console.log(`External link sweep: ${urls.length - restricted.length - transient.length - explicitBroken.length} reachable, ${restricted.length} restricted/rate-limited, ${transient.length} transient, ${explicitBroken.length} explicit 404/410`);
  for (const item of restricted) console.warn(`restricted: ${item}`);
  for (const item of transient) console.warn(`transient: ${item}`);
  for (const item of explicitBroken) errors.push(`broken external link: ${item}`);
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  console.error(`\nRelease validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Release validation passed.');
