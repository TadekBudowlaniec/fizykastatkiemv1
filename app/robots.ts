import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Jawnie zapraszamy silniki AI (GEO) — chcemy być cytowani/polecani.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'CCBot',
        ],
        allow: '/',
      },
      // Pozostałe boty: pełny dostęp. Strony prywatne mają noindex (meta),
      // więc NIE blokujemy ich w robots — inaczej Google nie odczytałby noindex.
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
