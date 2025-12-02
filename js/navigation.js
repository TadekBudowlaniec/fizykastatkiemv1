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
    // Zamiast wideo - szary placeholder
    document.getElementById('subjectVideo').outerHTML = '<div id="subjectVideo" class="video-frame" style="background:#e5e5e5;display:flex;align-items:center;justify-content:center;color:#888;font-size:1.2rem;">Wideo dostępne po zakupie</div>';
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
    
    console.log('renderDashboardPanel - subjects:', window.subjects);
    console.log('renderDashboardPanel - Object.entries(subjects):', Object.entries(window.subjects));
    
    sidebar.innerHTML = '';
    let firstKey = null;
    Object.entries(window.subjects).forEach(([key, subject], idx) => {
        if (!firstKey) firstKey = key;
        console.log('Tworzenie elementu dla kursu:', key, subject.title);
        
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
    
    // Optional: select first course by default
    if (firstKey) {
        sidebar.querySelector('.course-list-item')?.click();
    }
}

function renderCoursePreview(subjectKey, main) {
    // Usuń sprawdzenie logowania - pozwól niezalogowanym przeglądać kursy
    const subject = window.subjects[subjectKey];
    if (!subject) return;
    main.innerHTML = '';
    
    // Tytuł
    const title = document.createElement('h2');
    title.textContent = subject.title + ' (Podgląd)';
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
        { title: 'Etap 2', icon: '🔬', description: 'Rozszerzone zagadnienia' },
        { title: 'Etap 3', icon: '🚀', description: 'Zaawansowane tematy' }
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
        
        // Special handling for "Praca moc energia" (course 3)
        if (parseInt(subjectKey) === 3) {
            card.onclick = () => alert('zadania maturalne z tego działu są wplecione w inne działy fizyki');
        } else {
            // Dla pozostałych kursów - sprawdź czy użytkownik ma dostęp
            const hasAccess = currentUser && hasAccessToCourse(subjectKey);
            
            if (hasAccess) {
                // Użytkownik ma dostęp - sprawdź który etap
                if (stage.title === 'Etap 1') {
                    // Etap 1 - otwórz rzeczywisty PDF
                    card.style.opacity = '1';
                    card.style.cursor = 'pointer';
                    card.onclick = () => {
                        if (subject.pdfUrlEtap1) {
                            window.open(subject.pdfUrlEtap1, '_blank');
                        } else {
                            alert('PDF niedostępny dla tego działu.');
                        }
                    };
                } else if (stage.title === 'Etap 3') {
                    // Etap 3 - otwórz rzeczywisty PDF
                    card.style.opacity = '1';
                    card.style.cursor = 'pointer';
                    card.onclick = () => {
                        if (subject.pdfUrl) {
                            window.open(subject.pdfUrl, '_blank');
                        } else {
                            alert('PDF niedostępny dla tego działu.');
                        }
                    };
                } else {
                    // Etap 2 - informacja o tym, że linki będą dodane
                    card.style.opacity = '0.6';
                    card.style.cursor = 'not-allowed';
                    card.onclick = () => alert(`Linki do ${stage.title} zostaną dodane wkrótce`);
                }
            } else {
                // Użytkownik nie ma dostępu - zablokuj wszystkie etapy
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
        { title: 'Etap 2', icon: '🔬', description: 'Rozszerzone zagadnienia' },
        { title: 'Etap 3', icon: '🚀', description: 'Zaawansowane tematy' }
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
        
        // Special handling for "Praca moc energia" (course 3)
        if (parseInt(subjectKey) === 3) {
            card.style.opacity = '0.6';
            card.style.cursor = 'not-allowed';
            card.onclick = () => alert('zadania maturalne z tego działu są wplecione w inne działy fizyki');
        } else {
            // Dla pozostałych kursów
            if (hasAccess) {
                // Użytkownik ma dostęp - sprawdź który etap
                if (stage.title === 'Etap 1') {
                    // Etap 1 - otwórz rzeczywisty PDF
                    card.style.cursor = 'pointer';
                    card.onclick = () => {
                        if (subject.pdfUrlEtap1) {
                            window.open(subject.pdfUrlEtap1, '_blank');
                        } else {
                            alert('PDF niedostępny dla tego działu.');
                        }
                    };
                } else if (stage.title === 'Etap 3') {
                    // Etap 3 - otwórz rzeczywisty PDF
                    card.style.cursor = 'pointer';
                    card.onclick = () => {
                        if (subject.pdfUrl) {
                            window.open(subject.pdfUrl, '_blank');
                        } else {
                            alert('PDF niedostępny dla tego działu.');
                        }
                    };
                } else {
                    // Etap 2 - informacja o tym, że linki będą dodane
                    card.style.opacity = '0.6';
                    card.style.cursor = 'not-allowed';
                    card.onclick = () => alert(`Linki do ${stage.title} zostaną dodane wkrótce`);
                }
            } else {
                // Użytkownik nie ma dostępu - zablokuj wszystkie etapy
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
    console.log('Link do kursu:', subject.paymentLink);
    console.log('Link do wszystkich materiałów:', window.paymentLinkAllMaterials);
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
    // Dodaj wyświetlanie zadania z bazy dla danego kursu
    if (window.showRandomTaskForCourse) {
        showRandomTaskForCourse(course_id);
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
    console.log('showPreviewTask wywołane, course_id:', course_id);
    
    try {
        // Pobierz pierwsze zadanie z danego kursu (zawsze to samo)
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('course_id', course_id)
            .eq('is_active', true)
            .order('id', { ascending: true })
            .limit(1);
        
        console.log('Pobrane zadanie do podglądu:', tasks, 'error:', error);
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
        content.innerHTML = task.content;
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
                        
                        optionDiv.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> ${option}`;
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
        answerDiv.innerHTML = processSolutionText(task.solution);
        
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