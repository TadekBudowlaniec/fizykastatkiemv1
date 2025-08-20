// Supabase Configuration
const supabaseUrl = 'https://kldekjrpottsqebueojg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZGVranJwb3R0c3FlYnVlb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc4NTcsImV4cCI6MjA2NzYzMzg1N30.aYCWfbhliWM3yQRyZUDL59IgMOWklwa0ZA4QOSdyLh0';
const supabase = window.supabase?.createClient ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// Stripe Configuration
const stripe = Stripe('pk_live_51RVvveJLuu6b086bkMWivsLTKUamDhivaYv3ObKeMpV2kHSjCKuYE3sijENdGWISCsVBz3RI40MgYX0P1jhL2ICz00B2VbJDF3');

// Dodaj stripe do window aby był dostępny globalnie
window.stripe = stripe;

// App State
let currentUser = null;
let userHasAccess = false;
let userEnrollments = [];

// Subject Data
const subjects = {
    1: { title: 'Kinematyka', paymentLink: 'https://buy.stripe.com/bJe14o8MJ7Nof90f1N0ZW07', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Kinematyka...' },
    2: { title: 'Dynamika', paymentLink: 'https://buy.stripe.com/aFacN66EB9Vwd0S7zl0ZW08', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Dynamika...' },
    3: { title: 'Praca moc energia', paymentLink: 'https://buy.stripe.com/6oU4gA5AxaZAf90f1N0ZW09', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Praca moc energia...' },
    4: { title: 'Bryła sztywna', paymentLink: 'https://buy.stripe.com/9B6aEYgfb8RsaSK6vh0ZW0a', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Bryła sztywna...' },
    5: { title: 'Ruch drgający', paymentLink: 'https://buy.stripe.com/5kQ28sbYV2t4d0S1aX0ZW0h', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Ruch drgający...' },
    6: { title: 'Fale mechaniczne', paymentLink: 'https://buy.stripe.com/3cI28s9QNaZA6CucTF0ZW0g', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fale mechaniczne...' },
    7: { title: 'Hydrostatyka', paymentLink: 'https://buy.stripe.com/9B6eVefb7gjUf90cTF0ZW0b', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Hydrostatyka...' },
    8: { title: 'Termodynamika', paymentLink: 'https://buy.stripe.com/14AcN6bYV4BcaSK5rd0ZW00', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Termodynamika...' },
    9: { title: 'Grawitacja i astronomia', paymentLink: 'https://buy.stripe.com/dRm7sM1kh3x87Gy3j50ZW0c', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Grawitacja i astronomia...' },
    10: { title: 'Elektrostatyka', paymentLink: 'https://buy.stripe.com/aFa14o4wtgjU3qiaLx0ZW04', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Elektrostatyka...' },
    11: { title: 'Prąd elektryczny', paymentLink: 'https://buy.stripe.com/6oUeVe2olaZA3qi5rd0ZW0d', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Prąd elektryczny...' },
    12: { title: 'Magnetyzm', paymentLink: 'https://buy.stripe.com/8x2bJ2bYV5Fg5yqdXJ0ZW0e', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Magnetyzm...' },
    13: { title: 'Indukcja elektromagnetyczna', paymentLink: 'https://buy.stripe.com/8x214o0gdebM2meg5R0ZW0f', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Indukcja elektromagnetyczna...' },
    14: { title: 'Fale elektromagnetyczne i optyka', paymentLink: 'https://buy.stripe.com/cNi5kE8MJ2t42meaLx0ZW03', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fale elektromagnetyczne i optyka...' },
    15: { title: 'Fizyka atomowa', paymentLink: 'https://buy.stripe.com/aFaeVe0gd2t4d0S8Dp0ZW02', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fizyka atomowa...' },
    16: { title: 'Fizyka jądrowa i relatywistyka', paymentLink: 'https://buy.stripe.com/5kQ5kEaUR0kW6CuaLx0ZW01', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fizyka jądrowa i relatywistyka...' }
};

// Dodaj subjects do window aby był dostępny globalnie
window.subjects = subjects;

const paymentLinkAllMaterials = 'https://buy.stripe.com/00w00k7IFaZA9OG9Ht0ZW06';
window.paymentLinkAllMaterials = paymentLinkAllMaterials; 