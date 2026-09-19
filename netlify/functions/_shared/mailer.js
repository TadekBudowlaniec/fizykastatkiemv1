// netlify/functions/_shared/mailer.js
// Silnik mailingu na Resend (zastępuje Brevo). CommonJS, używany przez
// subscribe.js (Dzień 1 od razu) i send-sequence.js (Dni 2-5 z crona).
//
// Założenia deliverability (cel: skrzynka „Główne", nie „Oferty"):
//  - wysyłka 1:1 przez Resend, bez plakietki, bez pixela śledzącego,
//  - prosty HTML: czarny tekst na białym, jeden link, brak obrazków,
//  - wersja tekstowa (text/plain) obok HTML,
//  - nagłówek List-Unsubscribe + widoczny link „wypisz się" (RODO + Gmail).

const crypto = require('crypto');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// „Nazwa <adres>" — nazwa jak od człowieka pomaga trafić do Primary.
const EMAIL_FROM = process.env.EMAIL_FROM || 'Czarek z FizykaStatkiem <hej@fizykastatkiem.pl>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hej@fizykastatkiem.pl';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://fizykastatkiem.pl').replace(/\/$/, '');
const UNSUB_SECRET = process.env.UNSUB_SECRET || '';

// ── Treść sekwencji (źródło prawdy: docs/mailing/sekwencja-powitalna.md) ──────
// paragraphs → akapity; cta → jedyny link; outro → zakończenie + podpis.
const SEQUENCE = [
    {
        day: 1,
        subject: 'Twój planer nauki: od czego zacząć',
        preheader: 'Otwórz i zobacz, co robić w tym tygodniu.',
        paragraphs: [
            'Cześć,',
            'masz to. Twój darmowy planer nauki do matury z fizyki czeka w środku: spersonalizowany plan dzień po dniu, aż do egzaminu.',
            'Zanim zaczniesz, jedna rada, która robi całą różnicę: nie ucz się „wszystkiego naraz". Ucz się tego, co planer pokazuje na dziś.',
            'Jak z niego skorzystać w 3 krokach:',
            '1. Wejdź do planera i zaznacz działy, które już ogarniasz. Resztą zajmiemy się my.',
            '2. Zobacz sekcję „Dziś w planie". To Twoje zadanie na dzisiaj. Tyle. Nic więcej.',
            '3. Odhaczaj kroki. Pasek postępu robi swoje. Zobaczysz, jak matura zamienia się z „ogromu" w listę małych, wykonalnych kroków.',
        ],
        cta: { label: 'Otwórz swój planer', url: `${FRONTEND_URL}/planer` },
        outro: [
            'Jutro napiszę Ci, dlaczego fizyka wydaje się trudniejsza, niż jest naprawdę (i co z tym zrobić).',
            'Do jutra,\nCzarek z FizykaStatkiem',
        ],
    },
    {
        day: 2,
        subject: 'Fizyka nie jest trudna. Jest źle tłumaczona.',
        preheader: 'Prawdziwy powód, dla którego „nie rozumiesz", i jak to odwrócić.',
        paragraphs: [
            'Cześć,',
            'powiem Ci coś, czego nie usłyszysz w szkole: jeśli „nie rozumiesz fizyki", to prawie nigdy nie jest kwestia zdolności. To kwestia tego, że ktoś pokazał Ci wzór, zanim pokazał Ci, o co w ogóle chodzi.',
            'Fizyka to nie zbiór 200 wzorów do wykucia. To garść prostych zasad, które powtarzają się w każdym dziale. Kto raz je zobaczy „od środka", przestaje się uczyć na pamięć. Zaczyna rozumieć.',
            'Przykład? Ten sam sposób myślenia o sile z Dynamiki wraca przy ruchu drgającym, w polu grawitacyjnym i w prądzie. Jedna intuicja, cztery działy z głowy.',
            'Dlatego mój kurs nie zaczyna się od wzorów. Zaczyna się od „dlaczego". A wzory? Same wtedy wchodzą do głowy.',
        ],
        cta: { label: 'Zobacz, jak wygląda nauka „od zrozumienia" (moduł „Tutaj zacznij", za darmo)', url: `${FRONTEND_URL}/kurs/0` },
        outro: [
            'Jutro pokażę Ci historię kogoś, kto był dokładnie tam, gdzie Ty teraz.',
            'Czarek',
        ],
    },
    {
        day: 3,
        subject: '„Byłam pewna, że oblewę". Skończyło się inaczej.',
        preheader: 'Historia Nadii, i co konkretnie zrobiła.',
        paragraphs: [
            'Cześć,',
            'Nadia napisała do mnie w styczniu. Trzy miesiące do matury, w głowie chaos, w dzienniku oceny, na które „lepiej nie patrzeć".',
            'Nie była leniwa. Odwrotnie, uczyła się dużo. Tylko bez planu: raz kinematyka, raz elektryczność, wszystko po łebkach, nic do końca.',
            'Co zmieniła? Dwie rzeczy:',
            'Przestała skakać po działach. Zaczęła robić jeden temat na raz, dokładnie tak, jak układa to planer.',
            'Zaczęła od zrozumienia, nie od zadań. Najpierw „dlaczego", potem liczby.',
            'Efekt? Z „na pewno oblewę" zrobiło się spokojne wejście na maturę i wynik, którego sama się nie spodziewała. Nie dlatego, że nagle stała się geniuszem. Dlatego, że zaczęła uczyć się systemem, a nie zrywami.',
            'Filip? Podobna historia, inny start. Ta sama zasada: plan plus rozumienie biją godziny wkuwania.',
            'Ty masz już plan. Jest w Twoim planerze. Brakuje tylko materiału, który tłumaczy „dlaczego". O tym jutro. Dam Ci kawałek za darmo.',
        ],
        cta: { label: 'Wróć do planera i zrób dzisiejszy krok', url: `${FRONTEND_URL}/planer` },
        outro: ['Czarek'],
    },
    {
        day: 4,
        subject: 'Cała kinematyka w jednej zasadzie',
        preheader: 'Zrozum to raz, a zadania z ruchu przestaną być problemem.',
        paragraphs: [
            'Cześć,',
            'obiecana pigułka. Bez sprzedaży. Po prostu weź i korzystaj.',
            'Kinematyka w jednym zdaniu: wszystkie zadania z ruchu to odpowiedź na trzy pytania: gdzie jest ciało, jak szybko się porusza i jak ta prędkość się zmienia. Położenie, prędkość, przyspieszenie. Tyle. Reszta to warianty tej samej historii.',
            'Mała zmiana myślenia, która oszczędza mnóstwo błędów: zanim wstawisz cokolwiek do wzoru, narysuj sytuację i zaznacz zwroty (co jest „plus", co „minus"). 80% pomyłek w kinematyce to nie wzór, to znak.',
            'To fragment tego, jak uczę w środku kursu: najpierw obraz i intuicja, potem dopiero rachunki.',
        ],
        cta: { label: 'Zobacz darmowy moduł „Tutaj zacznij"', url: `${FRONTEND_URL}/kurs/0` },
        outro: [
            'Jutro ostatni mail z tej serii. Pokażę Ci, jak przejść z „rozumiem pojedyncze tematy" do „mam ogarnięty cały materiał na maturę".',
            'Czarek',
        ],
    },
    {
        day: 5,
        subject: 'Masz plan. Czas na resztę mapy.',
        preheader: 'Kurs Pełny plus Gwarancja Dobrego Wyniku, dlaczego to bez ryzyka.',
        paragraphs: [
            'Cześć,',
            'przez ostatnie dni dostałeś ode mnie plan i kawałek metody. To działa, ale to wciąż fragment.',
            'Kurs Pełny to cały materiał maturalny z fizyki poukładany tak, jak układa go Twój planer: dział po dziale, od „dlaczego" do zadań maturalnych, z rozwiązaniami krok po kroku.',
            'Co dostajesz:',
            'Wszystkie działy, od kinematyki po fizykę jądrową, w jednej spójnej metodzie.',
            'Wideo, materiały PDF i zadania z pełnymi rozwiązaniami.',
            'Planer, który prowadzi Cię przez to wszystko aż do matury.',
            'Cena: 828 zł za komplet, mniej niż kilka godzin korepetycji, a zostaje z Tobą do samego egzaminu.',
            'A teraz najważniejsze. Gwarancja Dobrego Wyniku. Uczysz się według planu, a jeśli mimo to kurs Ci nie pomoże, masz jasne zasady zwrotu. Ryzyko jest po mojej stronie, nie Twojej. Twoim jedynym zadaniem jest robić dzienny krok z planera.',
        ],
        cta: { label: 'Odbierz Kurs Pełny', url: `${FRONTEND_URL}/cennik` },
        outro: [
            'Masz plan. Masz metodę. Zostało tylko zacząć.',
            'Trzymam kciuki za Twoją maturę,\nCzarek z FizykaStatkiem',
            'PS Jeśli wolisz najpierw pojedynczy dział, żeby sprawdzić, jak uczę, też możesz. Ale komplet plus gwarancja to najspokojniejsza droga do wyniku, na którym Ci zależy.',
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

function ctaWithUtm(url, day) {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'resend');
    u.searchParams.set('utm_medium', 'email');
    u.searchParams.set('utm_campaign', 'welcome');
    u.searchParams.set('utm_content', `dzien${day}`);
    return u.toString();
}

// Prosty, „ludzki" HTML: systemowy font, czarny tekst, jeden link. Bez tabel,
// bez obrazków, bez kolorowych przycisków — to zwiększa szansę na Primary.
function buildHtml(email, unsub) {
    const ctaUrl = ctaWithUtm(email.cta.url, email.day);
    const paras = email.paragraphs
        .map((p) => `<p style="margin:0 0 16px">${esc(p)}</p>`)
        .join('\n');
    const outro = (email.outro || [])
        .map((p) => `<p style="margin:0 0 16px">${esc(p).replace(/\n/g, '<br>')}</p>`)
        .join('\n');
    const cta = `<p style="margin:0 0 16px"><a href="${esc(ctaUrl)}" style="color:#1a56db">${esc(email.cta.label)}</a></p>`;

    return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;background:#ffffff}</style></head>
<body>
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(email.preheader)}</span>
<div style="max-width:560px;margin:0 auto;padding:24px 20px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a">
${paras}
${cta}
${outro}
<p style="margin:24px 0 0;font-size:12px;color:#8a8a8a">Dostajesz tego maila, bo zapisałeś się po planer nauki na fizykastatkiem.pl.<br>
Nie chcesz więcej? <a href="${esc(unsub)}" style="color:#8a8a8a">Wypisz się</a>.</p>
</div>
</body></html>`;
}

function buildText(email, unsub) {
    const ctaUrl = ctaWithUtm(email.cta.url, email.day);
    const parts = [
        ...email.paragraphs,
        `${email.cta.label}: ${ctaUrl}`,
        ...(email.outro || []),
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
