// seo/cities.js
// Top 20 polskich miast pod strony "korepetycje z fizyki online [miasto]".
// Każde miasto ma lokalne wariacje treści (uczelnie, dzielnice, akcenty),
// żeby strony NIE były szablonowe (ochrona przed karą Google za doorway/thin content).
module.exports = [
  {
    slug: 'warszawa', name: 'Warszawa', locative: 'Warszawie', mieszkancy: 'warszawiacy',
    uczelnie: ['Politechnika Warszawska', 'Uniwersytet Warszawski', 'Wojskowa Akademia Techniczna'],
    dzielnice: ['Mokotów', 'Ursynów', 'Wola', 'Praga', 'Bemowo', 'Bielany'],
    akcent: 'Stolica skupia największą liczbę liceów o profilu politechnicznym, a konkurencja o miejsca na Politechnice Warszawskiej jest ogromna — dlatego solidne przygotowanie z fizyki rozszerzonej jest tu na wagę złota.'
  },
  {
    slug: 'krakow', name: 'Kraków', locative: 'Krakowie', mieszkancy: 'krakowianie',
    uczelnie: ['Akademia Górniczo-Hutnicza', 'Uniwersytet Jagielloński', 'Politechnika Krakowska'],
    dzielnice: ['Krowodrza', 'Podgórze', 'Nowa Huta', 'Bronowice', 'Dębniki'],
    akcent: 'AGH i kierunki techniczne UJ przyciągają tłumy maturzystów — fizyka rozszerzona to często przepustka na wymarzony kierunek inżynierski w Krakowie.'
  },
  {
    slug: 'wroclaw', name: 'Wrocław', locative: 'Wrocławiu', mieszkancy: 'wrocławianie',
    uczelnie: ['Politechnika Wrocławska', 'Uniwersytet Wrocławski'],
    dzielnice: ['Krzyki', 'Fabryczna', 'Psie Pole', 'Śródmieście', 'Stare Miasto'],
    akcent: 'Politechnika Wrocławska należy do ścisłej czołówki uczelni technicznych w Polsce, a progi punktowe na informatykę czy automatykę wymagają wysokiego wyniku z fizyki.'
  },
  {
    slug: 'poznan', name: 'Poznań', locative: 'Poznaniu', mieszkancy: 'poznaniacy',
    uczelnie: ['Politechnika Poznańska', 'Uniwersytet im. Adama Mickiewicza'],
    dzielnice: ['Jeżyce', 'Grunwald', 'Wilda', 'Nowe Miasto', 'Stare Miasto'],
    akcent: 'Poznańskie licea od lat osiągają świetne wyniki maturalne, a Politechnika Poznańska stawia poprzeczkę wysoko — dobre korepetycje z fizyki realnie podnoszą szanse rekrutacyjne.'
  },
  {
    slug: 'gdansk', name: 'Gdańsk', locative: 'Gdańsku', mieszkancy: 'gdańszczanie',
    uczelnie: ['Politechnika Gdańska', 'Uniwersytet Gdański'],
    dzielnice: ['Wrzeszcz', 'Oliwa', 'Przymorze', 'Zaspa', 'Śródmieście'],
    akcent: 'Trójmiasto to silny ośrodek inżynierski i morski — Politechnika Gdańska kształci m.in. oceanotechników i elektroników, gdzie fizyka jest fundamentem.'
  },
  {
    slug: 'lodz', name: 'Łódź', locative: 'Łodzi', mieszkancy: 'łodzianie',
    uczelnie: ['Politechnika Łódzka', 'Uniwersytet Łódzki'],
    dzielnice: ['Bałuty', 'Górna', 'Polesie', 'Widzew', 'Śródmieście'],
    akcent: 'Politechnika Łódzka słynie z kierunków technicznych i mechatroniki — maturzyści z Łodzi coraz częściej wybierają fizykę rozszerzoną, by zwiększyć szanse na rekrutację.'
  },
  {
    slug: 'szczecin', name: 'Szczecin', locative: 'Szczecinie', mieszkancy: 'szczecinianie',
    uczelnie: ['Zachodniopomorski Uniwersytet Technologiczny', 'Uniwersytet Szczeciński'],
    dzielnice: ['Pogodno', 'Niebuszewo', 'Pomorzany', 'Gumieńce', 'Śródmieście'],
    akcent: 'ZUT w Szczecinie kształci inżynierów dla przemysłu morskiego i energetyki — solidna fizyka otwiera drzwi na te kierunki.'
  },
  {
    slug: 'bydgoszcz', name: 'Bydgoszcz', locative: 'Bydgoszczy', mieszkancy: 'bydgoszczanie',
    uczelnie: ['Politechnika Bydgoska', 'Uniwersytet Kazimierza Wielkiego'],
    dzielnice: ['Fordon', 'Szwederowo', 'Bartodzieje', 'Wyżyny', 'Śródmieście'],
    akcent: 'Politechnika Bydgoska oraz silne licea ogólnokształcące sprawiają, że zapotrzebowanie na korepetycje z fizyki w Bydgoszczy stale rośnie.'
  },
  {
    slug: 'lublin', name: 'Lublin', locative: 'Lublinie', mieszkancy: 'lublinianie',
    uczelnie: ['Politechnika Lubelska', 'Uniwersytet Marii Curie-Skłodowskiej'],
    dzielnice: ['LSM', 'Czuby', 'Wieniawa', 'Bronowice', 'Śródmieście'],
    akcent: 'Lublin to największy ośrodek akademicki wschodniej Polski — Politechnika Lubelska i UMCS prowadzą kierunki, na których fizyka jest przedmiotem rekrutacyjnym.'
  },
  {
    slug: 'katowice', name: 'Katowice', locative: 'Katowicach', mieszkancy: 'katowiczanie',
    uczelnie: ['Politechnika Śląska (Gliwice)', 'Uniwersytet Śląski'],
    dzielnice: ['Ligota', 'Brynów', 'Koszutka', 'Bogucice', 'Śródmieście'],
    akcent: 'Aglomeracja śląska to przemysłowe serce Polski — Politechnika Śląska kształci inżynierów, dla których fizyka jest przedmiotem kluczowym.'
  },
  {
    slug: 'bialystok', name: 'Białystok', locative: 'Białymstoku', mieszkancy: 'białostoczanie',
    uczelnie: ['Politechnika Białostocka', 'Uniwersytet w Białymstoku'],
    dzielnice: ['Antoniuk', 'Białostoczek', 'Piasta', 'Centrum', 'Wygoda'],
    akcent: 'Politechnika Białostocka rozwija kierunki techniczne i informatyczne — coraz więcej maturzystów z regionu stawia na fizykę rozszerzoną.'
  },
  {
    slug: 'gdynia', name: 'Gdynia', locative: 'Gdyni', mieszkancy: 'gdynianie',
    uczelnie: ['Uniwersytet Morski w Gdyni', 'Akademia Marynarki Wojennej'],
    dzielnice: ['Śródmieście', 'Witomino', 'Chylonia', 'Orłowo', 'Oksywie'],
    akcent: 'Gdynia to centrum edukacji morskiej — Uniwersytet Morski i Akademia Marynarki Wojennej wymagają solidnych podstaw z fizyki.'
  },
  {
    slug: 'czestochowa', name: 'Częstochowa', locative: 'Częstochowie', mieszkancy: 'częstochowianie',
    uczelnie: ['Politechnika Częstochowska', 'Uniwersytet Jana Długosza'],
    dzielnice: ['Tysiąclecie', 'Północ', 'Raków', 'Ostatni Grosz', 'Śródmieście'],
    akcent: 'Politechnika Częstochowska kształci inżynierów mechaników i energetyków — fizyka to tu przedmiot pierwszego wyboru wśród maturzystów technicznych.'
  },
  {
    slug: 'radom', name: 'Radom', locative: 'Radomiu', mieszkancy: 'radomianie',
    uczelnie: ['Uniwersytet Technologiczno-Humanistyczny w Radomiu'],
    dzielnice: ['Borki', 'Ustronie', 'Gołębiów', 'Michałów', 'Śródmieście'],
    akcent: 'UTH Radom oraz lokalne technika sprawiają, że uczniowie regularnie szukają wsparcia w przygotowaniu do matury z fizyki.'
  },
  {
    slug: 'torun', name: 'Toruń', locative: 'Toruniu', mieszkancy: 'torunianie',
    uczelnie: ['Uniwersytet Mikołaja Kopernika'],
    dzielnice: ['Bydgoskie Przedmieście', 'Rubinkowo', 'Chełmińskie Przedmieście', 'Stare Miasto'],
    akcent: 'Toruń — miasto Kopernika — ma silny wydział fizyki i astronomii na UMK, co przyciąga uczniów zainteresowanych naukami ścisłymi.'
  },
  {
    slug: 'rzeszow', name: 'Rzeszów', locative: 'Rzeszowie', mieszkancy: 'rzeszowianie',
    uczelnie: ['Politechnika Rzeszowska', 'Uniwersytet Rzeszowski'],
    dzielnice: ['Nowe Miasto', 'Baranówka', 'Pobitno', 'Krakowska-Południe', 'Śródmieście'],
    akcent: 'Politechnika Rzeszowska słynie z lotnictwa (jako jedyna ma własne lotnisko) — fizyka jest tu absolutną podstawą rekrutacji.'
  },
  {
    slug: 'kielce', name: 'Kielce', locative: 'Kielcach', mieszkancy: 'kielczanie',
    uczelnie: ['Politechnika Świętokrzyska', 'Uniwersytet Jana Kochanowskiego'],
    dzielnice: ['Ślichowice', 'Bocianek', 'Czarnów', 'Barwinek', 'Centrum'],
    akcent: 'Politechnika Świętokrzyska kształci inżynierów budownictwa i mechaniki — kandydaci muszą wykazać się dobrą znajomością fizyki.'
  },
  {
    slug: 'olsztyn', name: 'Olsztyn', locative: 'Olsztynie', mieszkancy: 'olsztynianie',
    uczelnie: ['Uniwersytet Warmińsko-Mazurski'],
    dzielnice: ['Jaroty', 'Nagórki', 'Kortowo', 'Pieczewo', 'Śródmieście'],
    akcent: 'UWM w Olsztynie prowadzi kierunki techniczne i przyrodnicze, na których fizyka odgrywa istotną rolę rekrutacyjną.'
  },
  {
    slug: 'gliwice', name: 'Gliwice', locative: 'Gliwicach', mieszkancy: 'gliwiczanie',
    uczelnie: ['Politechnika Śląska'],
    dzielnice: ['Sośnica', 'Trynek', 'Sikornik', 'Łabędy', 'Śródmieście'],
    akcent: 'Gliwice to siedziba Politechniki Śląskiej — jednej z najlepszych uczelni technicznych w kraju, gdzie fizyka jest przedmiotem fundamentalnym.'
  },
  {
    slug: 'zielona-gora', name: 'Zielona Góra', locative: 'Zielonej Górze', mieszkancy: 'zielonogórzanie',
    uczelnie: ['Uniwersytet Zielonogórski'],
    dzielnice: ['Jędrzychów', 'Zacisze', 'Chynów', 'Centrum', 'Os. Pomorskie'],
    akcent: 'Uniwersytet Zielonogórski rozwija kierunki techniczne i informatyczne — fizyka rozszerzona zwiększa szanse na rekrutację i stypendia.'
  }
];
