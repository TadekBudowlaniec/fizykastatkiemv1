// Supabase Configuration
const supabaseUrl = 'https://kldekjrpottsqebueojg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZGVranJwb3R0c3FlYnVlb2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc4NTcsImV4cCI6MjA2NzYzMzg1N30.aYCWfbhliWM3yQRyZUDL59IgMOWklwa0ZA4QOSdyLh0';
const supabase = window.supabase?.createClient ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// Stripe Configuration
const stripe = Stripe('pk_live_51RVvveJLuu6b086bkMWivsLTKUamDhivaYv3ObKeMpV2kHSjCKuYE3sijENdGWISCsVBz3RI40MgYX0P1jhL2ICz00B2VbJDF3');

// App State
let currentUser = null;
let userHasAccess = false;
let userEnrollments = [];

// Subject Data
const subjects = {
    1: { title: 'Kinematyka', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Kinematyka...' },
    2: { title: 'Dynamika', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Dynamika...' },
    3: { title: 'Praca moc energia', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Praca moc energia...' },
    4: { title: 'Bryła sztywna', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Bryła sztywna...' },
    5: { title: 'Ruch drgający', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Ruch drgający...' },
    6: { title: 'Fale mechaniczne', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fale mechaniczne...' },
    7: { title: 'Hydrostatyka', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Hydrostatyka...' },
    8: { title: 'Termodynamika', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Termodynamika...' },
    9: { title: 'Grawitacja i astronomia', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Grawitacja i astronomia...' },
    10: { title: 'Elektrostatyka', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Elektrostatyka...' },
    11: { title: 'Prąd elektryczny', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Prąd elektryczny...' },
    12: { title: 'Magnetyzm', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Magnetyzm...' },
    13: { title: 'Indukcja elektromagnetyczna', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Indukcja elektromagnetyczna...' },
    14: { title: 'Fale elektromagnetyczne i optyka', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fale elektromagnetyczne i optyka...' },
    15: { title: 'Fizyka atomowa', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fizyka atomowa...' },
    16: { title: 'Fizyka jądrowa i relatywistyka', videoId: '', pdfs: [], quiz: [], instructions: 'Instrukcje do kursu Fizyka jądrowa i relatywistyka...' }
}; 