// Loadery treści SEO - czytają te same źródła co seo/generate.js.
// Dane statyczne (import JSON) => pełne SSG w Next.js.
import batch1 from '@/seo/content/batch1.json';
import batch2 from '@/seo/content/batch2.json';
import batch3 from '@/seo/content/batch3.json';
import batch4 from '@/seo/content/batch4.json';
import batch5 from '@/seo/content/batch5.json';
import blog from '@/seo/content/blog.json';
// cities.js to CommonJS (module.exports = [...])
import citiesRaw from '@/seo/cities.js';

export type Formula = { name: string; latex: string; desc: string };
export type Definition = { term: string; def: string };
export type Section = { heading: string; html: string };
export type Faq = { q: string; a: string };
export type Problem = {
  title: string;
  tresc: string;
  steps: string[];
  answer?: string;
};
export type Subtopic = {
  slug: string;
  name: string;
  intro?: string;
  problems?: Problem[];
  faq?: Faq[];
};
export type MaturaInfo = {
  poziom?: string;
  zakres?: string;
  html?: string;
  typoweZadania?: string[];
  strategia?: string[];
};
export type Topic = {
  slug: string;
  name: string;
  dopelniacz: string;
  metaTeoria?: string;
  metaMatura?: string;
  intro: string;
  theory?: Section[];
  formulas?: Formula[];
  definitions?: Definition[];
  maturaInfo?: MaturaInfo;
  faqTeoria?: Faq[];
  faqMatura?: Faq[];
  subtopics?: Subtopic[];
  related?: string[];
};
export type Post = {
  slug: string;
  title: string;
  metaDesc?: string;
  keywords?: string;
  excerpt: string;
  intro: string;
  sections?: Section[];
  faq?: Faq[];
  relatedTopics?: string[];
  related?: string[];
  date?: string;
};
export type City = {
  slug: string;
  name: string;
  locative: string;
  mieszkancy: string;
  uczelnie?: string[];
  dzielnice?: string[];
  akcent: string;
};

const TOPICS: Topic[] = [
  ...(batch1 as unknown as Topic[]),
  ...(batch2 as unknown as Topic[]),
  ...(batch3 as unknown as Topic[]),
  ...(batch4 as unknown as Topic[]),
  ...(batch5 as unknown as Topic[]),
];

const POSTS: Post[] = blog as unknown as Post[];
const CITIES: City[] = citiesRaw as unknown as City[];

export function getTopics(): Topic[] {
  return TOPICS;
}
export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}
export function topicsBySlug(): Record<string, Topic> {
  return Object.fromEntries(TOPICS.map((t) => [t.slug, t]));
}

export function getPosts(): Post[] {
  return POSTS;
}
export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
export function postsBySlug(): Record<string, Post> {
  return Object.fromEntries(POSTS.map((p) => [p.slug, p]));
}

export function getCities(): City[] {
  return CITIES;
}
export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

/** Czysty tekst do JSON-LD (usuwa tagi HTML i delimitery math). */
export function plain(s: string | undefined | null): string {
  return String(s ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$\$/g, ' ')
    .replace(/\\[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Daty do JSON-LD Article i sitemapy ---
export const SEO_PUBLISHED = '2025-09-01';
/** Ostatnia realna aktualizacja treści bazy wiedzy (batch*.json). Podbijać
 *  ręcznie przy edycji treści - NIE `new Date()`, bo każdy deploy zawyżałby
 *  dateModified/lastmod wszystkich stron i Google przestałby ufać datom. */
export const SEO_CONTENT_UPDATED = '2026-09-16';
/** Ostatnia zmiana stron marketingowych (oferta, cennik, layout). */
export const SITE_UPDATED = '2026-09-19';
export function seoModified(): string {
  return process.env.SEO_DATE || SEO_CONTENT_UPDATED;
}

/** Meta description: ucina na granicy słowa (nie w połowie wyrazu) i dokleja „…”. */
export function clipDesc(text: string, max = 158): string {
  const t = plain(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\s]+$/, '') + '…';
}

// --- Tytuły SERP ---
// Layout dokleja „ | Fizyka Statkiem” (17 znaków). Google ucina tytuły ok.
// 60 znaków, więc przy dłuższych bazach oddajemy tytuł bez sufiksu marki
// (absolute) zamiast pozwolić, by ucięta została fraza kluczowa.
const BRAND_SUFFIX_LEN = ' | Fizyka Statkiem'.length;
const TITLE_MAX = 62;
export function seoTitle(base: string): string | { absolute: string } {
  const b = base.trim();
  return b.length + BRAND_SUFFIX_LEN > TITLE_MAX ? { absolute: b } : b;
}
