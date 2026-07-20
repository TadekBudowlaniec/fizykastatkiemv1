#!/usr/bin/env node
/* seo/generate.js
 * Generator statycznych, indeksowalnych stron SEO dla Fizyka Statkiem.
 *
 * Wejście:  seo/content/batch*.json  (treść działów) + seo/cities.js
 * Wyjście:  realne pliki .html w katalogach pod adresami przyjaznymi SEO,
 *           sitemap.xml oraz robots.txt w katalogu głównym.
 *
 * Uruchomienie:  node seo/generate.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Konfiguracja
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://fizykastatkiem.pl';
const BRAND = 'Fizyka Statkiem';
const EMAIL = 'fizykastatkiem@gmail.com';
const TODAY = process.env.SEO_DATE || new Date().toISOString().slice(0, 10);

const cities = require('./cities.js');

// Wczytaj treść działów z plików batch*.json
function loadTopics() {
  const dir = path.join(__dirname, 'content');
  if (!fs.existsSync(dir)) { console.error('Brak katalogu seo/content — uruchom agentów treści.'); process.exit(1); }
  const files = fs.readdirSync(dir).filter(f => /^batch\d+\.json$/.test(f)).sort();
  let topics = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    let data;
    try { data = JSON.parse(raw); }
    catch (e) { console.error(`Błąd JSON w ${f}: ${e.message}`); process.exit(1); }
    topics = topics.concat(Array.isArray(data) ? data : [data]);
  }
  return topics;
}

// Wczytaj artykuły blogowe z seo/content/blog.json
function loadPosts() {
  const file = path.join(__dirname, 'content', 'blog.json');
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error(`Błąd JSON w blog.json: ${e.message}`); process.exit(1); }
}

// ---------------------------------------------------------------------------
// Pomocnicze
// ---------------------------------------------------------------------------
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
// Czysty tekst do JSON-LD: usuń tagi HTML i delimitery math
const plain = s => String(s == null ? '' : s)
  .replace(/<[^>]+>/g, ' ').replace(/\$\$/g, ' ').replace(/\\[()]/g, ' ')
  .replace(/\s+/g, ' ').trim();

let _written = 0;
function writePage(urlPath, html) {
  // urlPath np. '/fizyka/kinematyka/' -> plik .../fizyka/kinematyka/index.html
  const rel = urlPath.replace(/^\//, '').replace(/\/$/, '');
  const outDir = path.join(ROOT, rel);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  _written++;
}

// ---------------------------------------------------------------------------
// Wspólne elementy układu (header / footer / shell)
// ---------------------------------------------------------------------------
function header() {
  return `<header>
  <div class="container">
    <nav>
      <a href="/" class="logo">
        <img src="/images/magenta_statek.png" alt="${BRAND}" height="40">
        <span class="logo-text">${BRAND}</span>
      </a>
      <div class="nav-main-buttons">
        <a class="btn btn-outline nav-cta-btn" href="/kurs">📚 Kurs</a>
        <a class="btn btn-outline nav-cta-btn" href="/baza-wiedzy/">📖 Baza wiedzy</a>
        <a class="btn btn-outline nav-cta-btn" href="/blog/">📝 Blog</a>
        <a class="btn btn-outline nav-cta-btn" href="/korepetycje">👨‍🏫 Korepetycje</a>
        <a class="btn btn-primary nav-cta-btn" href="/register">✨ Załóż konto</a>
      </div>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-content">
    <div class="footer-links">
      <a href="/baza-wiedzy/">Baza wiedzy</a>
      <a href="/blog/">Blog</a>
      <a href="/korepetycje">Korepetycje</a>
      <a href="/kurs">Kurs online</a>
      <a href="/regulamin">Regulamin</a>
      <a href="/polityka-prywatnosci">Polityka Prywatności</a>
    </div>
    <div class="footer-contact">kontakt: <a href="mailto:${EMAIL}">${EMAIL}</a></div>
    <div class="footer-copy">© ${TODAY.slice(0,4)} ${BRAND} — Wszelkie prawa zastrzeżone</div>
  </div>
</footer>`;
}

const KATEX = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<script>document.addEventListener("DOMContentLoaded",function(){if(window.renderMathInElement){renderMathInElement(document.body,{delimiters:[{left:"$$",right:"$$",display:true},{left:"\\\\(",right:"\\\\)",display:false}],throwOnError:false});}});</script>`;

function shell({ title, desc, canonical, jsonld = [], main, keywords, robots }) {
  const url = SITE + canonical;
  const ld = jsonld.filter(Boolean)
    .map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ''}
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${robots || 'index, follow, max-image-preview:large'}">
<meta property="og:type" content="article">
<meta property="og:locale" content="pl_PL">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITE}/images/logo_magenta.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/images/czarny_statek.png">
<meta name="theme-color" content="#6b4df6">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/seo.css">
${KATEX}
${ld}
</head>
<body>
${header()}
${main}
${footer()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Buildery fragmentów treści
// ---------------------------------------------------------------------------
function breadcrumbs(items) {
  // items: [{name, url|null}]
  const html = items.map((it, i) => {
    const last = i === items.length - 1;
    return last
      ? `<span aria-current="page">${esc(it.name)}</span>`
      : `<a href="${it.url}">${esc(it.name)}</a> <span>›</span> `;
  }).join('');
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name,
      ...(it.url ? { item: SITE + it.url } : {})
    }))
  };
  return { html: `<nav class="seo-breadcrumbs" aria-label="Okruszki">${html}</nav>`, ld };
}

function faqBlock(faqs) {
  if (!faqs || !faqs.length) return { html: '', ld: null };
  const html = `<h2>Najczęściej zadawane pytania</h2>
<div class="faq">${faqs.map(f => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join('')}</div>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: plain(f.q),
      acceptedAnswer: { '@type': 'Answer', text: plain(f.a) }
    }))
  };
  return { html, ld };
}

function formulasBlock(formulas) {
  if (!formulas || !formulas.length) return '';
  return `<h2>Najważniejsze wzory</h2>
<div class="formula-grid">${formulas.map(f => `
  <div class="formula-card">
    <div class="f-name">${esc(f.name)}</div>
    <div class="f-eq">$$${f.latex}$$</div>
    <div class="f-desc">${esc(f.desc)}</div>
  </div>`).join('')}</div>`;
}

function definitionsBlock(defs) {
  if (!defs || !defs.length) return '';
  return `<h2>Kluczowe pojęcia</h2>
<dl class="def-list">${defs.map(d => `<div class="def-item"><dt>${esc(d.term)}</dt><dd>${d.def}</dd></div>`).join('')}</dl>`;
}

function theoryBlock(theory) {
  if (!theory || !theory.length) return '';
  return theory.map(s => `<section><h2>${esc(s.heading)}</h2>${s.html}</section>`).join('\n');
}

function problemBlock(p) {
  return `<article class="problem">
  <h3 class="p-title">${esc(p.title)}</h3>
  <div class="p-task">${esc(p.tresc)}</div>
  <ol class="p-steps">${(p.steps || []).map(s => `<li>${s}</li>`).join('')}</ol>
  <div class="p-answer">${p.answer || ''}</div>
</article>`;
}

function relatedCard(kicker, title, desc, url) {
  return `<a class="related-card" href="${url}">
    <span class="rc-kicker">${esc(kicker)}</span>
    <span class="rc-title">${esc(title)}</span>
    <span class="rc-desc">${esc(desc)}</span>
  </a>`;
}

function ctaCenter() {
  return `<div class="cta-band">
    <h2>Potrzebujesz pomocy z fizyką?</h2>
    <p>Dołącz do kursu online albo umów indywidualne korepetycje. Tłumaczymy fizykę prosto — krok po kroku, aż zrozumiesz.</p>
    <a class="btn btn-light" href="/korepetycje">👨‍🏫 Zobacz korepetycje</a>
    <a class="btn btn-light" href="/kurs">📚 Przejdź do kursu</a>
  </div>`;
}

// Sekcja linków powiązanych dla strony działu
function relatedSection(topic, topicsBySlug, kind) {
  const cards = [];
  // Inne ujęcia tego samego działu
  if (kind !== 'teoria') cards.push(relatedCard('Teoria i wzory', `${topic.name} — teoria`, `Definicje, prawa i wzory z ${topic.dopelniacz}.`, `/fizyka/${topic.slug}/`));
  if (kind !== 'zadania') cards.push(relatedCard('Zadania', `Zadania z ${topic.dopelniacz}`, `Rozwiązania krok po kroku.`, `/zadania-z-fizyki/${topic.slug}/`));
  if (kind !== 'matura') cards.push(relatedCard('Matura', `${topic.name} na maturze`, `Wymagania CKE i typowe zadania.`, `/matura-z-fizyki/${topic.slug}/`));
  // Działy powiązane
  (topic.related || []).forEach(sl => {
    const t = topicsBySlug[sl];
    if (t) cards.push(relatedCard('Powiązany dział', t.name, `Przejdź do teorii ${t.dopelniacz}.`, `/fizyka/${t.slug}/`));
  });
  return `<h2>Zobacz również</h2><div class="related-grid">${cards.join('')}</div>`;
}

// ---------------------------------------------------------------------------
// Generatory poszczególnych typów stron
// ---------------------------------------------------------------------------
function genTeoria(topic, topicsBySlug) {
  const canonical = `/fizyka/${topic.slug}/`;
  const title = `${topic.name} — teoria, wzory i definicje | Fizyka | ${BRAND}`;
  const desc = topic.metaTeoria || `${topic.name}: teoria, wzory i definicje. Wytłumaczenie krok po kroku dla licealistów i maturzystów.`;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `${topic.name} — teoria`, url: null }
  ]);
  const faq = faqBlock(topic.faqTeoria);
  const article = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `${topic.name} — teoria i wzory`, inLanguage: 'pl',
    description: plain(desc), datePublished: TODAY, dateModified: TODAY,
    author: { '@type': 'Organization', name: BRAND },
    publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: `${SITE}/images/logo_magenta.png` } },
    mainEntityOfPage: SITE + canonical
  };
  const chips = (topic.theory || []).map((s, i) => `<a href="#sek-${i}">${esc(s.heading)}</a>`).join('');
  const theoryHtml = (topic.theory || []).map((s, i) => `<section id="sek-${i}"><h2>${esc(s.heading)}</h2>${s.html}</section>`).join('\n');
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Teoria fizyki</p>
  <h1>${esc(topic.name)} — teoria, wzory i definicje</h1>
  <p>${esc(topic.intro)}</p>
  <div class="hero-cta"><a class="btn btn-light" href="/zadania-z-fizyki/${topic.slug}/">Przejdź do zadań →</a></div>
</div>
${chips ? `<nav class="chip-nav">${chips}</nav>` : ''}
<div class="prose">
${theoryHtml}
${formulasBlock(topic.formulas)}
${definitionsBlock(topic.definitions)}
${faq.html}
</div>
${ctaCenter()}
${relatedSection(topic, topicsBySlug, 'teoria')}
</main>`;
  writePage(canonical, shell({
    title, desc, canonical, main,
    keywords: `${topic.name.toLowerCase()}, ${topic.name.toLowerCase()} wzory, ${topic.name.toLowerCase()} teoria, fizyka, matura`,
    jsonld: [bc.ld, article, faq.ld]
  }));
}

function genMatura(topic, topicsBySlug) {
  const canonical = `/matura-z-fizyki/${topic.slug}/`;
  const title = `Matura z fizyki: ${topic.name} — wymagania i zadania | ${BRAND}`;
  const desc = topic.metaMatura || `${topic.name} na maturze z fizyki: wymagania CKE, typowe zadania i strategia. Poziom podstawowy i rozszerzony.`;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `Matura: ${topic.name}`, url: null }
  ]);
  const mi = topic.maturaInfo || {};
  const faq = faqBlock(topic.faqMatura);
  const typowe = (mi.typoweZadania || []).map(t => `<tr><td>${esc(t)}</td></tr>`).join('');
  const strategia = (mi.strategia || []).map(s => `<li>${esc(s)}</li>`).join('');
  const article = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `Matura z fizyki: ${topic.name}`, inLanguage: 'pl',
    description: plain(desc), datePublished: TODAY, dateModified: TODAY,
    author: { '@type': 'Organization', name: BRAND },
    publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: `${SITE}/images/logo_magenta.png` } },
    mainEntityOfPage: SITE + canonical
  };
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Matura z fizyki</p>
  <h1>Matura z fizyki: ${esc(topic.name)}</h1>
  <p>${esc(mi.zakres || topic.intro)}</p>
  <div class="hero-cta"><a class="btn btn-light" href="/oferta-ratunkowa">⚓ Kurs maturalny</a></div>
</div>
<div class="prose">
<section><h2>Jak ${esc(topic.name.toLowerCase())} pojawia się na maturze?</h2>${mi.html || `<p>${esc(topic.intro)}</p>`}
<p><strong>Poziom:</strong> ${esc(mi.poziom || 'podstawowy i rozszerzony')}.</p></section>
${typowe ? `<section><h2>Typowe zadania maturalne</h2><table class="seo-table"><thead><tr><th>Typ zadania z ${esc(topic.dopelniacz)}</th></tr></thead><tbody>${typowe}</tbody></table></section>` : ''}
${strategia ? `<section><h2>Strategia na egzaminie</h2><ul>${strategia}</ul></section>` : ''}
${formulasBlock(topic.formulas)}
${faq.html}
</div>
${ctaCenter()}
${relatedSection(topic, topicsBySlug, 'matura')}
</main>`;
  writePage(canonical, shell({
    title, desc, canonical, main,
    keywords: `matura ${topic.name.toLowerCase()}, ${topic.name.toLowerCase()} matura, matura z fizyki, fizyka rozszerzona`,
    jsonld: [bc.ld, article, faq.ld]
  }));
}

function genZadaniaHub(topic, topicsBySlug) {
  const canonical = `/zadania-z-fizyki/${topic.slug}/`;
  const title = `Zadania z ${topic.dopelniacz} z rozwiązaniami | ${BRAND}`;
  const desc = `Zadania z ${topic.dopelniacz} z pełnymi rozwiązaniami krok po kroku. ${topic.name} — przykłady na poziomie liceum i matury.`;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `Zadania: ${topic.name}`, url: null }
  ]);
  const subs = topic.subtopics || [];
  const subCards = subs.map(s => relatedCard('Zestaw zadań', s.name, s.intro || `Zadania: ${s.name}.`, `/zadania-z-fizyki/${topic.slug}/${s.slug}/`)).join('');
  // Na stronie-hubie pokaż po jednym przykładzie z każdego podtematu
  const samples = subs.map(s => (s.problems && s.problems[0]) ? `<h3>${esc(s.name)}</h3>${problemBlock(s.problems[0])}` : '').join('\n');
  const faq = faqBlock(topic.faqTeoria);
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Zadania z rozwiązaniami</p>
  <h1>Zadania z ${esc(topic.dopelniacz)} — rozwiązania krok po kroku</h1>
  <p>${esc(topic.intro)}</p>
  <div class="hero-cta"><a class="btn btn-light" href="/fizyka/${topic.slug}/">📖 Powtórz teorię</a></div>
</div>
${subCards ? `<h2>Kategorie zadań</h2><div class="related-grid">${subCards}</div>` : ''}
<div class="prose">
<h2>Przykładowe zadania z rozwiązaniami</h2>
${samples}
${faq.html}
</div>
${ctaCenter()}
${relatedSection(topic, topicsBySlug, 'zadania')}
</main>`;
  writePage(canonical, shell({
    title, desc, canonical, main,
    keywords: `zadania z ${topic.dopelniacz}, ${topic.name.toLowerCase()} zadania, zadania z fizyki, rozwiązania`,
    jsonld: [bc.ld]
  }));
  // Podstrony podtematów
  subs.forEach(s => genZadaniaSub(topic, s, topicsBySlug));
}

function genZadaniaSub(topic, sub, topicsBySlug) {
  const canonical = `/zadania-z-fizyki/${topic.slug}/${sub.slug}/`;
  const title = `${sub.name} — zadania z rozwiązaniami | ${topic.name} | ${BRAND}`;
  const desc = `${sub.name}: zadania z fizyki z pełnymi rozwiązaniami krok po kroku. ${esc(sub.intro || '')}`.slice(0, 160);
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: '/baza-wiedzy/' },
    { name: `Zadania: ${topic.name}`, url: `/zadania-z-fizyki/${topic.slug}/` },
    { name: sub.name, url: null }
  ]);
  const problems = (sub.problems || []).map(problemBlock).join('\n');
  const faq = faqBlock(sub.faq);
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">${esc(topic.name)} · zadania</p>
  <h1>${esc(sub.name)} — zadania z rozwiązaniami</h1>
  <p>${esc(sub.intro || '')}</p>
</div>
<div class="prose">
${problems}
${faq.html}
</div>
${ctaCenter()}
<h2>Więcej zadań</h2>
<div class="related-grid">
${(topic.subtopics || []).filter(x => x.slug !== sub.slug).map(x => relatedCard('Zadania', x.name, x.intro || '', `/zadania-z-fizyki/${topic.slug}/${x.slug}/`)).join('')}
${relatedCard('Teoria', `${topic.name} — teoria`, `Wzory i definicje z ${topic.dopelniacz}.`, `/fizyka/${topic.slug}/`)}
</div>
</main>`;
  writePage(canonical, shell({
    title, desc, canonical, main,
    keywords: `${sub.name.toLowerCase()}, ${sub.name.toLowerCase()} zadania, zadania z fizyki`,
    jsonld: [bc.ld, faq.ld]
  }));
}

function genCity(city, topics) {
  const canonical = `/korepetycje-z-fizyki/${city.slug}/`;
  const title = `Korepetycje z fizyki online — ${city.name} | matura i liceum | ${BRAND}`;
  const desc = `Korepetycje z fizyki online dla uczniów z ${city.locative}. Przygotowanie do matury i poprawa ocen. Indywidualne lekcje 1:1, elastyczne terminy.`;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Korepetycje z fizyki', url: '/korepetycje-z-fizyki/' },
    { name: city.name, url: null }
  ]);
  const ucz = (city.uczelnie || []).map(u => `<li>${esc(u)}</li>`).join('');
  const dz = (city.dzielnice || []).join(', ');
  const dzialyLinks = topics.slice(0, 12).map(t => relatedCard('Dział', t.name, `Teoria i wzory z ${t.dopelniacz}.`, `/fizyka/${t.slug}/`)).join('');
  const service = {
    '@context': 'https://schema.org', '@type': 'Service',
    serviceType: 'Korepetycje z fizyki online', name: `Korepetycje z fizyki online — ${city.name}`,
    description: plain(desc), areaServed: { '@type': 'City', name: city.name },
    provider: { '@type': 'EducationalOrganization', name: BRAND, url: SITE },
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' }, inLanguage: 'pl'
  };
  const faqCity = faqBlock([
    { q: `Czy korepetycje z fizyki w ${city.locative} odbywają się online?`, a: `Tak. Prowadzimy lekcje online 1:1, więc możesz uczyć się z dowolnej dzielnicy ${city.name} (np. ${(city.dzielnice||[]).slice(0,3).join(', ')}) bez dojazdów — wystarczy komputer i internet.` },
    { q: `Czy przygotujecie mnie do matury z fizyki?`, a: `Tak, specjalizujemy się w przygotowaniu do matury z fizyki na poziomie podstawowym i rozszerzonym — od podstaw aż po zadania maturalne CKE.` },
    { q: `Ile kosztują korepetycje z fizyki?`, a: `Mamy kilka pakietów — od samodzielnego kursu online po indywidualne lekcje live. Szczegóły i ceny znajdziesz na stronie korepetycji.` },
    { q: `Od czego zacząć naukę fizyki?`, a: `Najlepiej od solidnych podstaw — zajrzyj do naszej Bazy wiedzy z teorią i zadaniami z każdego działu, a na lekcjach uzupełnimy luki.` }
  ]);
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Korepetycje z fizyki online</p>
  <h1>Korepetycje z fizyki online — ${esc(city.name)}</h1>
  <p>Uczysz się w ${esc(city.locative)} i potrzebujesz wsparcia z fizyki? Prowadzimy indywidualne korepetycje online 1:1 oraz kurs maturalny — bez dojazdów, w dogodnych terminach.</p>
  <div class="hero-cta"><a class="btn btn-light" href="/korepetycje">Sprawdź ofertę i ceny →</a></div>
</div>
<div class="prose">
<section><h2>Korepetycje z fizyki dla uczniów z ${esc(city.name)}</h2>
<p>${esc(city.akcent)}</p>
<p>Naszą metodą uczymy fizyki <strong>prosto i obrazowo</strong> — tłumaczymy mechanizm zjawiska, a nie każemy wkuwać wzorów na pamięć. Lekcje online sprawdzają się u uczniów z całego ${esc(city.name)}${dz ? ` — od dzielnic takich jak ${esc(dz)}` : ''}.</p></section>
${ucz ? `<section><h2>Przygotowanie pod uczelnie w ${esc(city.locative)}</h2>
<p>Dobry wynik z fizyki na maturze otwiera drzwi na kierunki techniczne lokalnych uczelni:</p><ul>${ucz}</ul></section>` : ''}
<section><h2>Co zyskujesz?</h2>
<ul>
<li><strong>Lekcje 1:1</strong> — pełna uwaga nauczyciela skupiona na Twoich brakach.</li>
<li><strong>Przygotowanie do matury</strong> — poziom podstawowy i rozszerzony, zadania CKE.</li>
<li><strong>Materiały i baza zadań</strong> — dostęp do teorii i zadań z rozwiązaniami online.</li>
<li><strong>Elastyczne terminy</strong> — uczysz się wtedy, kiedy Ci pasuje, bez dojazdów po ${esc(city.locative)}.</li>
</ul></section>
<section><h2>Materiały do nauki — wszystkie działy fizyki</h2>
<p>Niezależnie od korepetycji możesz korzystać z naszej darmowej bazy wiedzy:</p>
<div class="related-grid">${dzialyLinks}</div></section>
${faqCity.html}
</div>
${ctaCenter()}
<h2>Korepetycje w innych miastach</h2>
<div class="chip-nav">${cities.filter(c => c.slug !== city.slug).slice(0, 12).map(c => `<a href="/korepetycje-z-fizyki/${c.slug}/">Fizyka ${esc(c.name)}</a>`).join('')}</div>
</main>`;
  writePage(canonical, shell({
    title, desc, canonical, main,
    keywords: `korepetycje z fizyki ${city.name.toLowerCase()}, fizyka ${city.name.toLowerCase()}, korepetycje fizyka online, matura fizyka ${city.name.toLowerCase()}`,
    jsonld: [bc.ld, service, faqCity.ld]
  }));
}

function genCityHub(topics) {
  const canonical = `/korepetycje-z-fizyki/`;
  const title = `Korepetycje z fizyki online — cała Polska | matura i liceum | ${BRAND}`;
  const desc = `Korepetycje z fizyki online w całej Polsce. Indywidualne lekcje 1:1, przygotowanie do matury podstawowej i rozszerzonej. Wybierz swoje miasto.`;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Korepetycje z fizyki', url: null }
  ]);
  const cityCards = cities.map(c => relatedCard('Miasto', `Fizyka ${c.name}`, `Korepetycje z fizyki online dla uczniów z ${c.locative}.`, `/korepetycje-z-fizyki/${c.slug}/`)).join('');
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Korepetycje z fizyki online</p>
  <h1>Korepetycje z fizyki online — cała Polska</h1>
  <p>Uczymy fizyki online w całym kraju. Indywidualne lekcje 1:1, kurs maturalny i baza zadań z rozwiązaniami. Wybierz swoje miasto albo od razu sprawdź ofertę.</p>
  <div class="hero-cta"><a class="btn btn-light" href="/korepetycje">Oferta i ceny →</a></div>
</div>
<div class="prose">
<section><h2>Wybierz swoje miasto</h2>
<div class="related-grid">${cityCards}</div></section>
</div>
${ctaCenter()}
</main>`;
  writePage(canonical, shell({ title, desc, canonical, main, keywords: 'korepetycje z fizyki online, korepetycje fizyka, matura fizyka', jsonld: [bc.ld] }));
}

function genHub(topics) {
  const canonical = `/baza-wiedzy/`;
  const title = `Baza wiedzy z fizyki — teoria, wzory i zadania z rozwiązaniami | ${BRAND}`;
  const desc = `Darmowa baza wiedzy z fizyki: teoria, wzory i zadania z rozwiązaniami ze wszystkich działów — od kinematyki po fizykę jądrową. Idealne na maturę.`;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Baza wiedzy', url: null }
  ]);
  const teoria = topics.map(t => relatedCard('Teoria', t.name, `Teoria i wzory z ${t.dopelniacz}.`, `/fizyka/${t.slug}/`)).join('');
  const zadania = topics.map(t => relatedCard('Zadania', `Zadania: ${t.name}`, `Rozwiązania krok po kroku.`, `/zadania-z-fizyki/${t.slug}/`)).join('');
  const matura = topics.map(t => relatedCard('Matura', `Matura: ${t.name}`, `Wymagania i typowe zadania.`, `/matura-z-fizyki/${t.slug}/`)).join('');
  const collection = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Baza wiedzy z fizyki', inLanguage: 'pl', description: plain(desc),
    isPartOf: { '@type': 'WebSite', name: BRAND, url: SITE }, url: SITE + canonical
  };
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Baza wiedzy</p>
  <h1>Baza wiedzy z fizyki — teoria, wzory i zadania</h1>
  <p>Wszystko, czego potrzebujesz do nauki fizyki w jednym miejscu: przejrzysta teoria, komplet wzorów i setki zadań z rozwiązaniami krok po kroku. Idealne do powtórki przed maturą.</p>
  <div class="hero-cta">
    <a class="btn btn-light" href="/korepetycje-z-fizyki/">👨‍🏫 Korepetycje online</a>
    <a class="btn btn-light" href="/oferta-ratunkowa">⚓ Kurs maturalny</a>
  </div>
</div>
<div class="hub-section"><h2>📖 Teoria i wzory — działy fizyki</h2><div class="hub-grid">${teoria}</div></div>
<div class="hub-section"><h2>✍️ Zadania z rozwiązaniami</h2><div class="hub-grid">${zadania}</div></div>
<div class="hub-section"><h2>🎓 Matura z fizyki</h2><div class="hub-grid">${matura}</div></div>
${ctaCenter()}
</main>`;
  writePage(canonical, shell({ title, desc, canonical, main, keywords: 'fizyka, teoria fizyki, wzory fizyka, zadania z fizyki, matura fizyka, baza wiedzy', jsonld: [bc.ld, collection] }));
}

function genArtykul(post, postsBySlug, topicsBySlug) {
  const canonical = `/blog/${post.slug}/`;
  const title = `${post.title} | ${BRAND}`;
  const desc = post.metaDesc || post.excerpt;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Blog', url: '/blog/' },
    { name: post.title, url: null }
  ]);
  const faq = faqBlock(post.faq);
  const article = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: plain(post.title), inLanguage: 'pl',
    description: plain(desc), datePublished: post.date || TODAY, dateModified: TODAY,
    author: { '@type': 'Organization', name: BRAND },
    publisher: { '@type': 'Organization', name: BRAND, logo: { '@type': 'ImageObject', url: `${SITE}/images/logo_magenta.png` } },
    mainEntityOfPage: SITE + canonical
  };
  const chips = (post.sections || []).map((s, i) => `<a href="#sek-${i}">${esc(s.heading)}</a>`).join('');
  const body = (post.sections || []).map((s, i) => `<section id="sek-${i}"><h2>${esc(s.heading)}</h2>${s.html}</section>`).join('\n');
  // Linkowanie wewnętrzne: powiązane artykuły + działy bazy wiedzy
  const cards = [];
  (post.related || []).forEach(sl => {
    const p = postsBySlug[sl];
    if (p) cards.push(relatedCard('Artykuł', p.title, p.excerpt, `/blog/${p.slug}/`));
  });
  (post.relatedTopics || []).forEach(sl => {
    const t = topicsBySlug[sl];
    if (t) cards.push(relatedCard('Baza wiedzy', t.name, `Teoria i wzory z ${t.dopelniacz}.`, `/fizyka/${t.slug}/`));
  });
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Blog</p>
  <h1>${esc(post.title)}</h1>
  <p>${esc(post.intro)}</p>
  <div class="hero-cta"><a class="btn btn-light" href="/baza-wiedzy/">📖 Baza wiedzy</a></div>
</div>
${chips ? `<nav class="chip-nav">${chips}</nav>` : ''}
<div class="prose">
${body}
${faq.html}
</div>
${ctaCenter()}
${cards.length ? `<h2>Zobacz również</h2><div class="related-grid">${cards.join('')}</div>` : ''}
</main>`;
  writePage(canonical, shell({
    title, desc, canonical, main, keywords: post.keywords,
    jsonld: [bc.ld, article, faq.ld]
  }));
}

function genBlogHub(posts) {
  const canonical = `/blog/`;
  const title = `Blog o fizyce i maturze — porady i plany nauki | ${BRAND}`;
  const desc = `Blog Fizyka Statkiem: jak uczyć się fizyki do matury, jak korzystać z karty wzorów, najczęstsze błędy maturalne i kierunki studiów wymagające fizyki.`;
  const bc = breadcrumbs([
    { name: 'Strona główna', url: '/' },
    { name: 'Blog', url: null }
  ]);
  const cards = posts.map(p => relatedCard('Artykuł', p.title, p.excerpt, `/blog/${p.slug}/`)).join('');
  const collection = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: 'Blog o fizyce i maturze', inLanguage: 'pl', description: plain(desc),
    isPartOf: { '@type': 'WebSite', name: BRAND, url: SITE }, url: SITE + canonical
  };
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: plain(p.title), url: `${SITE}/blog/${p.slug}/`
    }))
  };
  const main = `<main class="seo-main">
${bc.html}
<div class="seo-hero">
  <p class="eyebrow">Blog</p>
  <h1>Blog o fizyce i maturze</h1>
  <p>Praktyczne poradniki dla maturzystów: jak zaplanować naukę, jak czytać kartę wzorów, gdzie najczęściej traci się punkty i jakie studia wymagają fizyki.</p>
  <div class="hero-cta">
    <a class="btn btn-light" href="/baza-wiedzy/">📖 Baza wiedzy</a>
    <a class="btn btn-light" href="/oferta-ratunkowa">⚓ Kurs maturalny</a>
  </div>
</div>
<div class="hub-section"><h2>📝 Najnowsze artykuły</h2><div class="hub-grid">${cards}</div></div>
${ctaCenter()}
</main>`;
  writePage(canonical, shell({
    title, desc, canonical, main,
    keywords: 'blog fizyka, nauka fizyki, matura z fizyki porady, jak uczyć się fizyki',
    jsonld: [bc.ld, collection, itemList]
  }));
}

// Strona 404 — serwowana przez regułę catch-all w _redirects z kodem 404.
// Dzięki temu nieistniejące adresy zwracają twardy błąd zamiast kopii strony
// głównej (miękkie 404), którą Google indeksowałby jako duplikat.
function gen404(topics, posts) {
  const title = `Nie znaleziono strony (404) | ${BRAND}`;
  const desc = 'Ta strona nie istnieje lub została przeniesiona. Skorzystaj z bazy wiedzy, bloga albo wróć na stronę główną.';
  const dzialy = topics.slice(0, 6)
    .map(t => relatedCard('Teoria', t.name, `Teoria i wzory z ${t.dopelniacz}.`, `/fizyka/${t.slug}/`)).join('');
  const artykuly = posts.slice(0, 3)
    .map(p => relatedCard('Artykuł', p.title, p.excerpt, `/blog/${p.slug}/`)).join('');
  const main = `<main class="seo-main">
<div class="seo-hero">
  <p class="eyebrow">Błąd 404</p>
  <h1>Nie znaleziono takiej strony</h1>
  <p>Adres, pod który trafiłeś, nie istnieje lub został zmieniony. Poniżej znajdziesz miejsca, od których warto zacząć.</p>
  <div class="hero-cta">
    <a class="btn btn-light" href="/">🏠 Strona główna</a>
    <a class="btn btn-light" href="/baza-wiedzy/">📖 Baza wiedzy</a>
    <a class="btn btn-light" href="/blog/">📝 Blog</a>
  </div>
</div>
${dzialy ? `<div class="hub-section"><h2>📖 Popularne działy fizyki</h2><div class="hub-grid">${dzialy}</div></div>` : ''}
${artykuly ? `<div class="hub-section"><h2>📝 Z bloga</h2><div class="hub-grid">${artykuly}</div></div>` : ''}
${ctaCenter()}
</main>`;
  const html = shell({
    title, desc, canonical: '/404.html', main,
    robots: 'noindex, follow',
    jsonld: [],
  });
  fs.writeFileSync(path.join(ROOT, '404.html'), html, 'utf8');
  _written++;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const topics = loadTopics();
  const topicsBySlug = {};
  topics.forEach(t => { topicsBySlug[t.slug] = t; });

  const urls = [];
  const add = (loc, pri, freq) => urls.push({ loc, pri, freq });

  // Strony aplikacji (SPA) — też warto w sitemap
  add('/', '1.0', 'weekly');
  add('/korepetycje', '0.9', 'monthly');
  add('/kurs', '0.8', 'monthly');
  add('/oferta-ratunkowa', '0.8', 'monthly');

  genHub(topics); add('/baza-wiedzy/', '0.9', 'weekly');

  topics.forEach(t => {
    genTeoria(t, topicsBySlug); add(`/fizyka/${t.slug}/`, '0.8', 'monthly');
    genMatura(t, topicsBySlug); add(`/matura-z-fizyki/${t.slug}/`, '0.8', 'monthly');
    genZadaniaHub(t, topicsBySlug); add(`/zadania-z-fizyki/${t.slug}/`, '0.8', 'monthly');
    (t.subtopics || []).forEach(s => add(`/zadania-z-fizyki/${t.slug}/${s.slug}/`, '0.7', 'monthly'));
  });

  genCityHub(topics); add('/korepetycje-z-fizyki/', '0.8', 'monthly');
  cities.forEach(c => { genCity(c, topics); add(`/korepetycje-z-fizyki/${c.slug}/`, '0.7', 'monthly'); });

  // Blog — artykuły poradnikowe
  const posts = loadPosts();
  const postsBySlug = {};
  posts.forEach(p => { postsBySlug[p.slug] = p; });
  if (posts.length) {
    genBlogHub(posts); add('/blog/', '0.8', 'weekly');
    posts.forEach(p => {
      genArtykul(p, postsBySlug, topicsBySlug);
      add(`/blog/${p.slug}/`, '0.7', 'monthly');
    });
  }

  // Strona 404 (poza sitemap — nie indeksujemy jej)
  gen404(topics, posts);

  // Sitemap
  const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.freq || 'monthly'}</changefreq>
    <priority>${u.pri || '0.6'}</priority>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sm, 'utf8');

  // robots.txt
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');

  console.log(`✓ Wygenerowano ${_written} podstron HTML`);
  console.log(`✓ Sitemap: ${urls.length} URL-i -> sitemap.xml`);
  console.log(`✓ robots.txt zapisany`);
  console.log(`  Działów: ${topics.length}, Miast: ${cities.length}, Artykułów: ${posts.length}`);
}

main();
