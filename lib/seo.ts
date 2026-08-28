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

// --- Daty do JSON-LD Article (strony evergreen) ---
export const SEO_PUBLISHED = '2025-09-01';
export function seoModified(): string {
  return process.env.SEO_DATE || new Date().toISOString().slice(0, 10);
}
