// seo/check-links.js — wykrywa martwe wewnętrzne linki w wygenerowanych stronach.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
function walk(d) {
  let r = [];
  if (!fs.existsSync(d)) return r;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name === 'index.html') r.push(p);
  }
  return r;
}
const dirs = ['fizyka', 'zadania-z-fizyki', 'matura-z-fizyki', 'korepetycje-z-fizyki', 'baza-wiedzy', 'blog'].map(d => path.join(ROOT, d));
let files = [];
dirs.forEach(d => { files = files.concat(walk(d)); });
const toUrl = f => '/' + path.relative(ROOT, f).split(path.sep).join('/').replace(/index\.html$/, '');
const exist = new Set(files.map(toUrl));
const spa = new Set(['/', '/kurs', '/korepetycje', '/oferta-ratunkowa', '/login', '/register', '/regulamin', '/polityka-prywatnosci', '/user', '/pricing', '/planer', '/home']);
const assetPrefix = ['/css/', '/images/', '/js/'];
let dead = new Map();
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) {
    let u = m[1];
    if (spa.has(u)) continue;
    if (assetPrefix.some(p => u.startsWith(p))) continue;
    let norm = u.endsWith('/') ? u : u + '/';
    if (exist.has(norm) || exist.has(u)) continue;
    dead.set(u, (dead.get(u) || 0) + 1);
  }
}
console.log('Wygenerowanych ścieżek:', exist.size);
console.log('Martwe linki wewnętrzne:', dead.size);
[...dead.entries()].slice(0, 40).forEach(([u, n]) => console.log('  ', u, '(' + n + 'x)'));
