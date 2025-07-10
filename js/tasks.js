// tasks.js

// Wyświetl losowe zadanie z danego kursu (course_id)
async function showRandomTaskForCourse(course_id) {
    console.log('showRandomTaskForCourse wywołane, course_id:', course_id);
    
    // Sprawdź czy użytkownik jest zalogowany
    if (!currentUser) {
        alert('Musisz być zalogowany, aby rozwiązywać zadania.');
        return;
    }
    
    console.log('currentUser:', currentUser);
    console.log('currentUser.id:', currentUser.id);
    
    // Pobierz losowe zadanie z danego kursu
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('course_id', course_id)
        .eq('is_active', true)
        .order('id', { ascending: true });
    
    console.log('Pobrane tasks:', tasks, 'error:', error);
    if (error) {
        console.error('Błąd pobierania zadań:', error);
        alert('Błąd pobierania zadań: ' + error.message);
        return;
    }
    if (!tasks || tasks.length === 0) {
        alert('Brak zadań dla tego kursu.');
        return;
    }
    
    // Wybierz losowe zadanie
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    showTaskWithControls(randomTask.id, course_id);
}

// Wyświetl zadanie z przyciskami i zdjęciami
async function showTaskWithControls(taskId, course_id) {
    console.log('showTaskWithControls wywołane, taskId:', taskId);
    
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
    
    console.log('Pobrane task:', task, 'error:', taskError);
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
    content.innerHTML = task.content; // Używamy innerHTML zamiast textContent dla lepszego formatowania
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
    
    // Przycisk pokaż odpowiedź
    const showAnswerBtn = document.createElement('button');
    showAnswerBtn.textContent = '👁️ Pokaż odpowiedź';
    showAnswerBtn.className = 'show-answer-btn';
    
    const answerDiv = document.createElement('div');
    answerDiv.className = 'task-answer';
    answerDiv.style.display = 'none';
    answerDiv.innerHTML = task.solution; // Używamy innerHTML dla lepszego formatowania
    
    showAnswerBtn.onclick = () => {
        answerDiv.style.display = 'block';
        showAnswerBtn.style.display = 'none';
    };
    
    container.appendChild(showAnswerBtn);
    container.appendChild(answerDiv);
    
    // Trzy przyciski do oceny i przejścia dalej
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
                console.log('Próba zapisu do user_tasks:', {
                    user_id: currentUser.id,
                    task_id: taskId,
                    status: value,
                    completed_at: new Date().toISOString()
                });
                
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
                    console.log('Kolumna completed_at nie istnieje, próbuję bez niej...');
                    
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
                
                console.log('Wynik zapisu:', { data, error });
                
                if (error) {
                    console.error('Błąd zapisu odpowiedzi:', error);
                    console.error('Szczegóły błędu:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
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
                console.error('Błąd podczas zapisywania:', err);
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
    
    // Wyświetl zadanie w wybranym miejscu na stronie
    const area = document.getElementById('taskArea');
    console.log('Próba wyświetlenia zadania, area:', area);
    if (area) {
        area.innerHTML = '';
        area.appendChild(container);
        console.log('Zadanie dodane do area');
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

// Eksportuj funkcje globalnie
window.showRandomTaskForCourse = showRandomTaskForCourse;
window.showTaskWithControls = showTaskWithControls; 