// Supabase Configuration
const supabaseUrl = 'https://kldekjrpottsqebueojg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZGVranJwb3R0c3FlYnVlb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc4NTcsImV4cCI6MjA2NzYzMzg1N30.aYCWfbhliWM3yQRyZUDL59IgMOWklwa0ZA4QOSdyLh0';
const supabase = window.supabase?.createClient ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// Stripe Configuration (zawsze live)
const STRIPE_PUBLISHABLE_KEY_LIVE = 'pk_live_51RVvveJLuu6b086bkMWivsLTKUamDhivaYv3ObKeMpV2kHSjCKuYE3sijENdGWISCsVBz3RI40MgYX0P1jhL2ICz00B2VbJDF3';
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY_LIVE);

// Dodaj stripe do window aby był dostępny globalnie
window.stripe = stripe;

// App State
let currentUser = null;
let userHasAccess = false;
let userEnrollments = [];

// Helper: pobierz token JWT aktualnego użytkownika
async function getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}
window.getAuthToken = getAuthToken;

// Helper: pobierz bezpieczny URL do PDF-a z backendu
async function getSecurePdfUrl(courseId, etap) {
    const token = await getAuthToken();
    if (!token) {
        alert('Musisz być zalogowany, aby pobrać PDF.');
        return null;
    }

    const res = await fetch('/.netlify/functions/get-pdf-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, etap })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Błąd pobierania PDF.');
        return null;
    }

    const { url } = await res.json();
    return url;
}
window.getSecurePdfUrl = getSecurePdfUrl;

// Subject Data — bez zahardkodowanych URL-ów do PDF-ów
const subjects = {
    0: { title: 'Tutaj zacznij', paymentLink: '', videoId: '', pdfs: [], quiz: [], instructions: 'Wprowadzenie do kursu...' },
    1: { title: 'Kinematyka', paymentLink: 'https://buy.stripe.com/bJe14o8MJ7Nof90f1N0ZW07', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Kinematyka...' },
    2: { title: 'Dynamika', paymentLink: 'https://buy.stripe.com/aFacN66EB9Vwd0S7zl0ZW08', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Dynamika...' },
    3: { title: 'Praca moc energia', paymentLink: 'https://buy.stripe.com/6oU4gA5AxaZAf90f1N0ZW09', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Praca moc energia...' },
    4: { title: 'Bryła sztywna', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0a', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Bryła sztywna...' },
    5: { title: 'Ruch drgający', paymentLink: 'https://buy.stripe.com/5kQ28sbYV2t4d0S1aX0ZW0h', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Ruch drgający...' },
    9: { title: 'Grawitacja i astronomia', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0b', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Grawitacja i astronomia...' },
    7: { title: 'Hydrostatyka', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0c', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Hydrostatyka...' },
    8: { title: 'Termodynamika', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0d', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Termodynamika...' },
    10: { title: 'Elektrostatyka', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0e', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Elektrostatyka...' },
    11: { title: 'Prąd elektryczny', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0f', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Prąd elektryczny...' },
    12: { title: 'Magnetyzm', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0g', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Magnetyzm...' },
    13: { title: 'Indukcja', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0h', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Indukcja...' },
    6: { title: 'Fale mechaniczne', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0i', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fale mechaniczne...' },
    14: { title: 'Fale elektromagnetyczne', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0j', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fale elektromagnetyczne...' },
    15: { title: 'Fizyka atomowa', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0k', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fizyka atomowa...' },
    16: { title: 'Fizyka jądrowa i relatywistyka', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0l', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fizyka jądrowa i relatywistyka...' }
};

// Dodaj subjects do window aby był dostępny globalnie
window.subjects = subjects;

const paymentLinkAllMaterials = 'https://buy.stripe.com/00w00k7IFaZA9OG9Ht0ZW06';
window.paymentLinkAllMaterials = paymentLinkAllMaterials;
