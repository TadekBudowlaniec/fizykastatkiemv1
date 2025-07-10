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
    console.log('showSubject wywołane, subjectKey:', subjectKey);
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
    // Dodaj wyświetlanie zadania z bazy dla danego kursu
    if (window.showRandomTaskForCourse) {
        console.log('Wywołuję showRandomTaskForCourse z subjectKey:', subjectKey);
        showRandomTaskForCourse(subjectKey);
    }
}

function showSubjectPreview(subjectKey) {
    const subject = subjects[subjectKey];
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
    showSection('subject');
}

function renderDashboardPanel() {
    const sidebar = document.getElementById('dashboardSidebar');
    const main = document.getElementById('dashboardMain');
    if (!sidebar || !main) return;
    sidebar.innerHTML = '';
    let firstKey = null;
    Object.entries(subjects).forEach(([key, subject], idx) => {
        if (!firstKey) firstKey = key;
        const hasAccess = hasAccessToCourse(key);
        const item = document.createElement('button');
        item.className = 'course-list-item';
        item.innerHTML = `<span>${subject.title}</span>` + (hasAccess ? '' : '<span class="lock" title="Brak dostępu">🔒</span>');
        item.onclick = () => {
            // Remove active from all
            sidebar.querySelectorAll('.course-list-item').forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            // Render preview or full view
            if (hasAccess) {
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
    const subject = subjects[subjectKey];
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
    // PDF - lista bez pobierania
    const pdfSection = document.createElement('div');
    let html = '<h3>Materiały PDF</h3><ul class="pdf-list">';
    subject.pdfs.forEach(pdf => {
        html += `<li class="pdf-item"><span>📄 ${pdf.charAt(0).toUpperCase() + pdf.slice(1)}</span> <span style="color:#aaa;font-size:0.95em;">(dostęp po zakupie)</span></li>`;
    });
    html += '</ul>';
    pdfSection.innerHTML = html;
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
}

function renderCourseFullView(subjectKey, main) {
    const subject = subjects[subjectKey];
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
    // PDF - lista z pobieraniem
    const pdfSection = document.createElement('div');
    let html = '<h3>Materiały PDF</h3><ul class="pdf-list">';
    subject.pdfs.forEach(pdf => {
        html += `<li class="pdf-item"><span>📄 ${pdf.charAt(0).toUpperCase() + pdf.slice(1)}</span></li>`;
    });
    html += '</ul>';
    pdfSection.innerHTML = html;
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
        window.showRandomTaskForCourse(subjectKey);
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
        // Mapowanie course_id na nazwy kursów dla linków Stripe
        const courseNameMapping = {
            1: 'mechanika', // Kinematyka -> mechanika
            2: 'mechanika', // Dynamika -> mechanika
            3: 'mechanika', // Praca moc energia -> mechanika
            4: 'mechanika', // Bryła sztywna -> mechanika
            5: 'mechanika', // Ruch drgający -> mechanika
            6: 'mechanika', // Fale mechaniczne -> mechanika
            7: 'mechanika', // Hydrostatyka -> mechanika
            8: 'termodynamika',
            9: 'mechanika', // Grawitacja -> mechanika
            10: 'elektromagnetyzm', // Elektrostatyka -> elektromagnetyzm
            11: 'elektromagnetyzm', // Prąd elektryczny -> elektromagnetyzm
            12: 'elektromagnetyzm', // Magnetyzm -> elektromagnetyzm
            13: 'elektromagnetyzm', // Indukcja -> elektromagnetyzm
            14: 'optyka', // Fale elektromagnetyczne i optyka -> optyka
            15: 'atomowa', // Fizyka atomowa -> atomowa
            16: 'jadrowa' // Fizyka jądrowa -> jadrowa
        };
        
        // Wybierz odpowiedni kurs dla linku płatności
        const courseName = courseNameMapping[course_id] || 'termodynamika'; // domyślnie termodynamika
        
        overlay.innerHTML = `
            <div>
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                <div>Zadania dostępne po zakupie kursu</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">To jest przykładowe zadanie z tego kursu</div>
                <button class="btn btn-gradient" style="margin-top: 1.5rem; padding: 0.8rem 2rem; font-size: 1.1rem; border-radius: 30px; box-shadow: 0 4px 15px rgba(255, 0, 128, 0.3);" onclick="buyAccess('${courseName}')">
                    💳 Kup teraz
                </button>
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
        answerDiv.innerHTML = task.solution;
        
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

// Nadpisz renderDashboard, by używał nowego panelu
function renderDashboard() {
    renderDashboardPanel();
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