// navigation.js
// Routing: mapowanie sekcji na ścieżki
const sectionToPath = {
    landing: '/home',
    dashboard: '/kurs',
    subject: '/kurs',
    user: '/user',
    login: '/login',
    register: '/register',
    pricing: '/pricing',
    korepetycje: '/korepetycje'
};
const pathToSection = {
    '/home': 'landing',
    '/kurs': 'dashboard',
    '/user': 'user',
    '/login': 'login',
    '/register': 'register',
    '/pricing': 'pricing',
    '/korepetycje': 'korepetycje'
};

function showSection(sectionId, push = true) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    updateNavigation();
    if (push && sectionToPath[sectionId]) {
        window.history.pushState({ sectionId }, '', sectionToPath[sectionId]);
    }
}

window.addEventListener('popstate', (e) => {
    const path = window.location.pathname;
    const sectionId = pathToSection[path] || 'landing';
    showSection(sectionId, false);
});

function navigateTo(path) {
    const sectionId = pathToSection[path] || 'landing';
    showSection(sectionId);
}

function updateNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfileBtn = document.getElementById('userProfileBtn');
    if (currentUser) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        if (userProfileBtn) userProfileBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        if (userProfileBtn) userProfileBtn.classList.add('hidden');
    }
}

function showSubject(subjectKey) {
    if (!userHasAccess) {
        alert('Musisz kupić dostęp do platformy, aby oglądać kursy!');
        showSection('pricing');
        return;
    }
    const subject = subjects[subjectKey];
    if (!subject) return;
    document.getElementById('subjectTitle').textContent = subject.title;
    document.getElementById('subjectVideo').src = `https://www.youtube.com/embed/${subject.videoId}`;
    const quizContainer = document.getElementById('quizContainer');
    const question = subject.quiz[0];
    quizContainer.innerHTML = `
        <div class="quiz-question">
            <h4>Pytanie 1: ${question.question}</h4>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <label class="quiz-option">
                        <input type="radio" name="q1" value="${index}"> ${option}
                    </label>
                `).join('')}
            </div>
        </div>
        <button class="btn btn-gradient" onclick="checkQuiz('${subjectKey}')">Sprawdź odpowiedzi</button>
    `;
    showSection('subject');
}

function renderDashboard() {
    const grid = document.querySelector('#dashboard .subjects-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(subjects).forEach(([key, subject]) => {
        const card = document.createElement('div');
        card.className = 'subject-card fancy-card';
        card.innerHTML = `
            <div class="subject-icon">${getSubjectIcon(key)}</div>
            <h3>${subject.title}</h3>
            <div class="subject-progress"><div class="progress-bar" style="width: 0%"></div></div>
            <p>${subjectDesc(key)}</p>
            <button class="btn btn-gradient" id="btn-${key}"></button>
        `;
        grid.appendChild(card);
        const btn = card.querySelector(`#btn-${key}`);
        if (hasAccessToCourse(key)) {
            btn.textContent = 'Otwórz dział';
            btn.onclick = () => showSubject(key);
        } else {
            btn.textContent = 'Kup';
            btn.onclick = () => buyAccess(key);
        }
    });
}

function getSubjectIcon(key) {
    const icons = {
        mechanika: '⚓️',
        termodynamika: '🔥',
        elektromagnetyzm: '⚡️',
        optyka: '🌈',
        atomowa: '🧬',
        jadrowa: '☢️'
    };
    return icons[key] || '📚';
}

function subjectDesc(key) {
    const descs = {
        mechanika: 'Poznaj podstawy ruchu, siły i energii',
        termodynamika: 'Ciepło, temperatura i prawa termodynamiki',
        elektromagnetyzm: 'Prąd elektryczny, pole magnetyczne i fale',
        optyka: 'Światło, zwierciadła i soczewki',
        atomowa: 'Budowa atomu i zjawiska kwantowe',
        jadrowa: 'Jądro atomowe i radioaktywność'
    };
    return descs[key] || '';
} 