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
    if (!hasAccessToCourse(course_id)) {
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
    
    // Szary placeholder zamiast wideo
    const video = document.createElement('div');
    video.className = 'video-frame';
    video.style = 'background:#e5e5e5;display:flex;align-items:center;justify-content:center;color:#888;font-size:1.2rem;min-height:220px;margin-bottom:1.5rem;';
    video.textContent = 'Wideo dostępne po zakupie';
    main.appendChild(video);
    
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
            // Dla pozostałych kursów
            if (currentUser && hasAccessToCourse(parseInt(subjectKey))) {
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
    // Tytuł
    const title = document.createElement('h2');
    title.textContent = subject.title;
    main.appendChild(title);
    // Wideo
    const video = document.createElement('iframe');
    video.className = 'video-frame';
    video.src = `https://www.youtube.com/embed/${subject.videoId}`;
    video.title = 'Kurs Fizyki';
    video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    video.allowFullscreen = true;
    video.style = 'width:100%;min-height:220px;margin-bottom:1.5rem;';
    main.appendChild(video);
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
        const hasAccess = currentUser && hasAccessToCourse(parseInt(subjectKey));
        
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
    const course_id = parseInt(subjectKey);
    // Pokazuj przyciski kupna tylko jeśli użytkownik nie ma dostępu do kursu
    if (!hasAccessToCourse(course_id)) {
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