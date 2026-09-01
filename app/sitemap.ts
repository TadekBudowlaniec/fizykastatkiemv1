import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { getTopics, getCities, getPosts } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Stała data — inaczej każdy deploy oznaczałby WSZYSTKIE ~200 URL jako
  // „zmienione dziś”, co Google traktuje jak szum i przestaje ufać lastmod.
  const now = new Date(process.env.SEO_DATE || '2025-09-01');
  const url = (path: string) => `${SITE.url}${path}`;
  const items: MetadataRoute.Sitemap = [];

  const add = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  ) => items.push({ url: url(path), lastModified: now, changeFrequency, priority });

  // Strony aplikacji / marketing (trailing slash - zgodnie z trailingSlash: true)
  add('/', 1.0, 'weekly');
  add('/cennik/', 0.9, 'monthly');
  add('/korepetycje/', 0.9, 'monthly');
  add('/o-mnie/', 0.6, 'yearly');
  add('/oferta-ratunkowa/', 0.8, 'monthly');
  add('/baza-wiedzy/', 0.9, 'weekly');

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

  add('/blog/', 0.8, 'weekly');
  for (const p of getPosts()) {
    add(`/blog/${p.slug}/`, 0.7, 'monthly');
  }

  // Strony prawne (linkowane w stopce)
  add('/regulamin/', 0.3, 'yearly');
  add('/polityka-prywatnosci/', 0.3, 'yearly');

  return items;
}
