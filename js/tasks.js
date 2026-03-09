// tasks.js

// Wyświetl losowe zadanie z danego kursu (course_id)
async function showRandomTaskForCourse(course_id, forceReset = false) {
    // Sprawdź czy użytkownik jest zalogowany
    if (!currentUser) {
        alert('Musisz być zalogowany, aby rozwiązywać zadania.');
        return;
    }
    
    if (course_id === null || course_id === undefined || course_id === '') {
        alert('Błąd: Brak identyfikatora kursu.');
        return;
    }
    
    // Kurs "tutaj zacznij" (course_id = 0) nie ma zadań
    if (course_id === 0 || course_id === '0') {
        return;
    }
    
    // Pobierz wszystkie zadania z kursu
    const { data: allTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('course_id', course_id)
        .eq('is_active', true)
        .order('id', { ascending: true });
    
    if (error) {
        alert('Błąd pobierania zadań: ' + error.message);
        return;
    }
    if (!allTasks || allTasks.length === 0) {
        alert('Brak zadań dla tego kursu.');
        return;
    }
    
    // Jeśli forceReset = true, rozpocznij test od nowa bez sprawdzania postępu
    if (forceReset) {
        const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
        showTaskWithControls(randomTask.id, course_id);
        return;
    }
    
    // Pobierz postęp użytkownika dla wszystkich zadań
    const { data: userProgress, error: progressError } = await supabase
        .from('user_tasks')
        .select('task_id, status')
        .eq('user_id', currentUser.id)
        .in('task_id', allTasks.map(t => t.id));
    
    if (progressError) {
        console.error('Błąd pobierania postępu:', progressError);
    }
    
    // Sprawdź czy wszystkie zadania zostały rozwiązane
    const completedTaskIds = userProgress ? userProgress.map(p => p.task_id) : [];
    const skippedTaskIds = userProgress ? userProgress.filter(p => p.status === 'skip').map(p => p.task_id) : [];
    const allCompleted = completedTaskIds.length === allTasks.length;
    
    if (allCompleted) {
        // Wszystkie zadania rozwiązane - sprawdź czy są pominięte
        if (skippedTaskIds.length > 0) {
            // Wyświetl pominięte zadania
            const randomSkippedTask = allTasks.find(t => skippedTaskIds.includes(t.id));
            if (randomSkippedTask) {
                showTaskWithControls(randomSkippedTask.id, course_id);
                return;
            }
        } else {
            // Wszystkie zadania rozwiązane (bez pominiętych) - pokaż podsumowanie
            showTestSummary(course_id, userProgress, allTasks.length);
            return;
        }
    }
    
    // Wybierz losowe zadanie z nierozwiązanych
    const unsolvedTasks = allTasks.filter(task => !completedTaskIds.includes(task.id));
    
    if (unsolvedTasks.length === 0) {
        // Wszystkie zadania rozwiązane - pokaż podsumowanie
        showTestSummary(course_id, userProgress, allTasks.length);
        return;
    }
    
    const randomTask = unsolvedTasks[Math.floor(Math.random() * unsolvedTasks.length)];
    showTaskWithControls(randomTask.id, course_id);
}

// Wyświetl zadanie z przyciskami i zdjęciami
async function showTaskWithControls(taskId, course_id) {
    // Sprawdź czy użytkownik jest zalogowany
    if (!currentUser) {
        alert('Musisz być zalogowany, aby rozwiązywać zadania.');
        return;
    }
    
    // Pobierz zadanie z bazy
    const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
    
    if (taskError || !task) {
        alert('Nie udało się pobrać zadania.');
        return;
    }
    
    // Pobierz zdjęcia (może być pusta lista)
    const { data: images } = await supabase
        .from('task_images')
        .select('image_url')
        .eq('task_id', taskId);
    
    // Pobierz postęp użytkownika dla tego zadania
    const { data: userProgress, error: progressError } = await supabase
        .from('user_tasks')
        .select('status')
        .eq('user_id', currentUser.id)
        .eq('task_id', taskId)
        .single();
    
    if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Błąd pobierania postępu użytkownika:', progressError);
    }
    
    // Stwórz kontener zadania
    const container = document.createElement('div');
    container.className = 'task-container';
    
    // Dodaj wskaźnik postępu
    const progressIndicator = await createProgressIndicator(course_id);
    container.appendChild(progressIndicator);
    
    // Treść zadania
    const content = document.createElement('div');
    content.className = 'task-content';
    content.innerHTML = DOMPurify.sanitize(task.content);
    container.appendChild(content);
    
    // Zdjęcia (jeśli są) — wyświetl w jednym rzędzie, jeśli jest miejsce (z zawijaniem)
    if (images && images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'task-images';
        images.forEach(img => {
            const image = document.createElement('img');
            image.src = img.image_url;
            image.className = 'task-image';
            image.alt = 'Ilustracja do zadania';
            imagesContainer.appendChild(image);
        });
        container.appendChild(imagesContainer);
    }
    
    // Opcje odpowiedzi dla zadań typu 'closed'
    if (task.type === 'closed' && task.options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'task-options-container';
        
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
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-size: 1rem;
                        line-height: 1.5;
                    `;
                    
                    optionDiv.innerHTML = DOMPurify.sanitize(`<strong>${String.fromCharCode(65 + index)}.</strong> ${option}`);
                    
                    optionDiv.addEventListener('mouseenter', () => {
                        if (!optionsContainer.classList.contains('answered')) {
                            optionDiv.style.background = 'rgba(255, 0, 128, 0.1)';
                            optionDiv.style.borderColor = 'var(--magenta)';
                        }
                    });
                    
                    optionDiv.addEventListener('mouseleave', () => {
                        if (!optionsContainer.classList.contains('answered')) {
                            optionDiv.style.background = 'rgba(248, 250, 252, 0.8)';
                            optionDiv.style.borderColor = '#e2e8f0';
                        }
                    });
                    
                    optionDiv.addEventListener('click', async () => {
                        if (optionsContainer.classList.contains('answered')) return;
                        optionsContainer.classList.add('answered');
                        
                        // Sprawdź poprawność odpowiedzi (A=0, B=1, C=2, D=3)
                        let correctIndex = 0;
                        if (typeof task.solution === 'string') {
                            if (task.solution.toUpperCase() === 'A') correctIndex = 0;
                            else if (task.solution.toUpperCase() === 'B') correctIndex = 1;
                            else if (task.solution.toUpperCase() === 'C') correctIndex = 2;
                            else if (task.solution.toUpperCase() === 'D') correctIndex = 3;
                            else if (!isNaN(Number(task.solution))) correctIndex = Number(task.solution);
                        } else if (typeof task.solution === 'number') {
                            correctIndex = task.solution;
                        }
                        
                        const isCorrect = (index === correctIndex);
                        
                        // Podświetl wszystkie opcje - wybraną i poprawną
                        optionsContainer.querySelectorAll('.task-option').forEach((opt, idx) => {
                            if (idx === index) {
                                // Wybrana przez użytkownika
                                if (isCorrect) {
                                    opt.style.background = 'rgba(0, 255, 128, 0.15)';
                                    opt.style.borderColor = 'green';
                                    opt.style.fontWeight = '600';
                                    opt.innerHTML += ' <span style="color:green;font-weight:bold;">✔️</span>';
                                } else {
                                    opt.style.background = 'rgba(255, 0, 0, 0.12)';
                                    opt.style.borderColor = 'red';
                                    opt.style.fontWeight = '600';
                                    opt.innerHTML += ' <span style="color:red;font-weight:bold;">❌</span>';
                                }
                            } else if (idx === correctIndex) {
                                // Poprawna odpowiedź (jeśli inna niż wybrana)
                                opt.style.background = 'rgba(0, 255, 128, 0.15)';
                                opt.style.borderColor = 'green';
                                opt.style.fontWeight = '600';
                                opt.innerHTML += ' <span style="color:green;font-weight:bold;">✔️</span>';
                            }
                        });
                        
                        // Zapisz wynik do bazy
                        const status = isCorrect ? 'good' : 'bad';
                        let saveData = {
                            user_id: currentUser.id,
                            task_id: taskId,
                            status,
                            completed_at: new Date().toISOString()
                        };
                        let { data, error } = await supabase
                            .from('user_tasks')
                            .upsert(saveData);
                        if (error && error.code === 'PGRST204' && error.message.includes('completed_at')) {
                            saveData = {
                                user_id: currentUser.id,
                                task_id: taskId,
                                status
                            };
                            await supabase
                                .from('user_tasks')
                                .upsert(saveData);
                        }
                        
                        // Zmień przycisk "Pomiń" na "Dalej" - szukaj w całym kontenerze zadania
                        const skipBtn = container.querySelector('.task-btn-skip');
                        if (skipBtn) {
                            skipBtn.innerHTML = '<span class="task-btn-icon">➡️</span> Dalej';
                            skipBtn.className = 'task-btn task-btn-next';
                            skipBtn.onclick = () => {
                                // Przejdź do kolejnego zadania bez zapisywania statusu "skip"
                                setTimeout(() => {
                                    if (course_id) {
                                        showRandomTaskForCourse(course_id);
                                    }
                                }, 500);
                            };
                        }
                    });
                    
                    optionsContainer.appendChild(optionDiv);
                });
            }
        } catch (error) {
            console.error('Błąd parsowania opcji:', error);
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'Błąd ładowania opcji odpowiedzi';
            errorDiv.style.color = '#ef4444';
            optionsContainer.appendChild(errorDiv);
        }
        
        container.appendChild(optionsContainer);
    }
    
    // Przycisk pokaż odpowiedź (tylko dla zadań otwartych)
    if (task.type !== 'closed') {
    const showAnswerBtn = document.createElement('button');
    showAnswerBtn.textContent = '👁️ Pokaż odpowiedź';
    showAnswerBtn.className = 'show-answer-btn';
    
    const answerDiv = document.createElement('div');
    answerDiv.className = 'task-answer';
    answerDiv.style.display = 'none';
        answerDiv.innerHTML = DOMPurify.sanitize(processSolutionText(task.solution));
    
    showAnswerBtn.onclick = () => {
        answerDiv.style.display = 'block';
        showAnswerBtn.style.display = 'none';
    };
    
    container.appendChild(showAnswerBtn);
    container.appendChild(answerDiv);
    }
    
    // Przyciski do oceny (tylko dla zadań otwartych)
    if (task.type !== 'closed') {
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
        btn.innerHTML = `<span class="task-btn-icon">${icon}</span> ${label}`;
        btn.className = className;
        
        // Sprawdź czy użytkownik już odpowiedział na to zadanie
        if (userProgress && userProgress.status === value) {
            btn.style.opacity = '0.6';
            btn.disabled = true;
            btn.innerHTML += ' (Wybrane)';
        }
        
        btn.onclick = async () => {
            // Dodaj klasę clicked dla natychmiastowej informacji zwrotnej
            btn.classList.add('clicked');
            
            // Wyłącz wszystkie przyciski podczas zapisu
            const allButtons = btnGroup.querySelectorAll('button');
            allButtons.forEach(b => {
                b.disabled = true;
                b.style.opacity = '0.6';
            });
            
            // Pokaż animację ładowania z nową klasą CSS
            btn.innerHTML = '<span class="task-btn-icon">⏳</span> Zapisywanie...';
            btn.classList.remove('clicked');
            btn.classList.add('saving');
            
            try {
                // Wyślij wynik do bazy (tabela user_tasks)
                // Najpierw spróbuj z completed_at
                let saveData = {
                    user_id: currentUser.id,
                    task_id: taskId,
                    status: value,
                    completed_at: new Date().toISOString()
                };
                
                let { data, error } = await supabase
                    .from('user_tasks')
                    .upsert(saveData);
                
                // Jeśli błąd związany z kolumną completed_at, spróbuj bez niej
                if (error && error.code === 'PGRST204' && error.message.includes('completed_at')) {
                    saveData = {
                        user_id: currentUser.id,
                        task_id: taskId,
                        status: value
                    };
                    
                    const result = await supabase
                        .from('user_tasks')
                        .upsert(saveData);
                    
                    data = result.data;
                    error = result.error;
                }
                
                if (error) {
                    alert('Błąd zapisu odpowiedzi: ' + error.message);
                    
                    // Przywróć przyciski w przypadku błędu
                    btn.classList.remove('saving');
                    allButtons.forEach(b => {
                        b.disabled = false;
                        b.style.opacity = '1';
                    });
                    return;
                }
                
                // Pokaż potwierdzenie z nową klasą CSS
                btn.classList.remove('saving');
                btn.classList.add('success');
                btn.innerHTML = `<span class="task-btn-icon">${icon}</span> ${label} ✓`;
                
                // Krótkie opóźnienie przed przejściem do następnego zadania
                setTimeout(() => {
                    if (course_id) {
                        showRandomTaskForCourse(course_id);
                    }
                }, 1000);
                
            } catch (err) {
                alert('Wystąpił błąd podczas zapisywania odpowiedzi: ' + err.message);
                
                // Przywróć przyciski w przypadku błędu
                btn.classList.remove('saving');
                allButtons.forEach(b => {
                    b.disabled = false;
                    b.style.opacity = '1';
                });
            }
        };
        
        btnGroup.appendChild(btn);
    });
    
    container.appendChild(btnGroup);
    } else {
        // Dla zadań zamkniętych - tylko przycisk pomiń
        const btnGroup = document.createElement('div');
        btnGroup.className = 'task-buttons-container';
        const skipBtn = document.createElement('button');
        skipBtn.innerHTML = '<span class="task-btn-icon">⏭️</span> Pomiń';
        skipBtn.className = 'task-btn task-btn-skip';
        if (userProgress && userProgress.status === 'skip') {
            skipBtn.style.opacity = '0.6';
            skipBtn.disabled = true;
            skipBtn.innerHTML += ' (Wybrane)';
        }
        skipBtn.onclick = async () => {
            skipBtn.disabled = true;
            skipBtn.style.opacity = '0.6';
            skipBtn.innerHTML = '<span class="task-btn-icon">⏳</span> Zapisywanie...';
            try {
                let saveData = {
                    user_id: currentUser.id,
                    task_id: taskId,
                    status: 'skip',
                    completed_at: new Date().toISOString()
                };
                let { data, error } = await supabase
                    .from('user_tasks')
                    .upsert(saveData);
                if (error && error.code === 'PGRST204' && error.message.includes('completed_at')) {
                    saveData = {
                        user_id: currentUser.id,
                        task_id: taskId,
                        status: 'skip'
                    };
                    await supabase
                        .from('user_tasks')
                        .upsert(saveData);
                }
                
                // Przejdź do kolejnego zadania po krótkim opóźnieniu
                setTimeout(() => {
                    if (course_id) {
                        showRandomTaskForCourse(course_id);
                    }
                }, 1000);
                
            } catch (e) {
                console.error('Błąd podczas zapisywania:', e);
                skipBtn.disabled = false;
                skipBtn.style.opacity = '1';
                skipBtn.innerHTML = '<span class="task-btn-icon">⏭️</span> Pomiń';
            }
        };
        btnGroup.appendChild(skipBtn);
        container.appendChild(btnGroup);
    }
    
    // Wyświetl zadanie w wybranym miejscu na stronie
    const area = document.getElementById('taskArea');
    if (area) {
        area.innerHTML = '';
        area.appendChild(container);
    } else {
        console.warn('Nie znaleziono #taskArea!');
    }
}

// Funkcja do tworzenia wskaźnika postępu
async function createProgressIndicator(course_id) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'task-progress-indicator';
    
    try {
        // Sprawdź czy użytkownik jest zalogowany
        if (!currentUser) {
            progressContainer.textContent = 'Zaloguj się, aby śledzić postęp';
            return progressContainer;
        }
        
        // Pobierz wszystkie zadania z kursu
        const { data: allTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id')
            .eq('course_id', course_id)
            .eq('is_active', true);
        
        if (tasksError) {
            console.error('Błąd pobierania zadań dla postępu:', tasksError);
            progressContainer.textContent = 'Błąd ładowania postępu';
            return progressContainer;
        }
        
        if (!allTasks || allTasks.length === 0) {
            progressContainer.textContent = 'Brak zadań w tym kursie';
            return progressContainer;
        }
        
        // Pobierz ukończone zadania użytkownika
        const { data: completedTasks, error: progressError } = await supabase
            .from('user_tasks')
            .select('task_id')
            .eq('user_id', currentUser.id)
            .in('task_id', allTasks.map(t => t.id));
        
        if (progressError) {
            console.error('Błąd pobierania postępu użytkownika:', progressError);
        }
        
        const totalTasks = allTasks.length;
        const completedCount = completedTasks ? completedTasks.length : 0;
        const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
        
        const progressText = document.createElement('div');
        progressText.className = 'task-progress-text';
        progressText.textContent = `Postęp: ${completedCount}/${totalTasks} zadań (${Math.round(progressPercentage)}%)`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'task-progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'task-progress-fill';
        progressFill.style.width = `${progressPercentage}%`;
        
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressText);
        progressContainer.appendChild(progressBar);
        
    } catch (error) {
        console.error('Błąd podczas pobierania postępu:', error);
        progressContainer.textContent = 'Postęp: Ładowanie...';
    }
    
    return progressContainer;
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

// Funkcja wyświetlająca podsumowanie testu
async function showTestSummary(course_id, userProgress, totalTasks) {
    const area = document.getElementById('taskArea');
    if (!area) return;
    
    // Oblicz statystyki
    const goodCount = userProgress ? userProgress.filter(p => p.status === 'good').length : 0;
    const badCount = userProgress ? userProgress.filter(p => p.status === 'bad').length : 0;
    const skipCount = userProgress ? userProgress.filter(p => p.status === 'skip').length : 0;
    const totalCompleted = goodCount + badCount + skipCount;
    
    const container = document.createElement('div');
    container.className = 'task-container';
    container.style.textAlign = 'center';
    container.style.padding = '2rem';
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'test-summary';
    summaryDiv.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        max-width: 600px;
        margin: 0 auto;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '🎉 Test zakończony!';
    title.style.cssText = `
        color: var(--magenta);
        margin-bottom: 1.5rem;
        font-size: 2rem;
    `;
    
    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
    `;
    
    const stats = [
        { label: 'Rozwiązane dobrze', count: goodCount, color: '#10b981', icon: '✅' },
        { label: 'Rozwiązane źle', count: badCount, color: '#ef4444', icon: '❌' },
        { label: 'Pominięte', count: skipCount, color: '#f59e0b', icon: '⏭️' },
        { label: 'Wszystkie zadania', count: totalTasks, color: '#6366f1', icon: '📊' }
    ];
    
    stats.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.style.cssText = `
            background: ${stat.color}15;
            border: 2px solid ${stat.color};
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
        `;
        
        const icon = document.createElement('div');
        icon.textContent = stat.icon;
        icon.style.fontSize = '2rem';
        icon.style.marginBottom = '0.5rem';
        
        const count = document.createElement('div');
        count.textContent = stat.count;
        count.style.cssText = `
            font-size: 2rem;
            font-weight: bold;
            color: ${stat.color};
        `;
        
        const label = document.createElement('div');
        label.textContent = stat.label;
        label.style.cssText = `
            font-size: 0.9rem;
            color: #666;
            margin-top: 0.5rem;
        `;
        
        statDiv.appendChild(icon);
        statDiv.appendChild(count);
        statDiv.appendChild(label);
        statsDiv.appendChild(statDiv);
    });
    
    const percentage = totalTasks > 0 ? Math.round((goodCount / totalTasks) * 100) : 0;
    const percentageDiv = document.createElement('div');
    percentageDiv.style.cssText = `
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--magenta);
        margin: 1.5rem 0;
        padding: 1rem;
        background: var(--magenta)15;
        border-radius: 12px;
        border: 2px solid var(--magenta);
    `;
    percentageDiv.textContent = `Wynik: ${percentage}% poprawnych odpowiedzi`;
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
        flex-wrap: wrap;
    `;
    
    const restartBtn = document.createElement('button');
    restartBtn.innerHTML = '<span class="task-btn-icon">🔄</span> Rozpocznij ponownie';
    restartBtn.className = 'task-btn task-btn-good';
    restartBtn.style.cssText = `
        padding: 1rem 2rem;
        font-size: 1.1rem;
        border-radius: 12px;
    `;
    
    restartBtn.onclick = async () => {
        if (confirm('Czy na pewno chcesz rozpocząć test ponownie? Wszystkie dotychczasowe wyniki zostaną usunięte.')) {
            try {
                // Pobierz wszystkie zadania z tego kursu
                const { data: courseTasks, error: tasksError } = await supabase
                    .from('tasks')
                    .select('id')
                    .eq('course_id', course_id)
                    .eq('is_active', true);
                
                if (tasksError) {
                    alert('Błąd podczas resetowania testu: ' + tasksError.message);
                    return;
                }
                
                if (!courseTasks || courseTasks.length === 0) {
                    alert('Brak zadań w tym kursie.');
                    return;
                }
                
                // Pobierz ID wszystkich zadań z tego kursu
                const taskIds = courseTasks.map(task => task.id);
                
                // Usuń wszystkie wpisy użytkownika dla zadań z tego kursu
                const { error: deleteError } = await supabase
                    .from('user_tasks')
                    .delete()
                    .eq('user_id', currentUser.id)
                    .in('task_id', taskIds);
                
                if (deleteError) {
                    alert('Błąd podczas resetowania testu: ' + deleteError.message);
                    return;
                }
                
                // Rozpocznij test ponownie
                setTimeout(() => {
                    showRandomTaskForCourse(course_id, true);
                }, 500);
                
            } catch (err) {
                alert('Wystąpił błąd podczas resetowania testu: ' + err.message);
            }
        }
    };
    
    const backToCourseBtn = document.createElement('button');
    backToCourseBtn.innerHTML = '<span class="task-btn-icon">📚</span> Powrót do kursu';
    backToCourseBtn.className = 'task-btn task-btn-skip';
    backToCourseBtn.style.cssText = `
        padding: 1rem 2rem;
        font-size: 1.1rem;
        border-radius: 12px;
    `;
    
    backToCourseBtn.onclick = () => {
        showSection('dashboard');
    };
    
    buttonsDiv.appendChild(restartBtn);
    buttonsDiv.appendChild(backToCourseBtn);
    
    summaryDiv.appendChild(title);
    summaryDiv.appendChild(statsDiv);
    summaryDiv.appendChild(percentageDiv);
    summaryDiv.appendChild(buttonsDiv);
    container.appendChild(summaryDiv);
    
    area.innerHTML = '';
    area.appendChild(container);
}

// Eksportuj funkcje globalnie
window.showRandomTaskForCourse = showRandomTaskForCourse;
window.showTaskWithControls = showTaskWithControls; 