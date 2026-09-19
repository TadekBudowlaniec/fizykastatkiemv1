import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import {
  getTopics,
  getCities,
  getPosts,
  SEO_PUBLISHED,
  SEO_CONTENT_UPDATED,
  SITE_UPDATED,
} from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Daty stałe, podbijane ręcznie (lib/seo.ts) - NIE data builda. Inaczej
  // każdy deploy oznaczałby ~190 URL jako „zmienione dziś” i Google
  // przestałby ufać lastmod. Osobno: marketing / baza wiedzy / wpisy bloga.
  const marketing = new Date(process.env.SEO_DATE || SITE_UPDATED);
  const content = new Date(process.env.SEO_DATE || SEO_CONTENT_UPDATED);
  const url = (path: string) => `${SITE.url}${path}`;
  const items: MetadataRoute.Sitemap = [];

  const add = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    lastModified: Date = content
  ) => items.push({ url: url(path), lastModified, changeFrequency, priority });

  // Strony marketingowe (trailing slash - zgodnie z trailingSlash: true)
  add('/', 1.0, 'weekly', marketing);
  add('/cennik/', 0.9, 'monthly', marketing);
  add('/dzialy/', 0.7, 'monthly', marketing);
  add('/korepetycje/', 0.9, 'monthly', marketing);
  add('/o-mnie/', 0.6, 'yearly', marketing);
  add('/baza-wiedzy/', 0.9, 'weekly');
  // /oferta-ratunkowa/ celowo pominięta (noindex - strona promocyjna).

  const topics = getTopics();
  for (const t of topics) {
    add(`/fizyka/${t.slug}/`, 0.8, 'monthly');
    add(`/matura-z-fizyki/${t.slug}/`, 0.8, 'monthly');
    add(`/zadania-z-fizyki/${t.slug}/`, 0.8, 'monthly');
    for (const s of t.subtopics ?? []) {
      add(`/zadania-z-fizyki/${t.slug}/${s.slug}/`, 0.7, 'monthly');
    }
  }

  add('/korepetycje-z-fizyki/', 0.8, 'monthly');
  for (const c of getCities()) {
    add(`/korepetycje-z-fizyki/${c.slug}/`, 0.7, 'monthly');
  }

  add('/blog/', 0.8, 'weekly', marketing);
  for (const p of getPosts()) {
    add(`/blog/${p.slug}/`, 0.7, 'monthly', new Date(p.date || SEO_PUBLISHED));
  }

  // Strony prawne (linkowane w stopce)
  add('/regulamin/', 0.3, 'yearly', marketing);
  add('/polityka-prywatnosci/', 0.3, 'yearly', marketing);

  return items;
}
