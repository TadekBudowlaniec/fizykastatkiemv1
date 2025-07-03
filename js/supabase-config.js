// Supabase Configuration
const supabaseUrl = 'https://wurtrfsdzcttmhxxqiqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cnRyZnNkemN0dG1oeHhxaXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDA2NjEsImV4cCI6MjA2NzA3NjY2MX0.yudWqtQJuajovtyKkttOzlbUqsY9_oniF2L9HbHTzPg';
const supabase = window.supabase?.createClient ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// Stripe Configuration
const stripe = Stripe('pk_live_51RVvveJLuu6b086bkMWivsLTKUamDhivaYv3ObKeMpV2kHSjCKuYE3sijENdGWISCsVBz3RI40MgYX0P1jhL2ICz00B2VbJDF3');

// App State
let currentUser = null;
let userHasAccess = false;
let userEnrollments = [];

// Subject Data
const subjects = {
    mechanika: {
        title: 'Mechanika',
        videoId: 'dQw4w9WgXcQ',
        pdfs: ['teoria', 'zadania', 'wzory'],
        quiz: [
            {
                question: 'Jakie jest podstawowe prawo mechaniki Newtona?',
                options: ['F = ma', 'E = mc²', 'P = mv'],
                correct: 0
            }
        ]
    },
    termodynamika: {
        title: 'Termodynamika',
        videoId: 'dQw4w9WgXcQ',
        pdfs: ['teoria', 'zadania', 'wzory'],
        quiz: [
            {
                question: 'Które z poniższych jest prawem termodynamiki?',
                options: ['Energia nie może być stworzona ani zniszczona', 'F = ma', 'E = mc²'],
                correct: 0
            }
        ]
    },
    elektromagnetyzm: {
        title: 'Elektromagnetyzm',
        videoId: 'dQw4w9WgXcQ',
        pdfs: ['teoria', 'zadania', 'wzory'],
        quiz: [
            {
                question: 'Prawo Ohma opisuje zależność między:',
                options: ['Napięciem, prądem i oporem', 'Masą i energią', 'Siłą i przyspieszeniem'],
                correct: 0
            }
        ]
    },
    optyka: {
        title: 'Optyka',
        videoId: 'dQw4w9WgXcQ',
        pdfs: ['teoria', 'zadania', 'wzory'],
        quiz: [
            {
                question: 'Prędkość światła w próżni wynosi:',
                options: ['300 000 km/s', '150 000 km/s', '600 000 km/s'],
                correct: 0
            }
        ]
    },
    atomowa: {
        title: 'Fizyka Atomowa',
        videoId: 'dQw4w9WgXcQ',
        pdfs: ['teoria', 'zadania', 'wzory'],
        quiz: [
            {
                question: 'Model atomu Bohra wprowadził pojęcie:',
                options: ['Orbit elektronowych', 'Fal elektromagnetycznych', 'Siły jądrowej'],
                correct: 0
            }
        ]
    },
    jadrowa: {
        title: 'Fizyka Jądrowa',
        videoId: 'dQw4w9WgXcQ',
        pdfs: ['teoria', 'zadania', 'wzory'],
        quiz: [
            {
                question: 'Rozpad alfa polega na emisji:',
                options: ['Jądra helu', 'Elektronu', 'Fotonu'],
                correct: 0
            }
        ]
    }
}; 