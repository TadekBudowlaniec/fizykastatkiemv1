# Generator SEO — Fizyka Statkiem

System generuje **statyczne, indeksowalne podstrony HTML** (programmatic SEO) z treścią
o fizyce: teoria, zadania z rozwiązaniami, matura oraz korepetycje wg miast.

## Jak to działa

```
seo/
  content/batch1..5.json   # treść 20 działów fizyki (JSON) — źródło prawdy
  cities.js                # 20 miast (korepetycje online)
  generate.js              # SILNIK: czyta content + cities -> pisze pliki .html, sitemap.xml, robots.txt
  check-links.js           # walidator martwych linków wewnętrznych
```

Wygenerowane katalogi (w katalogu głównym repo, serwowane bezpośrednio przez Netlify):

| URL | Co to |
|-----|-------|
| `/baza-wiedzy/` | hub linkujący wszystkie podstrony |
| `/fizyka/<dzial>/` | teoria + wzory + definicje + FAQ |
| `/zadania-z-fizyki/<dzial>/` | hub zadań działu |
| `/zadania-z-fizyki/<dzial>/<podtemat>/` | zadania z rozwiązaniami krok po kroku |
| `/matura-z-fizyki/<dzial>/` | wymagania CKE, typowe zadania, strategia |
| `/korepetycje-z-fizyki/` | hub miast |
| `/korepetycje-z-fizyki/<miasto>/` | korepetycje online w danym mieście |

> Netlify serwuje realne pliki PRZED regułą `/* /index.html 200` z `_redirects`,
> więc statyczne strony SEO działają, a SPA pozostaje fallbackiem dla pozostałych ścieżek.

## Regeneracja

```bash
node seo/generate.js      # przebuduj wszystkie strony + sitemap.xml + robots.txt
node seo/check-links.js   # sprawdź martwe linki wewnętrzne (powinno być 0)
```

## Jak dodać więcej podstron (skalowanie do setek)

- **Nowy dział** → dopisz obiekt do dowolnego `content/batchN.json` (schemat jak istniejące).
- **Nowy podtemat zadań** → dodaj wpis do `subtopics` w danym dziale (każdy = nowa podstrona).
- **Nowe miasto** → dopisz obiekt do `cities.js`.
- Uruchom `node seo/generate.js`. Sitemap i linki zaktualizują się same.

## Po wdrożeniu (Google)

1. Zweryfikuj domenę w **Google Search Console**.
2. Prześlij `https://fizykastatkiem.pl/sitemap.xml`.
3. Sprawdź wyrywkowo strony w teście wyników z elementami rozszerzonymi (Rich Results Test).
