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
    korepetycje: '/korepetycje',
    regulamin: '/regulamin',
    polityka: '/polityka-prywatnosci'
};
const pathToSection = {
    '/home': 'landing',
    '/kurs': 'dashboard',
    '/user': 'user',
    '/login': 'login',
    '/register': 'register',
    '/pricing': 'pricing',
    '/korepetycje': 'korepetycje',
    '/regulamin': 'regulamin',
    '/polityka-prywatnosci': 'polityka'
};

// Używam window.subjects zamiast lokalnej zmiennej

function showSection(sectionId, push = true) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    updateNavigation();
    updateBreadcrumbs(sectionId); // Aktualizuj breadcrumbs
    if (push && sectionToPath[sectionId]) {
        window.history.pushState({ sectionId }, '', sectionToPath[sectionId]);
    }
}

// Dodaj showSection do window aby był dostępny globalnie
window.showSection = showSection;

window.addEventListener('popstate', (e) => {
    const path = window.location.pathname;
    const sectionId = pathToSection[path] || 'landing';
    showSection(sectionId, false);
});

function navigateTo(path) {
    const sectionId = pathToSection[path] || 'landing';
    showSection(sectionId);
}

// Funkcja do aktualizacji breadcrumbs
function updateBreadcrumbs(sectionId) {
    const mainBreadcrumbs = document.getElementById('breadcrumbs');
    const dashboardBreadcrumbs = document.querySelector('.dashboard-breadcrumbs');
    
    if (mainBreadcrumbs) {
        // Aktualizuj główne breadcrumbs w header
        let breadcrumbText = 'Strona główna';
        let breadcrumbClass = 'active';
        
        switch (sectionId) {
            case 'dashboard':
                breadcrumbText = 'Kurs';
                breadcrumbClass = 'active';
                break;
            case 'subject':
                breadcrumbText = 'Kurs';
                breadcrumbClass = 'active';
                break;
            case 'login':
                breadcrumbText = 'Zaloguj się';
                breadcrumbClass = 'active';
                break;
            case 'register':
                breadcrumbText = 'Zarejestruj się';
                breadcrumbClass = 'active';
                break;
            case 'pricing':
                breadcrumbText = 'Cennik';
                breadcrumbClass = 'active';
                break;
            case 'korepetycje':
                breadcrumbText = 'Korepetycje';
                breadcrumbClass = 'active';
                break;
            case 'user':
                breadcrumbText = 'Profil użytkownika';
                breadcrumbClass = 'active';
                break;
            default:
                breadcrumbText = 'Strona główna';
                breadcrumbClass = 'active';
        }
        
        mainBreadcrumbs.innerHTML = `<span class="breadcrumb-item ${breadcrumbClass}">${breadcrumbText}</span>`;
    }
    
    if (dashboardBreadcrumbs) {
        // Aktualizuj breadcrumbs w dashboard
        const currentSubjectElement = document.getElementById('currentSubject');
        if (currentSubjectElement) {
            // Jeśli jesteśmy w dashboard, pokaż breadcrumbs
            if (sectionId === 'dashboard' || sectionId === 'subject') {
                dashboardBreadcrumbs.style.display = 'flex';
            } else {
                dashboardBreadcrumbs.style.display = 'none';
            }
        }
    }
}

// Funkcja do aktualizacji breadcrumbs w dashboard po wybraniu kursu
function updateDashboardBreadcrumbs(subjectTitle) {
    const currentSubjectElement = document.getElementById('currentSubject');
    if (currentSubjectElement) {
        currentSubjectElement.textContent = subjectTitle;
    }
}

function updateNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfileBtn = document.getElementById('userProfileBtn');
    // Desktop
    if (currentUser) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (userProfileBtn) userProfileBtn.classList.remove('hidden');
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (userProfileBtn) userProfileBtn.classList.add('hidden');
    }
}

function showSubject(subjectKey) {
    const subject = window.subjects[subjectKey];
    if (!subject) return;
    const course_id = parseInt(subjectKey);
    if (!hasAccessToCourse(subjectKey)) {
        alert('Musisz kupić dostęp do tego kursu!');
        showSection('pricing');
        return;
    }
    document.getElementById('subjectTitle').textContent = subject.title;
    const subjectVideoEl = document.getElementById('subjectVideo');
    const subjectVideoWrap = document.getElementById('subjectVideoWrap');
    const subjectVideoPaywall = document.getElementById('subjectVideoPaywall');
    if (subjectVideoEl && subjectVideoWrap) {
        subjectVideoEl.src = `https://www.youtube.com/embed/${subject.videoId}`;
        subjectVideoWrap.classList.add('video-loaded');
        if (subjectVideoPaywall) {
            subjectVideoPaywall.style.display = 'none';
            subjectVideoPaywall.setAttribute('aria-hidden', 'true');
        }
    } else if (subjectVideoEl) {
        subjectVideoEl.src = `https://www.youtube.com/embed/${subject.videoId}`;
    }
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
    
    // Aktualizuj breadcrumbs w dashboard
    updateDashboardBreadcrumbs(subject.title);
    
    showSection('subject');
    if (window.showRandomTaskForCourse) {
        showRandomTaskForCourse(course_id);
    }
}

function showSubjectPreview(subjectKey) {
    const subject = window.subjects[subjectKey];
    if (!subject) return;
    document.getElementById('subjectTitle').textContent = subject.title + ' (Podgląd)';
    const wrap = document.getElementById('subjectVideoWrap');
    const placeholder = document.getElementById('subjectVideoPlaceholder');
    const paywall = document.getElementById('subjectVideoPaywall');
    const videoEl = document.getElementById('subjectVideo');
    if (wrap && placeholder && paywall && videoEl) {
        wrap.classList.remove('video-loaded');
        videoEl.src = '';
        placeholder.style.display = 'none';
        paywall.style.display = 'flex';
        paywall.setAttribute('aria-hidden', 'false');
    }
    // PDF - lista bez przycisków pobierania
    const pdfSection = document.querySelector('.pdf-section');
    if (pdfSection) {
        let html = '<h3>Materiały PDF</h3><ul class="pdf-list">';
        subject.pdfs.forEach(pdf => {
            html += `<li class="pdf-item"><span>📄 ${pdf.charAt(0).toUpperCase() + pdf.slice(1)}</span> <span style="color:#aaa;font-size:0.95em;">(dostęp po zakupie)</span></li>`;
        });
        html += '</ul>';
        pdfSection.innerHTML = html;
    }
    // Quiz - tylko pytanie i opcje, bez możliwości zaznaczania i bez przycisku
    const quizSection = document.querySelector('.quiz-section');
    if (quizSection && subject.quiz && subject.quiz.length > 0) {
        const question = subject.quiz[0];
        let html = `<h3>Quiz - Sprawdź swoją wiedzę</h3><div class="quiz-question"><h4>Pytanie 1: ${question.question}</h4><div class="quiz-options">`;
        question.options.forEach((option, index) => {
            html += `<label class="quiz-option" style="opacity:0.6;"><input type="radio" name="q1" value="${index}" disabled> ${option}</label>`;
        });
        html += '</div><div style="color:#aaa;font-size:0.95em;margin-top:0.7em;">Quiz dostępny po zakupie</div></div>';
        quizSection.innerHTML = html;
    }
    
    // Aktualizuj breadcrumbs w dashboard
    updateDashboardBreadcrumbs(subject.title);
    
    showSection('subject');
}

function renderDashboardPanel() {
    const sidebar = document.getElementById('dashboardSidebar');
    const main = document.getElementById('dashboardMain');
    if (!sidebar || !main) {
        console.error('Nie znaleziono sidebar lub main');
        return;
    }
    
    
    sidebar.innerHTML = '';
    
    // Sprawdź czy użytkownik ma dostęp do jakiegokolwiek kursu
    const userHasAnyAccess = currentUser && userEnrollments && userEnrollments.length > 0;
    
    // Sortuj kursy tak, aby '0' (tutaj zacznij) był pierwszy
    const sortedSubjects = Object.entries(window.subjects).sort(([keyA], [keyB]) => {
        if (keyA === '0') return -1;
        if (keyB === '0') return 1;
        return Number(keyA) - Number(keyB);
    });
    
    sortedSubjects.forEach(([key, subject], idx) => {
        
        const item = document.createElement('button');
        item.className = 'course-list-item';
        item.dataset.key = key;
        
        // Dla wszystkich użytkowników (zalogowanych i niezalogowanych) pokazuj kursy w ten sam sposób
        // Jeśli użytkownik ma dostęp - bez ikony, jeśli nie ma - z ikoną kłódki
        if (currentUser && hasAccessToCourse(key)) {
            item.innerHTML = `<span>${subject.title}</span>`;
        } else {
            item.innerHTML = `<span>${subject.title}</span><span class="lock" title="Brak dostępu">🔒</span>`;
        }
        
        item.onclick = () => {
            // Remove active from all
            sidebar.querySelectorAll('.course-list-item').forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            
            // Aktualizuj breadcrumbs w dashboard
            updateDashboardBreadcrumbs(subject.title);
            
            // Render preview or full view
            if (currentUser && hasAccessToCourse(key)) {
                renderCourseFullView(key, main);
            } else {
                renderCoursePreview(key, main);
            }
        };
        sidebar.appendChild(item);
    });
    
    // Wybierz domyślny kurs:
    // - Dla użytkowników bez dostępu: '1' (Kinematyka)
    // - Dla użytkowników z dostępem: '0' (Tutaj zacznij)
    let defaultKey = null;
    if (userHasAnyAccess) {
        // Użytkownik ma dostęp - wybierz "Tutaj zacznij"
        defaultKey = '0';
    } else {
        // Użytkownik nie ma dostępu - wybierz "Kinematyka"
        defaultKey = '1';
    }
    
    // Znajdź i kliknij odpowiedni przycisk
    const defaultButton = sidebar.querySelector(`[data-key="${defaultKey}"]`);
    if (defaultButton) {
        defaultButton.click();
    } else {
        // Fallback - kliknij pierwszy dostępny przycisk
        sidebar.querySelector('.course-list-item')?.click();
    }
}

function renderCoursePreview(subjectKey, main) {
    // Usuń sprawdzenie logowania - pozwól niezalogowanym przeglądać kursy
    const subject = window.subjects[subjectKey];
    if (!subject) return;
    main.innerHTML = '';
    
    // Specjalny widok dla kursu "tutaj zacznij" - pokazuj jako zablokowany
    if (subjectKey === '0' || subjectKey === 0) {
        renderTutajZacznijView(main, true);
        return;
    }
    
    // Tytuł - wyśrodkowany z gradientem (tak samo jak dla osób z dostępem)
    const title = document.createElement('h2');
    title.textContent = subject.title;
    title.style.cssText = `
        text-align: center;
        font-size: 2rem;
        font-family: 'Poppins', sans-serif;
        font-weight: 800;
        background: linear-gradient(135deg, var(--magenta), var(--purple));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-top: -0.7rem;
        margin-bottom: 1.3rem;
    `;
    main.appendChild(title);
    
    // Sekcja z filmami (zablokowana dla użytkowników bez dostępu)
    const videoSection = document.createElement('div');
    videoSection.className = 'video-section';
    videoSection.style.marginBottom = '2rem';
    videoSection.style.position = 'relative';
    
    const videoHeader = document.createElement('h3');
    videoHeader.textContent = 'Materiały Wideo';
    videoHeader.style.marginBottom = '1.5rem';
    videoSection.appendChild(videoHeader);
    
    // Kontener dla listy filmów i odtwarzacza
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.style.display = 'grid';
    videoContainer.style.gridTemplateColumns = '1fr 2fr';
    videoContainer.style.gap = '1.5rem';
    videoContainer.style.marginBottom = '1.5rem';
    videoContainer.style.opacity = '0.4';
    videoContainer.style.pointerEvents = 'none';
    videoContainer.style.filter = 'grayscale(20%) blur(0.3px)';
    
    // Lista filmów (lewa kolumna) - zablokowana
    const videoListContainer = document.createElement('div');
    videoListContainer.className = 'video-list-container';
    videoListContainer.style.cssText = `
        background: #fff;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        max-height: 600px;
        overflow-y: auto;
    `;
    
    const videoListTitle = document.createElement('h4');
    videoListTitle.textContent = 'Lista lekcji';
    videoListTitle.style.marginBottom = '1rem';
    videoListTitle.style.color = 'var(--black)';
    videoListContainer.appendChild(videoListTitle);
    
    const videoList = document.createElement('div');
    videoList.className = 'video-list';
    videoList.id = `videoList-preview-${subjectKey}`;
    videoListContainer.appendChild(videoList);
    
    // Odtwarzacz wideo (prawa kolumna) - placeholder
    const videoPlayerContainer = document.createElement('div');
    videoPlayerContainer.className = 'video-player-container';
    
    const videoPlaceholder = document.createElement('div');
    videoPlaceholder.className = 'video-placeholder';
    videoPlaceholder.style.cssText = `
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #1f2937;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f3f4f6;
        font-size: 1.2rem;
        border: 2px dashed rgba(255,255,255,0.2);
    `;
    videoPlaceholder.textContent = 'Wideo dostępne po zakupie';
    videoPlayerContainer.appendChild(videoPlaceholder);
    
    videoContainer.appendChild(videoListContainer);
    videoContainer.appendChild(videoPlayerContainer);
    videoSection.appendChild(videoContainer);
    
    // Overlay z informacją o braku dostępu
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        z-index: 10;
        color: white;
        text-align: center;
        padding: 2rem;
    `;
    
    let buyCourseBtn, buyAllBtn;
    if (!currentUser) {
        buyCourseBtn = `<a href="#" onclick="showSection('login');return false;" class="btn btn-gradient" style="font-size: 1.1rem; min-width: 220px;">Kup ten kurs</a>`;
        buyAllBtn = `<a href="#" onclick="showSection('login');return false;" class="btn btn-outline" style="font-size: 1.1rem; min-width: 220px;">Kup wszystkie materiały</a>`;
    } else {
        buyCourseBtn = `<a href="#" onclick="buyAccess('${subjectKey}');return false;" class="btn btn-gradient" style="font-size: 1.1rem; min-width: 220px;">Kup ten kurs</a>`;
        buyAllBtn = `<a href="#" onclick="buyAccess('full_access');return false;" class="btn btn-outline" style="font-size: 1.1rem; min-width: 220px;">Kup wszystkie materiały</a>`;
    }
    
    overlay.innerHTML = `
        <div>
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <div>Filmy dostępne po zakupie kursu</div>
            <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.85;">To jest podgląd lekcji z tego kursu</div>
            <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                ${buyCourseBtn}
                ${buyAllBtn}
            </div>
        </div>
    `;
    videoSection.appendChild(overlay);
    
    main.appendChild(videoSection);
    
    // Załaduj filmy z bazy danych (tylko do podglądu listy)
    const course_id = parseInt(subjectKey);
    loadVideosPreviewForCourse(course_id, videoList);
    
    // PDF - 3 etapy w stylu feature-card (podobnie jak w full view)
    const pdfSection = document.createElement('div');
    const pdfHeader = document.createElement('h3');
    pdfHeader.textContent = 'Materiały PDF';
    pdfHeader.style.marginBottom = '1.5rem';
    pdfSection.appendChild(pdfHeader);
    
    const pdfCardsContainer = document.createElement('div');
    pdfCardsContainer.className = 'pdf-cards-grid';
    
    const stages = [
        { title: 'Etap 1', icon: '📚', description: 'Podstawy i wprowadzenie' },
        { title: 'Etap 2', icon: '🔬', description: 'Zadania do przerobienia' },
        { title: 'Etap 3', icon: '🚀', description: 'Zadania maturalne z tego działu' }
    ];
    
    stages.forEach((stage, index) => {
        const card = document.createElement('div');
        card.className = 'pdf-stage-card';
        card.style.opacity = '0.6';
        card.style.cursor = 'not-allowed';
        
        const icon = document.createElement('div');
        icon.className = 'pdf-stage-icon';
        icon.textContent = stage.icon;
        card.appendChild(icon);
        
        const title = document.createElement('h4');
        title.textContent = stage.title;
        card.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = stage.description;
        card.appendChild(description);
        
        const isPracaMocEnergia = parseInt(subjectKey) === 3;
        const isEtap3 = stage.title === 'Etap 3';
        
        if (isPracaMocEnergia && isEtap3) {
            card.onclick = () => alert('zadania maturalne z tego działu są wplecione w inne działy fizyki');
        } else {
            // Sprawdź czy użytkownik ma dostęp (także dla kursu 3, Etap 1 i 2)
            const hasAccess = currentUser && hasAccessToCourse(subjectKey);
            
            if (hasAccess) {
                const etapNumber = stage.title === 'Etap 1' ? 1 : stage.title === 'Etap 2' ? 2 : 3;
                card.style.opacity = '1';
                card.style.cursor = 'pointer';
                card.onclick = async () => {
                    card.style.opacity = '0.7';
                    card.textContent = 'Ładowanie...';
                    const url = await getSecurePdfUrl(subjectKey, etapNumber);
                    card.style.opacity = '1';
                    card.textContent = stage.title;
                    if (url) window.open(url, '_blank');
                };
            } else {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
                card.onclick = () => alert('Dostęp do PDF po zakupie kursu');
            }
        }
        
        pdfCardsContainer.appendChild(card);
    });
    
    pdfSection.appendChild(pdfCardsContainer);
    main.appendChild(pdfSection);
    
    // Dodaj miejsce na przykładowe zadanie z bazy danych
    const taskArea = document.createElement('div');
    taskArea.id = 'taskArea';
    taskArea.style.background = '#fff';
    taskArea.style.padding = '1.5rem 1rem';
    taskArea.style.margin = '1.5rem 0';
    taskArea.style.borderRadius = '12px';
    taskArea.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.04)';
    main.appendChild(taskArea);
    
    // Wyświetl przykładowe zadanie z bazy danych (zablokowane)
    showPreviewTask(subjectKey, taskArea);
    
    // Quiz - tylko pytanie i opcje, bez możliwości zaznaczania i bez przycisku
    if (subject.quiz && subject.quiz.length > 0) {
        const quizSection = document.createElement('div');
        quizSection.className = 'quiz-section';
        const question = subject.quiz[0];
        let quizHtml = `<h3>Quiz - Sprawdź swoją wiedzę</h3><div class="quiz-question"><h4>Pytanie 1: ${question.question}</h4><div class="quiz-options">`;
        question.options.forEach((option, index) => {
            quizHtml += `<label class="quiz-option" style="opacity:0.6;"><input type="radio" name="q1" value="${index}" disabled> ${option}</label>`;
        });
        quizHtml += '</div><div style="color:#aaa;font-size:0.95em;margin-top:0.7em;">Quiz dostępny po zakupie</div></div>';
        quizSection.innerHTML = quizHtml;
        main.appendChild(quizSection);
    }
    
    // Dodaj przyciski dla niezalogowanych użytkowników
    if (!currentUser) {
        const authSection = document.createElement('div');
        authSection.style.textAlign = 'center';
        authSection.style.marginTop = '2rem';
        authSection.style.padding = '2rem';
        authSection.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)';
        authSection.style.borderRadius = '20px';
        authSection.style.border = '2px solid #e0e7ff';
        
        const authTitle = document.createElement('h3');
        authTitle.textContent = 'Chcesz uzyskać pełny dostęp do tego kursu?';
        authTitle.style.marginBottom = '1rem';
        authTitle.style.color = '#374151';
        authSection.appendChild(authTitle);
        
        const authDescription = document.createElement('p');
        authDescription.textContent = 'Zaloguj się lub zarejestruj, aby móc kupić dostęp i korzystać z pełnej zawartości kursu.';
        authDescription.style.marginBottom = '1.5rem';
        authDescription.style.color = '#6b7280';
        authSection.appendChild(authDescription);
        
        const authButtons = document.createElement('div');
        authButtons.style.display = 'flex';
        authButtons.style.gap = '1rem';
        authButtons.style.justifyContent = 'center';
        authButtons.style.flexWrap = 'wrap';
        
        const loginBtn = document.createElement('button');
        loginBtn.className = 'btn btn-primary';
        loginBtn.textContent = 'Zaloguj się';
        loginBtn.onclick = () => showSection('login');
        authButtons.appendChild(loginBtn);
        
        const registerBtn = document.createElement('button');
        registerBtn.className = 'btn btn-gradient';
        registerBtn.textContent = 'Zarejestruj się';
        registerBtn.onclick = () => showSection('register');
        authButtons.appendChild(registerBtn);
        
        authSection.appendChild(authButtons);
        main.appendChild(authSection);
    }
}

function renderCourseFullView(subjectKey, main) {
    const subject = window.subjects[subjectKey];
    if (!subject) return;
    main.innerHTML = '';
    
    // Specjalny widok dla kursu "tutaj zacznij"
    if (subjectKey === '0' || subjectKey === 0) {
        renderTutajZacznijView(main);
        return;
    }
    
    // Tytuł - wyśrodkowany z gradientem
    const title = document.createElement('h2');
    title.textContent = subject.title;
    title.style.cssText = `
        text-align: center;
        font-size: 2rem;
        font-family: 'Poppins', sans-serif;
        font-weight: 800;
        background: linear-gradient(135deg, var(--magenta), var(--purple));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-top: -0.7rem;
        margin-bottom: 1.3rem;
    `;
    main.appendChild(title);
    
    // Sekcja z filmami z bazy danych
    const videoSection = document.createElement('div');
    videoSection.className = 'video-section';
    videoSection.style.marginBottom = '2rem';
    
    const videoHeader = document.createElement('h3');
    videoHeader.textContent = 'Materiały Wideo';
    videoHeader.style.marginBottom = '1.5rem';
    videoSection.appendChild(videoHeader);
    
    // Kontener dla listy filmów i odtwarzacza
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.style.display = 'grid';
    videoContainer.style.gridTemplateColumns = '1fr 2fr';
    videoContainer.style.gap = '1.5rem';
    videoContainer.style.marginBottom = '1.5rem';
    
    // Lista filmów (lewa kolumna)
    const videoListContainer = document.createElement('div');
    videoListContainer.className = 'video-list-container';
    videoListContainer.style.cssText = `
        background: #fff;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        max-height: 600px;
        overflow-y: auto;
    `;
    
    const videoListTitle = document.createElement('h4');
    videoListTitle.textContent = 'Lista lekcji';
    videoListTitle.style.marginBottom = '1rem';
    videoListTitle.style.color = 'var(--black)';
    videoListContainer.appendChild(videoListTitle);
    
    const videoList = document.createElement('div');
    videoList.className = 'video-list';
    videoList.id = `videoList-${subjectKey}`;
    videoListContainer.appendChild(videoList);
    
    // Odtwarzacz wideo (prawa kolumna)
    const videoPlayerContainer = document.createElement('div');
    videoPlayerContainer.className = 'video-player-container';
    
    const videoPlayer = document.createElement('iframe');
    videoPlayer.id = `videoPlayer-${subjectKey}`;
    videoPlayer.className = 'video-frame';
    // Ustawiamy identyczne wymiary jak placeholder - aspect-ratio 16:9
    videoPlayer.style.cssText = 'width:100%;aspect-ratio:16/9;border-radius:12px;border:none;';
    videoPlayer.setAttribute('frameborder', '0');
    videoPlayer.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    videoPlayer.setAttribute('allowfullscreen', '');
    videoPlayer.src = ''; // Zostanie ustawione po załadowaniu filmów
    
    // Placeholder gdy brak filmów
    const videoPlaceholder = document.createElement('div');
    videoPlaceholder.className = 'video-placeholder';
    videoPlaceholder.style.cssText = `
        width: 100%;
        background: #f8fafc;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
        font-size: 1.1rem;
        border: 2px dashed #e2e8f0;
        aspect-ratio: 16 / 9;
    `;
    // Utwórz bardziej sugestywny placeholder
    const placeholderContent = document.createElement('div');
    placeholderContent.style.cssText = `
        text-align: center;
        padding: 2rem;
    `;
    
    const placeholderIcon = document.createElement('div');
    placeholderIcon.style.cssText = `
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    `;
    placeholderIcon.textContent = '▶️';
    
    const placeholderText = document.createElement('div');
    placeholderText.style.cssText = `
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--black);
        margin-bottom: 0.5rem;
    `;
    placeholderText.textContent = 'Wybierz lekcję z listy';
    
    const placeholderSubtext = document.createElement('div');
    placeholderSubtext.style.cssText = `
        font-size: 0.95rem;
        color: #888;
    `;
    placeholderSubtext.textContent = 'Kliknij na lekcję po lewej stronie, aby rozpocząć oglądanie';
    
    placeholderContent.appendChild(placeholderIcon);
    placeholderContent.appendChild(placeholderText);
    placeholderContent.appendChild(placeholderSubtext);
    videoPlaceholder.appendChild(placeholderContent);
    
    // Dodaj iframe do kontenera (ukryty na początku)
    videoPlayer.style.display = 'none';
    videoPlayerContainer.appendChild(videoPlayer);
    videoPlayerContainer.appendChild(videoPlaceholder);
    
    videoContainer.appendChild(videoListContainer);
    videoContainer.appendChild(videoPlayerContainer);
    videoSection.appendChild(videoContainer);
    main.appendChild(videoSection);
    
    // Załaduj filmy z bazy danych
    const course_id = parseInt(subjectKey);
    loadVideosForCourse(course_id, videoList, videoPlayer, videoPlaceholder);
    
    // PDF - 3 etapy w stylu feature-card
    const pdfSection = document.createElement('div');
    const pdfHeader = document.createElement('h3');
    pdfHeader.textContent = 'Materiały PDF';
    pdfHeader.style.marginBottom = '1.5rem';
    pdfSection.appendChild(pdfHeader);
    
    const pdfCardsContainer = document.createElement('div');
    pdfCardsContainer.className = 'pdf-cards-grid';
    
    const stages = [
        { title: 'Etap 1', icon: '📚', description: 'Podstawy i wprowadzenie' },
        { title: 'Etap 2', icon: '🔬', description: 'Zadania do przerobienia' },
        { title: 'Etap 3', icon: '🚀', description: 'Zadania maturalne z tego działu' }
    ];
    
    stages.forEach((stage, index) => {
        const card = document.createElement('div');
        card.className = 'pdf-stage-card';
        
        const icon = document.createElement('div');
        icon.className = 'pdf-stage-icon';
        icon.textContent = stage.icon;
        card.appendChild(icon);
        
        const title = document.createElement('h4');
        title.textContent = stage.title;
        card.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = stage.description;
        card.appendChild(description);
        
        // Sprawdź czy użytkownik ma dostęp do kursu
        const hasAccess = currentUser && hasAccessToCourse(subjectKey);
        
        const isPracaMocEnergia = parseInt(subjectKey) === 3;
        const isEtap3 = stage.title === 'Etap 3';
        
        if (isPracaMocEnergia && isEtap3) {
            card.style.opacity = '0.6';
            card.style.cursor = 'not-allowed';
            card.onclick = () => alert('zadania maturalne z tego działu są wplecione w inne działy fizyki');
        } else {
            if (hasAccess) {
                const etapNumber = stage.title === 'Etap 1' ? 1 : stage.title === 'Etap 2' ? 2 : 3;
                card.style.cursor = 'pointer';
                card.onclick = async () => {
                    card.style.opacity = '0.7';
                    const origText = card.textContent;
                    card.textContent = 'Ładowanie...';
                    const url = await getSecurePdfUrl(subjectKey, etapNumber);
                    card.style.opacity = '1';
                    card.textContent = origText;
                    if (url) window.open(url, '_blank');
                };
            } else {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
                card.onclick = () => alert('Dostęp do PDF po zakupie kursu');
            }
        }
        
        pdfCardsContainer.appendChild(card);
    });
    
    pdfSection.appendChild(pdfCardsContainer);
    main.appendChild(pdfSection);
    // Dodaj miejsce na zadania z bazy
    const taskArea = document.createElement('div');
    taskArea.id = 'taskArea';
    // Dodaj styl dla taskArea
    taskArea.style.background = '#fff';
    taskArea.style.padding = '1.5rem 1rem';
    taskArea.style.margin = '1.5rem 0';
    taskArea.style.borderRadius = '12px';
    taskArea.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.04)';
    main.appendChild(taskArea);
    // Przycisk kupna kursu (zawsze pokazuj na potrzeby testu)
    // course_id już zadeklarowane wcześniej
    // Pokazuj przyciski kupna tylko jeśli użytkownik nie ma dostępu do kursu
    if (!hasAccessToCourse(subjectKey)) {
        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '1rem';
        btnGroup.style.margin = '2rem 0 1rem 0';
        // Pojedynczy kurs
        const buyBtn = document.createElement('a');
        buyBtn.href = '#';
        buyBtn.onclick = () => { buyAccess(course_id); return false; };
        buyBtn.className = 'btn btn-gradient';
        buyBtn.textContent = 'Kup ten kurs';
        btnGroup.appendChild(buyBtn);
        // Wszystkie materiały
        const buyAllBtn = document.createElement('a');
        buyAllBtn.href = '#';
        buyAllBtn.onclick = () => { buyAccess('full_access'); return false; };
        buyAllBtn.className = 'btn btn-outline';
        buyAllBtn.textContent = 'Kup wszystkie materiały';
        btnGroup.appendChild(buyAllBtn);
        main.appendChild(btnGroup);
    }
    // Logi do testu
    // Quiz - pytanie i opcje, z możliwością zaznaczania i przyciskiem
    if (subject.quiz && subject.quiz.length > 0) {
        const quizSection = document.createElement('div');
        quizSection.className = 'quiz-section';
        const question = subject.quiz[0];
        let quizHtml = `<h3>Quiz - Sprawdź swoją wiedzę</h3><div class="quiz-question"><h4>Pytanie 1: ${question.question}</h4><div class="quiz-options">`;
        question.options.forEach((option, index) => {
            quizHtml += `<label class="quiz-option"><input type="radio" name="q1" value="${index}"> ${option}</label>`;
        });
        quizHtml += '</div><button class="btn btn-gradient" onclick="checkQuiz()">Sprawdź odpowiedzi</button></div>';
        quizSection.innerHTML = quizHtml;
        main.appendChild(quizSection);
    }
    // Dodaj wyświetlanie zadania z bazy dla danego kursu (nie dla kursu "tutaj zacznij")
    if (window.showRandomTaskForCourse && course_id !== 0 && course_id !== '0') {
        showRandomTaskForCourse(course_id);
    }
}

// Specjalny widok dla kursu "tutaj zacznij"
function renderTutajZacznijView(main, isLocked = false) {
    // Tytuł
    const title = document.createElement('h2');
    title.textContent = 'Tutaj zacznij';
    title.style.cssText = `
        text-align: center;
        font-size: 2rem;
        font-family: 'Poppins', sans-serif;
        font-weight: 800;
        background: linear-gradient(135deg, var(--magenta), var(--purple));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-top: -0.7rem;
        margin-bottom: 2rem;
    `;
    main.appendChild(title);
    
    // Tekst informacyjny nad lekcjami (tylko dla użytkowników z dostępem)
    if (!isLocked) {
        const infoText = document.createElement('p');
        infoText.textContent = 'Wybierz lekcję, aby rozpocząć naukę';
        infoText.style.cssText = `
            text-align: center;
            color: #6b7280;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        `;
        main.appendChild(infoText);
    }
    
    // Kontener dla kafelków lekcji
    const lessonsContainer = document.createElement('div');
    lessonsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    `;
    
    // Dodaj kontener z kafelkami do main
    main.appendChild(lessonsContainer);

    // Pełnoekranowy overlay na treść lekcji (Markdown + LaTeX / wideo)
    if (!document.getElementById('lessonOverlay')) {
        const lessonOverlay = document.createElement('div');
        lessonOverlay.id = 'lessonOverlay';
        lessonOverlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.92);
            display: none;
            z-index: 1000;
            justify-content: center;
            align-items: flex-start;
            padding: 3rem 1.5rem;
            overflow-y: auto;
        `;

        lessonOverlay.innerHTML = `
            <div class="lesson-overlay-inner" style="max-width: 960px; margin: 0 auto; width: 100%; background: #0f172a; border-radius: 16px; padding: 1.5rem 1.5rem 2rem; color: #e5e7eb; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:1rem;">
                    <button id="lessonBackButton" class="btn btn-outline2" style="white-space:nowrap;">← Wróć do listy lekcji</button>
                    <h2 id="lessonTitle" class="lesson-title" style="font-size:1.6rem;margin:0;"></h2>
                </div>
                <div id="lessonVideoWrapper" class="lesson-video" style="margin-bottom: 1.5rem; display:none;">
                    <iframe
                        id="lessonVideoPlayer"
                        class="video-frame"
                        style="width:100%;aspect-ratio:16/9;border-radius:12px;border:none;"
                        src=""
                        title="Lekcja wideo"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
                <div id="lessonTextWrapper" class="lesson-text" style="display:none;background:#020617;border-radius:12px;padding:1.25rem;max-height:none;overflow:auto;">
                    <div id="lessonContent" class="prose" style="color:#e5e7eb;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(lessonOverlay);

        const backBtn = document.getElementById('lessonBackButton');
        if (backBtn) {
            backBtn.onclick = () => {
                const overlay = document.getElementById('lessonOverlay');
                const iframe = document.getElementById('lessonVideoPlayer');
                if (overlay) overlay.style.display = 'none';
                if (iframe) iframe.src = '';
            };
        }
    }
    
    // Załaduj lekcje z bazy danych dla course_id = 0 i zbuduj kafelki
    loadStartLessonsIntoContainer(lessonsContainer, isLocked);
}

/**
 * @typedef {Object} Lesson
 * @property {number} video_id
 * @property {number} course_id
 * @property {string} tytul_lekcji
 * @property {string|null} yt_id_wideo
 * @property {string|null} content
 */

/**
 * Ładuje lekcje z tabeli "video" dla kursu "Tutaj zacznij" (course_id = 0)
 * i renderuje je jako kafelki, które po kliknięciu wywołują loadLesson.
 *
 * @param {HTMLDivElement} lessonsContainer
 * @param {boolean} isLocked
 */
async function loadStartLessonsIntoContainer(lessonsContainer, isLocked) {
    try {
        /** @type {{ data: Lesson[] | null, error: any }} */
        const { data: lessons, error } = await supabase
            .from('video')
            .select('video_id, course_id, tytul_lekcji, yt_id_wideo, content')
            .eq('course_id', 0)
            .order('video_id', { ascending: true });

        lessonsContainer.innerHTML = '';

        if (error) {
            console.error('Błąd pobierania lekcji dla "Tutaj zacznij":', error);
            lessonsContainer.innerHTML = '<p style="color:#ef4444;">Nie udało się załadować lekcji startowych.</p>';
            return;
        }

        if (!lessons || lessons.length === 0) {
            lessonsContainer.innerHTML = '<p>Brak zdefiniowanych lekcji w sekcji "Tutaj zacznij".</p>';
            return;
        }

        lessons.forEach((lesson) => {
            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card';
            lessonCard.style.cssText = `
                background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
                border: 2px solid #e0e7ff;
                border-radius: 16px;
                padding: 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            `;

            // Hover effect
            lessonCard.onmouseenter = () => {
                lessonCard.style.transform = 'translateY(-4px)';
                lessonCard.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                lessonCard.style.borderColor = 'var(--magenta)';
            };
            lessonCard.onmouseleave = () => {
                lessonCard.style.transform = 'translateY(0)';
                lessonCard.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                lessonCard.style.borderColor = '#e0e7ff';
            };

            // Ikona - dopasowana do tytułu lekcji (jak w poprzedniej, statycznej wersji)
            const icon = document.createElement('div');
            let iconChar = '📚';
            const titleText = (lesson.tytul_lekcji || '').toLowerCase();
            if (titleText.includes('wstęp')) {
                // Wstęp – ogólne wprowadzenie
                iconChar = '📘';
            } else if (titleText.includes('planer')) {
                // Planer maturalny
                iconChar = '🧭';
            } else if (titleText.includes('mindset')) {
                iconChar = '🧠';
            } else if (titleText.includes('wymaksować') || titleText.includes('jest późno')) {
                iconChar = '⏰';
            } else if (titleText.includes('przekształcanie wzorów') || titleText.includes('przekształcanie')) {
                // Przekształcanie wzorów
                iconChar = '📐';
            } else if (titleText.includes('wektory') || titleText.includes('trygonometria')) {
                // Wektory i trygonometria
                iconChar = '📊';
            } else if (titleText.includes('słownik cke') || titleText.includes('słownik')) {
                iconChar = '📖';
            } else if (titleText.includes('Wzory')) {
                iconChar = '🧾';
            }
            icon.textContent = iconChar;
            icon.style.cssText = `
                font-size: 3rem;
                text-align: center;
                margin-bottom: 1rem;
            `;
            lessonCard.appendChild(icon);

            // Tytuł lekcji
            const lessonTitle = document.createElement('h3');
            lessonTitle.textContent = lesson.tytul_lekcji;
            lessonTitle.style.cssText = `
                font-size: 1.5rem;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 0.75rem;
                text-align: center;
                font-family: 'Poppins', sans-serif;
            `;
            lessonCard.appendChild(lessonTitle);

            // Krótki opis zależny od treści (czy ma wideo/tekst)
            const description = document.createElement('p');
            const hasVideo = !!lesson.yt_id_wideo;
            const hasText = !!(lesson.content && lesson.content.trim().length > 0);
            if (hasVideo && hasText) {
                description.textContent = 'Wideo + notatki do lekcji';
            } else if (hasVideo) {
                description.textContent = 'Lekcja wideo';
            } else if (hasText) {
                description.textContent = 'Lekcja tekstowa';
            } else {
                description.textContent = 'Ta lekcja nie ma jeszcze treści';
            }
            description.style.cssText = `
                color: #6b7280;
                text-align: center;
                line-height: 1.6;
                font-size: 1rem;
            `;
            lessonCard.appendChild(description);

            // Kliknięcie w kafelek -> załaduj treść lekcji
            lessonCard.onclick = () => {
                loadLesson(lesson.video_id);
            };

            lessonsContainer.appendChild(lessonCard);
        });

        // Jeśli kurs jest zablokowany, przyciemnij kafelki i dodaj overlay
        if (isLocked) {
            lessonsContainer.querySelectorAll('.lesson-card').forEach(card => {
                card.style.opacity = '0.6';
                card.style.pointerEvents = 'none';
            });

            lessonsContainer.style.position = 'relative';
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 1rem;
                z-index: 10;
                min-height: 400px;
            `;

            let buyAllBtnHtml;
            if (!currentUser) {
                buyAllBtnHtml = `<a href="#" onclick="showSection('login');return false;" class="btn btn-gradient" style="font-size: 1.1rem; min-width: 220px;">Kup wszystkie materiały</a>`;
            } else {
                buyAllBtnHtml = `<a href="#" onclick="buyAccess('full_access');return false;" class="btn btn-gradient" style="font-size: 1.1rem; min-width: 220px;">Kup wszystkie materiały</a>`;
            }

            overlay.innerHTML = `
                <div style="text-align: center; color: #f9fafb; padding: 0 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">
                        Odblokuj kurs "Tutaj zacznij" i resztę materiałów
                    </div>
                    <div style="font-size: 0.95rem; opacity: 0.9; margin-bottom: 1.5rem;">
                        Pod spodem widzisz plan startowy kursu. Pełen dostęp uzyskasz po zakupie materiałów.
                    </div>
                    <div style="display: flex; justify-content: center;">
                        ${buyAllBtnHtml}
                    </div>
                </div>
            `;

            lessonsContainer.appendChild(overlay);
        }
    } catch (e) {
        console.error('Nieoczekiwany błąd podczas ładowania lekcji startowych:', e);
        lessonsContainer.innerHTML = '<p style="color:#ef4444;">Wystąpił błąd podczas ładowania lekcji.</p>';
    }
}

/**
 * Ładuje i wyświetla lekcję na podstawie jej ID (video_id) z tabeli "video".
 * Obsługuje 3 przypadki:
 *  - tylko wideo
 *  - tylko tekst (Markdown + LaTeX)
 *  - wideo + tekst
 *
 * @param {number} lessonId
 * @returns {Promise<void>}
 */
async function loadLesson(lessonId) {
    const overlay = document.getElementById('lessonOverlay');
    const titleEl = document.getElementById('lessonTitle');
    const videoWrapper = document.getElementById('lessonVideoWrapper');
    const videoIframe = document.getElementById('lessonVideoPlayer');
    const textWrapper = document.getElementById('lessonTextWrapper');
    const contentEl = document.getElementById('lessonContent');

    if (!overlay || !titleEl || !videoWrapper || !videoIframe || !textWrapper || !contentEl) {
        console.error('Brakuje elementów kontenera lekcji w DOM.');
        return;
    }

    // Pokaż fullscreen overlay
    overlay.style.display = 'flex';
    overlay.scrollTop = 0;

    // Reset widoku
    titleEl.textContent = 'Ładowanie lekcji...';
    videoWrapper.style.display = 'none';
    videoIframe.src = '';
    textWrapper.style.display = 'none';
    contentEl.innerHTML = '';

    /** @type {{ data: Lesson | null, error: any }} */
    const { data: lesson, error } = await supabase
        .from('video')
        .select('video_id, course_id, tytul_lekcji, yt_id_wideo, content')
        .eq('video_id', lessonId)
        .single();

    if (error || !lesson) {
        console.error('Błąd pobierania lekcji:', error);
        titleEl.textContent = 'Błąd ładowania lekcji';
        contentEl.innerHTML = '<p style="color:#ef4444;">Nie udało się załadować lekcji.</p>';
        textWrapper.style.display = 'block';
        return;
    }

    titleEl.textContent = lesson.tytul_lekcji || 'Lekcja';

    const lessonTitleLower = (lesson.tytul_lekcji || '').toLowerCase();

    // Specjalny przypadek: lekcja „planer” – zamiast zwykłego tekstu
    // pokazujemy konfigurator / plan nauki.
    if (lessonTitleLower.includes('planer')) {
        videoWrapper.style.display = 'none';
        videoIframe.src = '';
        await renderStudyPlanInLesson(contentEl);
        textWrapper.style.display = 'block';
        return;
    }

    const hasVideo = !!lesson.yt_id_wideo;
    const hasText = !!(lesson.content && lesson.content.trim().length > 0);

    // Wideo
    if (hasVideo) {
        const ytId = lesson.yt_id_wideo;
        const youtubeUrl = `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0`;
        videoIframe.src = youtubeUrl;
        videoWrapper.style.display = 'block';
    } else {
        videoWrapper.style.display = 'none';
        videoIframe.src = '';
    }

    // Tekst (Markdown + LaTeX)
    if (hasText) {
        const rawMarkdown = lesson.content || '';
        const html = window.marked ? window.marked.parse(rawMarkdown) : rawMarkdown;

        contentEl.innerHTML = html;
        textWrapper.style.display = 'block';

        if (window.renderMathInElement) {
            window.renderMathInElement(contentEl, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    } else {
        textWrapper.style.display = 'none';
        contentEl.innerHTML = '';
    }

    if (!hasVideo && !hasText) {
        textWrapper.style.display = 'block';
        contentEl.innerHTML = '<p>Ta lekcja nie ma jeszcze treści.</p>';
    }
}

// Funkcja do pobierania i wyświetlania filmów/segmentów z bazy danych
async function loadVideosForCourse(course_id, videoListElement, videoPlayerElement, videoPlaceholder) {
    try {
        // 1) Pobierz główne wideo (yt_id_wideo) powiązane z danym kursem
        const { data: videoRow, error: videoError } = await supabase
            .from('video')
            .select('yt_id_wideo')
            .eq('course_id', course_id)
            .single();

        if (videoError || !videoRow) {
            console.error('Błąd pobierania wideo dla kursu:', videoError);
            videoListElement.innerHTML = '<p style="color: #ef4444; padding: 1rem;">Brak wideo dla tego kursu</p>';
            return;
        }

        const ytId = videoRow.yt_id_wideo;
        
        // 2) Pobierz segmenty z tabeli video_segments dla danego kursu (kolumna video_id)
        const { data: segments, error: segmentsError } = await supabase
            .from('video_segments')
            .select('segment_id, tytul_segmentu, start_s, end_s')
            .eq('video_id', course_id)
            .order('segment_id', { ascending: true });
        
        if (segmentsError) {
            console.error('Błąd pobierania segmentów wideo:', segmentsError);
            videoListElement.innerHTML = '<p style="color: #ef4444; padding: 1rem;">Błąd ładowania lekcji wideo</p>';
            return;
        }
        
        if (!segments || segments.length === 0) {
            videoListElement.innerHTML = '<p style="color: #888; padding: 1rem;">Brak zdefiniowanych lekcji wideo dla tego kursu</p>';
            return;
        }

        // Wyczyść listę
        videoListElement.innerHTML = '';
        
        // Utwórz elementy listy segmentów (lekcji)
        segments.forEach((segment, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-list-item';
            videoItem.style.cssText = `
                padding: 1rem;
                margin-bottom: 0.5rem;
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            // Dodaj hover effect
            videoItem.addEventListener('mouseenter', () => {
                if (!videoItem.classList.contains('active')) {
                    videoItem.style.background = '#f1f5f9';
                    videoItem.style.borderColor = 'var(--magenta)';
                }
            });
            
            videoItem.addEventListener('mouseleave', () => {
                if (!videoItem.classList.contains('active')) {
                    videoItem.style.background = '#f8fafc';
                    videoItem.style.borderColor = '#e2e8f0';
                }
            });
            
            // Numer lekcji i tytuł
            const videoNumber = document.createElement('div');
            videoNumber.style.cssText = `
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 0.25rem;
            `;
            videoNumber.textContent = `Lekcja ${index + 1}`;
            
            const videoTitle = document.createElement('div');
            videoTitle.style.cssText = `
                font-weight: 600;
                color: var(--black);
                font-size: 0.95rem;
            `;
            videoTitle.textContent = segment.tytul_segmentu || `Lekcja ${index + 1}`;
            
            videoItem.appendChild(videoNumber);
            videoItem.appendChild(videoTitle);
            
            // Obsługa kliknięcia - odtwórz film
            videoItem.addEventListener('click', () => {
                // Usuń klasę active ze wszystkich elementów
                videoListElement.querySelectorAll('.video-list-item').forEach(item => {
                    item.classList.remove('active');
                    item.style.background = '#f8fafc';
                    item.style.borderColor = '#e2e8f0';
                });
                
                // Dodaj klasę active do klikniętego elementu
                videoItem.classList.add('active');
                videoItem.style.background = 'rgba(255, 0, 128, 0.1)';
                videoItem.style.borderColor = 'var(--magenta)';
                
                // Ustaw źródło iframe - prawidłowy format embed URL dla YouTube
                // Parametry:
                //  - rel=0 (wyłącza powiązane filmy - bardzo ważne!)
                //  - modestbranding=1 (mniej logo YouTube)
                //  - showinfo=0 (ukrywa tytuł i kanał)
                //  - start / end – czas trwania segmentu w sekundach
                const start = Number(segment.start_s) || 0;
                const end = Number(segment.end_s) || undefined;
                const timeParams = end && end > start 
                    ? `&start=${start}&end=${end}` 
                    : (start > 0 ? `&start=${start}` : '');
                
                const youtubeUrl = `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&autoplay=1${timeParams}`;
                
                // Zapisz dokładne wymiary placeholdera lub kontenera przed ukryciem
                let targetWidth, targetHeight;
                
                if (videoPlaceholder && videoPlaceholder.style.display !== 'none') {
                    // Placeholder jest widoczny - użyj jego wymiarów
                    const placeholderRect = videoPlaceholder.getBoundingClientRect();
                    targetWidth = placeholderRect.width;
                    targetHeight = placeholderRect.height;
                } else if (videoPlayerElement.style.display === 'block') {
                    // Wideo jest już wyświetlone - użyj jego obecnych wymiarów
                    const videoRect = videoPlayerElement.getBoundingClientRect();
                    targetWidth = videoRect.width;
                    targetHeight = videoRect.height;
                } else {
                    // Fallback - użyj kontenera
                    const containerRect = videoPlayerElement.parentElement.getBoundingClientRect();
                    targetWidth = containerRect.width;
                    targetHeight = containerRect.width * (9 / 16); // 16:9 aspect ratio
                }
                
                // Ustaw identyczne wymiary dla wideo
                videoPlayerElement.style.width = `${targetWidth}px`;
                videoPlayerElement.style.height = `${targetHeight}px`;
                videoPlayerElement.style.aspectRatio = '16 / 9';
                videoPlayerElement.style.borderRadius = '12px';
                videoPlayerElement.style.border = 'none';
                videoPlayerElement.style.display = 'block';
                videoPlayerElement.style.maxWidth = '100%';
                
                // Ukryj placeholder jeśli jest widoczny
                if (videoPlaceholder && videoPlaceholder.style.display !== 'none') {
                    videoPlaceholder.style.display = 'none';
                }
                
                // Ustaw źródło wideo (nawet jeśli już jest ustawione, aby odświeżyć)
                videoPlayerElement.src = youtubeUrl;
            });
            
            videoListElement.appendChild(videoItem);
        });
        
        // Nie wybieramy automatycznie pierwszego filmu - użytkownik musi sam wybrać lekcję
        
    } catch (error) {
        console.error('Błąd podczas ładowania filmów:', error);
        videoListElement.innerHTML = '<p style="color: #ef4444; padding: 1rem;">Błąd ładowania filmów</p>';
    }
}

// ---------- PLAN NAUKI / PLANER MENTALNY ----------

const STUDY_TOPICS = [
    'Kinematyka',
    'Dynamika',
    'Praca Moc Energia',
    'Bryła Sztywna',
    'Ruch Drgający',
    'Fale Mechaniczne',
    'Hydrostatyka',
    'Termodynamika',
    'Grawitacja',
    'Elektrostatyka',
    'Prąd Elektryczny',
    'Magnetyzm',
    'Indukcja',
    'Fale E-M',
    'Fizyka Atomowa',
    'Fizyka Jądrowa'
];

/**
 * Generuje i zapisuje indywidualny plan nauki do matury z fizyki.
 *
 * @param {string} userId
 * @param {string[]} completedTopicsArray - nazwy działów już przerobionych (pomijane w planie)
 */
async function generateStudyPlan(userId, completedTopicsArray = []) {
    // Stałe i pomocnicze funkcje dat
    /** @param {Date} d */
    const toYMD = (d) => d.toISOString().slice(0, 10);

    /** @param {Date} d @param {number} days */
    const addDays = (d, days) => {
        const copy = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        copy.setUTCDate(copy.getUTCDate() + days);
        return copy;
    };

    /** dzisiejsza data w „wersji dziennej” (bez godziny) */
    const now = new Date();
    let today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const currentYear = today.getUTCFullYear();
    const examDate = new Date(Date.UTC(currentYear, 4, 19)); // 19 maja
    const ARKUSZ_DAYS = 21;

    // Wyczyść dotychczasowy plan użytkownika
    await supabase.from('study_plans').delete().eq('user_id', userId);

    /** @type {Array<{
     *  user_id: string,
     *  scheduled_date: string,
     *  topic_name: string,
     *  activity_type: string,
     *  description: string,
     *  is_completed: boolean
     * }>} */
    const planRows = [];

    // Po maturze – nic nie planujemy
    if (today > examDate) {
        return { ok: true, reason: 'after_exam', inserted: 0 };
    }

    const isSunday = (d) => d.getUTCDay() === 0;

    // Data startu okresu arkuszy
    let arkuszStart = addDays(examDate, -ARKUSZ_DAYS);
    if (arkuszStart < today) {
        arkuszStart = today; // jeśli zostało mniej niż 21 dni, arkusze od dziś
    }

    // Wolne niedziele w całym okresie (dziś -> egzamin)
    {
        let d = today;
        while (d <= examDate) {
            if (isSunday(d)) {
                planRows.push({
                    user_id: userId,
                    scheduled_date: toYMD(d),
                    topic_name: 'Dzień wolny',
                    activity_type: 'wolne',
                    description: 'Niedziela – dzień wolny od nauki.',
                    is_completed: false
                });
            }
            d = addDays(d, 1);
        }
    }

    // Jeśli do matury zostało mniej niż 3 tygodnie -> tylko arkusze + wolne już dodane
    if (arkuszStart.getTime() === today.getTime()) {
        let d = today;
        while (d <= examDate) {
            if (!isSunday(d)) {
                planRows.push({
                    user_id: userId,
                    scheduled_date: toYMD(d),
                    topic_name: 'Arkusze maturalne',
                    activity_type: 'arkusz',
                    description: 'Rozwiąż pełny arkusz maturalny z fizyki w warunkach zbliżonych do egzaminu.',
                    is_completed: false
                });
            }
            d = addDays(d, 1);
        }

        if (planRows.length > 0) {
            const { error } = await supabase.from('study_plans').insert(planRows);
            if (error) throw error;
        }

        return { ok: true, mode: 'only_arkusze', inserted: planRows.length };
    }

    const completedSet = new Set((completedTopicsArray || []).map((t) => t.toLowerCase()));
    const remainingTopics = STUDY_TOPICS.filter(
        (name) => !completedSet.has(name.toLowerCase())
    );
    const hasLearningPhase = remainingTopics.length > 0;

    // Zakres nauki działów: [today, arkuszStart)
    /** @type {Date[]} */
    const learningDates = [];
    {
        let d = today;
        while (d < arkuszStart) {
            if (!isSunday(d)) learningDates.push(d);
            d = addDays(d, 1);
        }
    }

    // Arkusze: od arkuszStart do egzaminu (bez niedziel)
    /** @type {Date[]} */
    const arkuszDates = [];
    {
        let d = arkuszStart;
        while (d <= examDate) {
            if (!isSunday(d)) arkuszDates.push(d);
            d = addDays(d, 1);
        }
    }

    // Jeśli wszystkie działy są zrobione -> tylko arkusze
    if (!hasLearningPhase) {
        for (const d of arkuszDates) {
            planRows.push({
                user_id: userId,
                scheduled_date: toYMD(d),
                topic_name: 'Arkusze maturalne',
                activity_type: 'arkusz',
                description: 'Rozwiąż pełny arkusz maturalny z fizyki w warunkach zbliżonych do egzaminu.',
                is_completed: false
            });
        }

        if (planRows.length > 0) {
            const { error } = await supabase.from('study_plans').insert(planRows);
            if (error) throw error;
        }

        return { ok: true, mode: 'only_arkusze_topics_done', inserted: planRows.length };
    }

    const workingDaysForLearning = learningDates.length;
    if (workingDaysForLearning <= 0) {
        for (const d of arkuszDates) {
            planRows.push({
                user_id: userId,
                scheduled_date: toYMD(d),
                topic_name: 'Arkusze maturalne',
                activity_type: 'arkusz',
                description: 'Rozwiąż pełny arkusz maturalny z fizyki w warunkach zbliżonych do egzaminu.',
                is_completed: false
            });
        }

        if (planRows.length > 0) {
            const { error } = await supabase.from('study_plans').insert(planRows);
            if (error) throw error;
        }
        return { ok: true, mode: 'no_learning_days', inserted: planRows.length };
    }

    // Definicja kroków z wagami
    const STEPS = [
        { activity_type: 'video',  weight: 3, descPrefix: 'Obejrzyj lekcje wideo z działu ' },
        { activity_type: 'etap_1', weight: 1, descPrefix: 'Przerób Etap 1 (podstawy) z działu ' },
        { activity_type: 'etap_2', weight: 2, descPrefix: 'Przerób Etap 2 (zadania na średnim poziomie) z działu ' },
        { activity_type: 'etap_3', weight: 2, descPrefix: 'Przerób Etap 3 (zadania trudniejsze/maturalne) z działu ' }
    ];

    const UNITS_PER_TOPIC = 8; // 3 + 1 + 2 + 2
    const totalUnits = remainingTopics.length * UNITS_PER_TOPIC;

    const tasks = [];
    for (const topic of remainingTopics) {
        for (const step of STEPS) {
            tasks.push({
                topic_name: topic,
                activity_type: step.activity_type,
                weight: step.weight,
                description: step.descPrefix + topic
            });
        }
    }

    let cumulativeUnits = 0;
    const learningDaysCount = learningDates.length;

    for (const task of tasks) {
        cumulativeUnits += task.weight;
        let dayIndex = Math.floor((cumulativeUnits / totalUnits) * learningDaysCount) - 1;
        if (dayIndex < 0) dayIndex = 0;
        if (dayIndex >= learningDaysCount) dayIndex = learningDaysCount - 1;

        const d = learningDates[dayIndex];

        planRows.push({
            user_id: userId,
            scheduled_date: toYMD(d),
            topic_name: task.topic_name,
            activity_type: task.activity_type,
            description: task.description,
            is_completed: false
        });
    }

    // Dodaj okres arkuszy
    for (const d of arkuszDates) {
        planRows.push({
            user_id: userId,
            scheduled_date: toYMD(d),
            topic_name: 'Arkusze maturalne',
            activity_type: 'arkusz',
            description: 'Rozwiąż pełny arkusz maturalny z fizyki w warunkach zbliżonych do egzaminu.',
            is_completed: false
        });
    }

    if (planRows.length > 0) {
        const { error } = await supabase.from('study_plans').insert(planRows);
        if (error) throw error;
    }

    return { ok: true, mode: 'full_plan', inserted: planRows.length };
}

/**
 * Główna funkcja widoku planu w lekcji „planer”.
 * Jeśli plan nie istnieje -> wyświetla formularz konfiguracji.
 * Jeśli istnieje -> renderuje tabelę planu + przycisk resetu.
 *
 * @param {HTMLElement} container
 */
async function renderStudyPlanInLesson(container) {
    if (!currentUser) {
        container.innerHTML = `
            <p>Musisz być zalogowany, aby wygenerować swój plan nauki.</p>
            <button class="btn btn-gradient" onclick="showSection('login')">Zaloguj się</button>
        `;
        return;
    }

    container.innerHTML = '<p>Ładuję Twój plan nauki...</p>';

    const { data: rows, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('scheduled_date', { ascending: true });

    if (error) {
        console.error('Błąd pobierania planu nauki:', error);
        container.innerHTML = '<p style="color:#ef4444;">Nie udało się pobrać planu nauki.</p>';
        return;
    }

    if (!rows || rows.length === 0) {
        renderConfigurationForm(container);
    } else {
        renderPlan(container, rows);
    }
}

/**
 * Formularz konfiguracji planu: lista checkboxów „Co już umiesz?”
 * i przycisk „Generuj plan”.
 *
 * @param {HTMLElement} container
 */
function renderConfigurationForm(container) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '720px';
    wrapper.style.margin = '0 auto';

    const heading = document.createElement('h2');
    heading.textContent = 'Skonfiguruj swój plan nauki';
    heading.style.marginBottom = '0.75rem';
    wrapper.appendChild(heading);

    const sub = document.createElement('p');
    sub.textContent = 'Zaznacz działy, które masz już ogarnięte. Resztę rozplanujemy za Ciebie aż do matury.';
    sub.style.marginBottom = '1.5rem';
    wrapper.appendChild(sub);

    const form = document.createElement('form');
    form.id = 'studyPlanConfigForm';

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    grid.style.gap = '0.75rem 1.5rem';

    STUDY_TOPICS.forEach((topic, index) => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '0.6rem';
        label.style.cursor = 'pointer';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'completedTopics';
        input.value = topic;
        input.id = `topic-${index}`;

        const span = document.createElement('span');
        span.textContent = topic;

        label.appendChild(input);
        label.appendChild(span);
        grid.appendChild(label);
    });

    form.appendChild(grid);

    const actions = document.createElement('div');
    actions.style.marginTop = '1.8rem';
    actions.style.display = 'flex';
    actions.style.gap = '1rem';
    actions.style.flexWrap = 'wrap';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-gradient';
    submitBtn.textContent = 'Generuj plan';

    actions.appendChild(submitBtn);
    form.appendChild(actions);
    wrapper.appendChild(form);
    container.appendChild(wrapper);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Musisz być zalogowany, aby wygenerować plan.');
            return;
        }

        const checked = Array.from(
            form.querySelectorAll('input[name="completedTopics"]:checked')
        ).map((el) => el.value);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Generuję plan...';

        try {
            await generateStudyPlan(currentUser.id, checked);
            const { data: newRows } = await supabase
                .from('study_plans')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('scheduled_date', { ascending: true });
            renderPlan(container, newRows || []);
        } catch (err) {
            console.error('Błąd generowania planu:', err);
            alert('Nie udało się wygenerować planu nauki.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generuj plan';
        }
    });
}

/**
 * Renderuje istniejący plan nauki + przycisk „Zresetuj plan”.
 *
 * @param {HTMLElement} container
 * @param {Array<any>} rows
 */
function renderPlan(container, rows) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '900px';
    wrapper.style.margin = '0 auto';

    const headerRow = document.createElement('div');
    headerRow.style.display = 'flex';
    headerRow.style.justifyContent = 'space-between';
    headerRow.style.alignItems = 'center';
    headerRow.style.marginBottom = '1rem';

    const heading = document.createElement('h2');
    heading.textContent = 'Twój plan nauki do matury';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-outline2';
    resetBtn.textContent = 'Zresetuj plan';
    resetBtn.onclick = async () => {
        if (!currentUser) return;
        const ok = window.confirm('Na pewno chcesz usunąć swój plan nauki i zacząć od nowa?');
        if (!ok) return;
        await supabase.from('study_plans').delete().eq('user_id', currentUser.id);
        renderConfigurationForm(container);
    };

    headerRow.appendChild(heading);
    headerRow.appendChild(resetBtn);
    wrapper.appendChild(headerRow);

    // Karty zamiast tabeli – lepsze na mobile + checkboxy
    let html = '';
    html += `<div class="planner-container" style="display: flex; flex-direction: column; gap: 10px; max-width: 800px; margin: 0 auto;">`;

    const planData = rows || [];

    planData.forEach((item) => {
        const dateObj = new Date(item.scheduled_date);
        const dateStr = dateObj.toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' });
        const dayName = dateObj.toLocaleDateString('pl-PL', { weekday: 'long' });

        const opacity = item.is_completed ? '0.5' : '1';
        const decoration = item.is_completed ? 'line-through' : 'none';
        const checkState = item.is_completed ? 'checked' : '';

        let typeColor = '#3b82f6';
        if (item.activity_type === 'video') typeColor = '#ec4899';
        if (item.activity_type === 'arkusz') typeColor = '#eab308';
        if (item.activity_type === 'wolne') typeColor = '#10b981';

        html += `
        <div class="plan-card" style="
            display: flex; 
            align-items: flex-start; 
            gap: 15px; 
            background: rgba(255, 255, 255, 0.03); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            border-radius: 12px; 
            padding: 16px; 
            transition: all 0.2s ease;
        ">
            <div style="padding-top: 4px;">
                <input type="checkbox" 
                       class="task-checkbox" 
                       data-id="${item.id}" 
                       ${checkState}
                       style="
                           width: 24px; 
                           height: 24px; 
                           cursor: pointer; 
                           accent-color: var(--magenta, #ec4899);
                       ">
            </div>

            <div class="plan-card-content" style="flex-grow: 1; opacity: ${opacity}; text-decoration: ${decoration}; transition: opacity 0.3s;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="font-weight: 700; color: #fff; font-size: 1.05rem;">
                        ${dateStr} <span style="font-weight: 400; color: #888; font-size: 0.9rem; text-transform: capitalize;">(${dayName})</span>
                    </span>
                    <span style="
                        background: ${typeColor}20; 
                        color: ${typeColor}; 
                        border: 1px solid ${typeColor}40; 
                        padding: 2px 8px; 
                        border-radius: 6px; 
                        font-size: 0.75rem; 
                        font-weight: 600; 
                        text-transform: uppercase;
                    ">
                        ${String(item.activity_type || '').replace('_', ' ')}
                    </span>
                </div>

                <div style="font-size: 1.05rem; font-weight: 600; color: #e2e8f0; margin-bottom: 4px;">
                    ${item.topic_name}
                </div>

                <div style="font-size: 0.9rem; color: #94a3b8; line-height: 1.4;">
                    ${item.description}
                </div>
            </div>
        </div>
        `;
    });

    html += `</div>`;

    const cardsContainer = document.createElement('div');
    cardsContainer.innerHTML = html;
    wrapper.appendChild(cardsContainer);
    container.appendChild(wrapper);

    // Obsługa kliknięć checkboxów (aktualizacja is_completed)
    const checkboxes = container.querySelectorAll('.task-checkbox');
    checkboxes.forEach((box) => {
        box.addEventListener('change', async (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
            const taskId = target.getAttribute('data-id');
            const isDone = target.checked;

            const card = target.closest('.plan-card');
            const contentDiv = card ? card.querySelector('.plan-card-content') : null;
            if (contentDiv) {
                contentDiv.style.opacity = isDone ? '0.5' : '1';
                contentDiv.style.textDecoration = isDone ? 'line-through' : 'none';
            }

            if (taskId) {
                try {
                    await supabase
                        .from('study_plans')
                        .update({ is_completed: isDone })
                        .eq('id', taskId);
                } catch (err) {
                    console.error('Błąd aktualizacji statusu zadania w planie:', err);
                }
            }
        });
    });
}

// Funkcja do wyświetlania zablokowanej listy filmów w podglądzie
async function loadVideosPreviewForCourse(course_id, videoListElement) {
    try {
        // Pobierz segmenty wideo z bazy danych dla danego kursu (kolumna video_id)
        const { data: segments, error } = await supabase
            .from('video_segments')
            .select('segment_id, tytul_segmentu, start_s, end_s')
            .eq('video_id', course_id)
            .order('segment_id', { ascending: true });
        
        if (error) {
            console.error('Błąd pobierania segmentów wideo:', error);
            videoListElement.innerHTML = '<p style="color: #888; padding: 1rem;">Brak lekcji wideo dla tego kursu</p>';
            return;
        }
        
        if (!segments || segments.length === 0) {
            videoListElement.innerHTML = '<p style="color: #888; padding: 1rem;">Brak lekcji wideo dla tego kursu</p>';
            return;
        }
        
        // Wyczyść listę
        videoListElement.innerHTML = '';
        
        // Utwórz elementy listy segmentów (zablokowane)
        segments.forEach((segment, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-list-item';
            videoItem.style.cssText = `
                padding: 1rem;
                margin-bottom: 0.5rem;
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                opacity: 0.6;
                cursor: not-allowed;
            `;
            
            // Numer lekcji i tytuł
            const videoNumber = document.createElement('div');
            videoNumber.style.cssText = `
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 0.25rem;
            `;
            videoNumber.textContent = `Lekcja ${index + 1}`;
            
            const videoTitle = document.createElement('div');
            videoTitle.style.cssText = `
                font-weight: 600;
                color: var(--black);
                font-size: 0.95rem;
            `;
            videoTitle.textContent = segment.tytul_segmentu || `Lekcja ${index + 1}`;
            
            videoItem.appendChild(videoNumber);
            videoItem.appendChild(videoTitle);
            
            videoListElement.appendChild(videoItem);
        });
        
    } catch (error) {
        console.error('Błąd podczas ładowania filmów w podglądzie:', error);
        videoListElement.innerHTML = '<p style="color: #888; padding: 1rem;">Brak filmów dla tego kursu</p>';
    }
}

// Funkcja do wyświetlania przykładowego zadania w podglądzie (zablokowane)
async function showPreviewTask(course_id, taskArea) {
    
    try {
        // Pobierz pierwsze zadanie z danego kursu (zawsze to samo)
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('course_id', course_id)
            .eq('is_active', true)
            .order('id', { ascending: true })
            .limit(1);
        
        if (error) {
            console.error('Błąd pobierania zadania do podglądu:', error);
            taskArea.innerHTML = '<p style="color: #888; text-align: center;">Błąd ładowania zadania</p>';
            return;
        }
        if (!tasks || tasks.length === 0) {
            taskArea.innerHTML = '<p style="color: #888; text-align: center;">Brak zadań w tym kursie</p>';
            return;
        }
        
        const task = tasks[0]; // Zawsze pierwsze zadanie
        
        // Pobierz zdjęcia dla tego zadania
        const { data: images } = await supabase
            .from('task_images')
            .select('image_url')
            .eq('task_id', task.id);
        
        // Stwórz kontener zadania
        const container = document.createElement('div');
        container.className = 'task-container';
        container.style.position = 'relative';
        
        // Dodaj overlay z informacją o braku dostępu
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 20px;
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            padding: 2rem;
        `;
        // Przyciski zależne od zalogowania
        let buyCourseBtn, buyAllBtn;
        if (!currentUser) {
            buyCourseBtn = `<a href="#" onclick="showSection('login');return false;" class="btn btn-gradient" style="font-size: 1.1rem; min-width: 220px;">Kup ten kurs</a>`;
            buyAllBtn = `<a href="#" onclick="showSection('login');return false;" class="btn btn-outline" style="font-size: 1.1rem; min-width: 220px;">Kup wszystkie materiały</a>`;
        } else {
            buyCourseBtn = `<a href="#" onclick="buyAccess('${course_id}');return false;" class="btn btn-gradient" style="font-size: 1.1rem; min-width: 220px;">Kup ten kurs</a>`;
            buyAllBtn = `<a href="#" onclick="buyAccess('full_access');return false;" class="btn btn-outline" style="font-size: 1.1rem; min-width: 220px;">Kup wszystkie materiały</a>`;
        }
        overlay.innerHTML = `
            <div>
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                <div>Zadania dostępne po zakupie kursu</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">To jest przykładowe zadanie z tego kursu</div>
                <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                    ${buyCourseBtn}
                    ${buyAllBtn}
                </div>
            </div>
        `;
        container.appendChild(overlay);
        
        // Treść zadania (pod overlayem)
        const content = document.createElement('div');
        content.className = 'task-content';
        content.innerHTML = DOMPurify.sanitize(task.content);
        container.appendChild(content);
        
        // Zdjęcia (jeśli są)
        if (images && images.length > 0) {
            images.forEach(img => {
                const image = document.createElement('img');
                image.src = img.image_url;
                image.className = 'task-image';
                image.alt = 'Ilustracja do zadania';
                container.appendChild(image);
            });
        }
        
        // Opcje odpowiedzi dla zadań typu 'closed' (w podglądzie - zablokowane)
        if (task.type === 'closed' && task.options) {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'task-options-container';
            optionsContainer.style.opacity = '0.5';
            optionsContainer.style.pointerEvents = 'none';
            
            const optionsTitle = document.createElement('h4');
            optionsTitle.textContent = 'Wybierz odpowiedź:';
            optionsTitle.style.marginBottom = '1rem';
            optionsTitle.style.color = 'var(--black)';
            optionsContainer.appendChild(optionsTitle);
            
            try {
                const options = typeof task.options === 'string' ? JSON.parse(task.options) : task.options;
                
                if (Array.isArray(options)) {
                    options.forEach((option, index) => {
                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'task-option';
                        optionDiv.style.cssText = `
                            padding: 0.8rem 1rem;
                            margin: 0.5rem 0;
                            background: rgba(248, 250, 252, 0.8);
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 1rem;
                            line-height: 1.5;
                            opacity: 0.5;
                        `;
                        
                        optionDiv.innerHTML = DOMPurify.sanitize(`<strong>${String.fromCharCode(65 + index)}.</strong> ${option}`);
                        optionsContainer.appendChild(optionDiv);
                    });
                }
            } catch (error) {
                console.error('Błąd parsowania opcji w podglądzie:', error);
                const errorDiv = document.createElement('div');
                errorDiv.textContent = 'Błąd ładowania opcji odpowiedzi';
                errorDiv.style.color = '#ef4444';
                optionsContainer.appendChild(errorDiv);
            }
            
            container.appendChild(optionsContainer);
        }
        
        // Przycisk pokaż odpowiedź (zablokowany)
        const showAnswerBtn = document.createElement('button');
        showAnswerBtn.textContent = '👁️ Pokaż odpowiedź';
        showAnswerBtn.className = 'show-answer-btn';
        showAnswerBtn.disabled = true;
        showAnswerBtn.style.opacity = '0.5';
        showAnswerBtn.style.cursor = 'not-allowed';
        
        const answerDiv = document.createElement('div');
        answerDiv.className = 'task-answer';
        answerDiv.style.display = 'none';
        answerDiv.innerHTML = DOMPurify.sanitize(processSolutionText(task.solution));
        
        showAnswerBtn.onclick = () => {
            // Nie rób nic - przycisk jest zablokowany
        };
        
        container.appendChild(showAnswerBtn);
        container.appendChild(answerDiv);
        
        // Trzy przyciski do oceny (zablokowane)
        const btnGroup = document.createElement('div');
        btnGroup.className = 'task-buttons-container';
        
        const buttons = [
            { 
                label: 'Dobrze', 
                value: 'good', 
                className: 'task-btn task-btn-good',
                icon: '✅'
            },
            { 
                label: 'Źle', 
                value: 'bad', 
                className: 'task-btn task-btn-bad',
                icon: '❌'
            },
            { 
                label: 'Pomiń', 
                value: 'skip', 
                className: 'task-btn task-btn-skip',
                icon: '⏭️'
            }
        ];
        
        buttons.forEach(({ label, value, className, icon }) => {
            const btn = document.createElement('button');
            btn.className = className;
            btn.innerHTML = `<span class="task-btn-icon">${icon}</span>${label}`;
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            
            btn.onclick = () => {
                // Nie rób nic - przycisk jest zablokowany
            };
            
            btnGroup.appendChild(btn);
        });
        
        container.appendChild(btnGroup);
        
        // Wyczyść taskArea i dodaj kontener
        taskArea.innerHTML = '';
        taskArea.appendChild(container);
        
    } catch (error) {
        console.error('Błąd podczas wyświetlania zadania podglądu:', error);
        taskArea.innerHTML = '<p style="color: #888; text-align: center;">Błąd ładowania zadania</p>';
    }
}

// Funkcja do sprawdzania czy tekst jest linkiem do obrazka i zamiany na tag img
function processSolutionText(text) {
    // Sprawdź czy tekst wygląda jak link do obrazka (rozszerzenia: jpg, jpeg, png, gif, webp)
    const imageUrlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi;
    
    if (imageUrlRegex.test(text)) {
        // Zamień link na tag img z wyśrodkowaniem i nową linią
        return text.replace(imageUrlRegex, '<br><div style="text-align: center; margin: 15px 0;"><img src="$1" alt="Odpowiedź" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div><br>');
    }
    
    return text;
}

// Nadpisz renderDashboard, by używał nowego panelu
function renderDashboard() {
    renderDashboardPanel();
    // Aktualizuj breadcrumbs po załadowaniu dashboard
    updateBreadcrumbs('dashboard');
}

// Dodaj renderDashboard do window aby był dostępny globalnie
window.renderDashboard = renderDashboard;

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

// Dodaj funkcje breadcrumbs do globalnego scope
window.updateBreadcrumbs = updateBreadcrumbs;
window.updateDashboardBreadcrumbs = updateDashboardBreadcrumbs; 