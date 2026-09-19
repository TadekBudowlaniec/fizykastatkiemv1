// netlify/functions/_shared/mailer.js
// Silnik mailingu na Resend (zastępuje Brevo). CommonJS, używany przez
// subscribe.js (Dzień 1 od razu) i send-sequence.js (Dni 2-5 z crona).
//
// Założenia deliverability (cel: skrzynka „Główne", nie „Oferty"):
//  - wysyłka 1:1 przez Resend, bez plakietki, bez pixela śledzącego,
//  - lekki HTML: czarny tekst, jeden CTA, brak obrazków,
//  - wersja tekstowa (text/plain) obok HTML,
//  - nagłówek List-Unsubscribe + widoczny link „wypisz się" (RODO + Gmail).
//
// Formatowanie treści: w paragrafach można używać **pogrubienia**. Cudzysłowy
// polskie „ ". Świadomie NIE używamy długich myślników.

const crypto = require('crypto');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// „Nazwa <adres>" — nazwa jak od człowieka pomaga trafić do Primary.
const EMAIL_FROM = process.env.EMAIL_FROM || 'Czarek z FizykaStatkiem <hej@fizykastatkiem.pl>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hej@fizykastatkiem.pl';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://fizykastatkiem.pl').replace(/\/$/, '');
const UNSUB_SECRET = process.env.UNSUB_SECRET || '';

// ── Treść sekwencji (źródło prawdy) ──────────────────────────────────────────
// paragraphs → akapity; cta → jedyny link (przycisk); outro → zakończenie + podpis.
const SEQUENCE = [
    {
        day: 1,
        subject: 'Twój planer nauki jest gotowy',
        preheader: 'Zajrzyj do środka i zobacz, od czego zacząć w tym tygodniu.',
        paragraphs: [
            'Cześć!',
            'Masz to. Twój **darmowy planer nauki do matury z fizyki** czeka w środku: spersonalizowany plan dzień po dniu, aż do egzaminu.',
            'Zanim zaczniesz, jedna rada, która robi całą różnicę. **Nie ucz się wszystkiego naraz.** Ucz się tego, co planer pokazuje na dany dzień.',
            'Jak z niego korzystać w trzech krokach:',
            '1. Wejdź do planera i **zaznacz działy, które już ogarniasz**. Resztą zajmiemy się my.',
            '2. Otwórz sekcję **„Dziś w planie”**. To Twoje jedyne zadanie na dzisiaj. Tyle, nic więcej.',
            '3. Odhaczaj kolejne kroki. Pasek postępu zrobi swoje, a matura z „ogromu” zamieni się w listę małych, wykonalnych rzeczy.',
        ],
        cta: { label: 'Otwórz swój planer', url: `${FRONTEND_URL}/planer` },
        outro: [
            'Jutro napiszę Ci, dlaczego fizyka wydaje się trudniejsza, niż jest w rzeczywistości (i co z tym zrobić).',
            'Do jutra,\n**Czarek**\nFizykaStatkiem',
        ],
    },
    {
        day: 2,
        subject: 'Fizyka nie jest trudna. Jest źle tłumaczona.',
        preheader: 'Prawdziwy powód, dla którego „nie rozumiesz”, i jak to odwrócić.',
        paragraphs: [
            'Cześć!',
            'Powiem Ci coś, czego nie usłyszysz w szkole. Jeśli „nie rozumiesz fizyki”, to **prawie nigdy nie jest kwestia zdolności**. To kwestia tego, że ktoś pokazał Ci wzór, zanim wyjaśnił, o co w ogóle chodzi.',
            'Fizyka to nie jest zbiór dwustu wzorów do wykucia. To garść prostych zasad, które **powtarzają się w każdym dziale**. Kto raz zobaczy je „od środka”, przestaje uczyć się na pamięć i zaczyna rozumieć.',
            'Przykład? Ten sam sposób myślenia o sile z dynamiki wraca w ruchu drgającym, w polu grawitacyjnym i w prądzie. **Jedna intuicja, a cztery działy z głowy.**',
            'Dlatego mój kurs nie zaczyna się od wzorów, tylko od **„dlaczego”**. A wzory? Wtedy same wchodzą do głowy.',
        ],
        cta: { label: 'Zobacz moduł „Tutaj zacznij” (za darmo)', url: `${FRONTEND_URL}/kurs/0` },
        outro: [
            'Jutro pokażę Ci historię kogoś, kto był dokładnie tam, gdzie Ty jesteś teraz.',
            '**Czarek**\nFizykaStatkiem',
        ],
    },
    {
        day: 3,
        subject: '„Byłam pewna, że oblewę”. Skończyło się inaczej.',
        preheader: 'Historia Nadii i to, co konkretnie zmieniła.',
        paragraphs: [
            'Cześć!',
            'Nadia napisała do mnie w styczniu. Trzy miesiące do matury, w głowie chaos, a w dzienniku oceny, na które „lepiej nie patrzeć”.',
            'Nie była leniwa, wręcz przeciwnie: uczyła się dużo. Tylko **bez planu**. Raz kinematyka, raz elektryczność, wszystko po łebkach, nic do końca.',
            'Zmieniła dwie rzeczy.',
            'Po pierwsze, **przestała skakać po działach**. Zaczęła brać jeden temat na raz, dokładnie tak, jak układa to planer.',
            'Po drugie, **zaczęła od zrozumienia, a nie od zadań**. Najpierw „dlaczego”, potem liczby.',
            'Efekt? Z „na pewno oblewę” zrobiło się spokojne wejście na maturę i wynik, którego sama się nie spodziewała. Nie dlatego, że nagle stała się geniuszem, tylko dlatego, że zaczęła uczyć się **systemem, a nie zrywami**.',
            'Filip miał inny start, ale tę samą zasadę: **plan i zrozumienie znaczą więcej niż godziny wkuwania**.',
            'Ty masz już plan, jest w Twoim planerze. Brakuje tylko materiału, który tłumaczy „dlaczego”. O tym jutro, dorzucę Ci wtedy kawałek za darmo.',
        ],
        cta: { label: 'Wróć do planera i zrób dzisiejszy krok', url: `${FRONTEND_URL}/planer` },
        outro: ['**Czarek**\nFizykaStatkiem'],
    },
    {
        day: 4,
        subject: 'Cała kinematyka w jednej zasadzie',
        preheader: 'Zrozum to raz, a zadania z ruchu przestaną być problemem.',
        paragraphs: [
            'Cześć!',
            'Obiecana pigułka. Bez sprzedaży, po prostu weź i korzystaj.',
            'Kinematyka w jednym zdaniu: każde zadanie z ruchu to odpowiedź na trzy pytania. Gdzie jest ciało, jak szybko się porusza i jak ta prędkość się zmienia. Położenie, prędkość, przyspieszenie. Tyle. Reszta to warianty tej samej historii.',
            'Mała zmiana myślenia, która oszczędza mnóstwo błędów: zanim cokolwiek wstawisz do wzoru, **narysuj sytuację i zaznacz zwroty** (co jest dodatnie, a co ujemne). Osiemdziesiąt procent pomyłek w kinematyce to nie wzór, tylko znak.',
            'Tak właśnie uczę w kursie: **najpierw obraz i intuicja, dopiero potem rachunki**.',
        ],
        cta: { label: 'Zobacz darmowy moduł „Tutaj zacznij”', url: `${FRONTEND_URL}/kurs/0` },
        outro: [
            'Jutro ostatni mail z tej serii. Pokażę Ci, jak przejść od „rozumiem pojedyncze tematy” do „mam ogarnięty cały materiał na maturę”.',
            '**Czarek**\nFizykaStatkiem',
        ],
    },
    {
        day: 5,
        subject: 'Masz plan. Czas na resztę mapy.',
        preheader: 'Kurs Pełny z Gwarancją Dobrego Wyniku, czyli nauka bez ryzyka.',
        paragraphs: [
            'Cześć!',
            'Przez ostatnie dni dostałeś ode mnie plan i kawałek metody. To działa, ale to wciąż fragment.',
            '**Kurs Pełny** to cały materiał maturalny z fizyki, poukładany tak, jak układa go Twój planer: dział po dziale, od „dlaczego” aż po zadania maturalne z rozwiązaniami krok po kroku.',
            'Co dostajesz:',
            '• Wszystkie działy, od kinematyki po fizykę jądrową, w jednej spójnej metodzie.',
            '• Wideo, materiały PDF i zadania z pełnymi rozwiązaniami.',
            '• Planer, który prowadzi Cię przez to wszystko aż do matury.',
            'Cena: **828 zł** za komplet. To mniej niż kilka godzin korepetycji, a zostaje z Tobą do samego egzaminu.',
            'Najważniejsze: **Gwarancja Dobrego Wyniku**. Uczysz się według planu, a jeśli kurs Ci nie pomoże, masz jasne zasady zwrotu. Ryzyko jest po mojej stronie, nie Twojej. Twoje jedyne zadanie to robić dzienny krok z planera.',
        ],
        cta: { label: 'Odbierz Kurs Pełny', url: `${FRONTEND_URL}/cennik` },
        outro: [
            'Masz plan. Masz metodę. Zostało tylko zacząć.',
            'Trzymam kciuki za Twoją maturę,\n**Czarek**\nFizykaStatkiem',
            'PS Jeśli wolisz zacząć od pojedynczego działu, żeby sprawdzić, jak uczę, też możesz. Ale komplet z gwarancją to najspokojniejsza droga do wyniku, na którym Ci zależy.',
        ],
    },
];

const TOTAL_DAYS = SEQUENCE.length;

function getEmailForDay(day) {
    return SEQUENCE.find((e) => e.day === day) || null;
}

// ── Wypis (unsubscribe) ──────────────────────────────────────────────────────
// Token = base64url(email).hmacSHA256(email, UNSUB_SECRET). Bez sekretu nie da
// się podrobić linku wypisującego cudzy adres.
function unsubToken(email) {
    const e = String(email).trim().toLowerCase();
    const b = Buffer.from(e).toString('base64url');
    const sig = crypto.createHmac('sha256', UNSUB_SECRET).update(e).digest('base64url');
    return `${b}.${sig}`;
}

function verifyUnsubToken(token) {
    if (!token || typeof token !== 'string' || !token.includes('.')) return null;
    const [b, sig] = token.split('.');
    let email;
    try {
        email = Buffer.from(b, 'base64url').toString('utf8').trim().toLowerCase();
    } catch {
        return null;
    }
    const expected = crypto.createHmac('sha256', UNSUB_SECRET).update(email).digest('base64url');
    // porównanie w stałym czasie
    const a = Buffer.from(sig || '');
    const c = Buffer.from(expected);
    if (a.length !== c.length || !crypto.timingSafeEqual(a, c)) return null;
    return email;
}

function unsubUrl(email) {
    return `${FRONTEND_URL}/.netlify/functions/unsubscribe?t=${encodeURIComponent(unsubToken(email))}`;
}

// ── Render ───────────────────────────────────────────────────────────────────
function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Escape + zamiana **pogrubienia** na <strong> (esc nie rusza gwiazdek).
function inlineHtml(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function inlineText(s) {
    return String(s).replace(/\*\*(.+?)\*\*/g, '$1');
}

function ctaWithUtm(url, day) {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'resend');
    u.searchParams.set('utm_medium', 'email');
    u.searchParams.set('utm_campaign', 'welcome');
    u.searchParams.set('utm_content', `dzien${day}`);
    return u.toString();
}

// Lekki, „ludzki" HTML: systemowy font, czarny tekst, jeden przycisk CTA.
function buildHtml(email, unsub) {
    const ctaUrl = ctaWithUtm(email.cta.url, email.day);
    const paras = email.paragraphs
        .map((p) => `<p style="margin:0 0 16px">${inlineHtml(p)}</p>`)
        .join('\n');
    const outro = (email.outro || [])
        .map((p) => `<p style="margin:0 0 16px">${inlineHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('\n');
    const cta =
        `<p style="margin:26px 0">` +
        `<a href="${esc(ctaUrl)}" style="display:inline-block;background:#6b4df6;color:#ffffff;` +
        `text-decoration:none;font-weight:700;font-size:16px;padding:13px 24px;border-radius:9999px">` +
        `${esc(email.cta.label)} &rarr;</a></p>`;

    return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;background:#ffffff}</style></head>
<body>
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(email.preheader)}</span>
<div style="max-width:560px;margin:0 auto;padding:28px 22px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#1a1a1a">
${paras}
${cta}
${outro}
<hr style="border:none;border-top:1px solid #ececf1;margin:28px 0 14px">
<p style="margin:0;font-size:12px;line-height:1.5;color:#9a9aa5">Dostajesz tego maila, bo zapisałeś się po planer nauki na fizykastatkiem.pl.<br>
Nie chcesz więcej wiadomości? <a href="${esc(unsub)}" style="color:#9a9aa5">Wypisz się</a>.</p>
</div>
</body></html>`;
}

function buildText(email, unsub) {
    const ctaUrl = ctaWithUtm(email.cta.url, email.day);
    const parts = [
        ...email.paragraphs.map(inlineText),
        `${email.cta.label}: ${ctaUrl}`,
        ...(email.outro || []).map(inlineText),
        '',
        '---',
        'Dostajesz tego maila, bo zapisałeś się po planer nauki na fizykastatkiem.pl.',
        `Wypisz się: ${unsub}`,
    ];
    return parts.join('\n\n');
}

// ── Wysyłka przez Resend ─────────────────────────────────────────────────────
// Zwraca { ok, id?, status?, error? }. Nie rzuca — błąd tylko zwracany.
async function sendSequenceEmail(recipientEmail, day) {
    if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY missing' };
    const email = getEmailForDay(day);
    if (!email) return { ok: false, error: `no email for day ${day}` };

    const unsub = unsubUrl(recipientEmail);
    const body = {
        from: EMAIL_FROM,
        to: [recipientEmail],
        reply_to: REPLY_TO,
        subject: email.subject,
        html: buildHtml(email, unsub),
        text: buildText(email, unsub),
        headers: {
            'List-Unsubscribe': `<${unsub}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
    };

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) return { ok: true, id: data.id };
        return { ok: false, status: res.status, error: data && data.message ? data.message : `HTTP ${res.status}` };
    } catch (e) {
        return { ok: false, error: String(e && e.message ? e.message : e) };
    }
}

module.exports = {
    SEQUENCE,
    TOTAL_DAYS,
    getEmailForDay,
    sendSequenceEmail,
    unsubToken,
    verifyUnsubToken,
    unsubUrl,
};
