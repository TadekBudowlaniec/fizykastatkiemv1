// check_database.js - Skrypt do sprawdzania stanu bazy danych

// Funkcja do sprawdzenia czy tabele istnieją
async function checkDatabaseTables() {
    console.log('🔍 Sprawdzanie tabel w bazie danych...');
    console.log('Supabase client:', !!supabase);
    console.log('Current user:', currentUser);
    
    try {
        // Sprawdź tabelę tasks - będzie sprawdzona później
        console.log('Sprawdzam tabelę tasks...');
        
        // Sprawdź tabelę task_images
        console.log('Sprawdzam tabelę task_images...');
        const { data: imagesData, error: imagesError } = await supabase
            .from('task_images')
            .select('count')
            .limit(1);
        
        console.log('Wynik task_images:', { data: imagesData, error: imagesError });
        
        if (imagesError) {
            console.error('❌ Błąd tabeli task_images:', imagesError);
        } else {
            console.log('✅ Tabela task_images istnieje');
        }
        
        // Sprawdź tabelę user_tasks
        console.log('Sprawdzam tabelę user_tasks...');
        const { data: userTasksData, error: userTasksError } = await supabase
            .from('user_tasks')
            .select('count')
            .limit(1);
        
        console.log('Wynik user_tasks:', { data: userTasksData, error: userTasksError });
        
        if (userTasksError) {
            console.error('❌ Błąd tabeli user_tasks:', userTasksError);
        } else {
            console.log('✅ Tabela user_tasks istnieje');
        }
        
        // Sprawdź czy tabela tasks istnieje i ma dane
        const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('id')
            .limit(1);
            
        if (tasksError) {
            console.error('❌ Błąd tabeli tasks:', tasksError);
            console.log('💡 Wskazówka: Tabela tasks nie istnieje lub nie ma dostępu');
            return;
        } else if (!tasksData || tasksData.length === 0) {
            console.error('❌ Tabela tasks jest pusta');
            console.log('💡 Wskazówka: Dodaj zadania do tabeli tasks');
            return;
        } else {
            console.log('✅ Tabela tasks istnieje i ma dane:', tasksData.length, 'zadań');
        }

        // Sprawdź czy użytkownik jest zalogowany
        if (currentUser) {
            console.log('✅ Użytkownik zalogowany:', currentUser.id);
            
            // Sprawdź czy można zapisać do user_tasks
            const testData = {
                user_id: currentUser.id,
                task_id: tasksData[0].id, // użyj pierwszego dostępnego zadania
                status: 'skip'
                // Usuwamy completed_at na razie
            };
            
            console.log('🧪 Test zapisu do user_tasks:', testData);
            
            const { data: testInsert, error: testError } = await supabase
                .from('user_tasks')
                .insert(testData);
            
            console.log('Wynik testowego zapisu:', { data: testInsert, error: testError });
            
            if (testError) {
                console.error('❌ Błąd testowego zapisu:', testError);
                console.error('Szczegóły błędu:', {
                    message: testError.message,
                    details: testError.details,
                    hint: testError.hint,
                    code: testError.code
                });
                
                // Jeśli błąd związany z completed_at, spróbuj dodać kolumnę
                if (testError.code === 'PGRST204' && testError.message.includes('completed_at')) {
                    console.log('💡 Wskazówka: Dodaj kolumnę completed_at do tabeli user_tasks');
                    console.log('💡 Wykonaj skrypt fix_user_tasks_table.sql w Supabase SQL Editor');
                }
            } else {
                console.log('✅ Testowy zapis udany');
                
                // Usuń testowy rekord
                const { error: deleteError } = await supabase
                    .from('user_tasks')
                    .delete()
                    .eq('user_id', currentUser.id)
                    .eq('task_id', 1);
                
                if (deleteError) {
                    console.error('❌ Błąd usuwania testowego rekordu:', deleteError);
                } else {
                    console.log('✅ Testowy rekord usunięty');
                }
            }
        } else {
            console.log('❌ Użytkownik nie jest zalogowany');
        }
        
    } catch (error) {
        console.error('❌ Błąd podczas sprawdzania bazy danych:', error);
    }
}

// Funkcja do sprawdzenia przykładowych danych
async function checkSampleData() {
    console.log('📊 Sprawdzanie przykładowych danych...');
    
    try {
        // Sprawdź czy są zadania w bazie
        console.log('Pobieram zadania...');
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .limit(5);
        
        console.log('Wynik pobierania zadań:', { data: tasks, error: tasksError });
        
        if (tasksError) {
            console.error('❌ Błąd pobierania zadań:', tasksError);
        } else {
            console.log('📝 Zadania w bazie:', tasks?.length || 0);
            if (tasks && tasks.length > 0) {
                console.log('Przykładowe zadanie:', tasks[0]);
            }
        }
        
        // Sprawdź czy są obrazy w bazie
        console.log('Pobieram obrazy...');
        const { data: images, error: imagesError } = await supabase
            .from('task_images')
            .select('*')
            .limit(5);
        
        console.log('Wynik pobierania obrazów:', { data: images, error: imagesError });
        
        if (imagesError) {
            console.error('❌ Błąd pobierania obrazów:', imagesError);
        } else {
            console.log('🖼️ Obrazy w bazie:', images?.length || 0);
        }
        
    } catch (error) {
        console.error('❌ Błąd podczas sprawdzania danych:', error);
    }
}

// Funkcja do testowania zapisu postępu użytkownika
async function testUserProgressSave() {
    console.log('🧪 Testowanie zapisu postępu użytkownika...');
    
    if (!currentUser) {
        console.log('❌ Użytkownik nie jest zalogowany');
        return;
    }
    
    try {
        // Pobierz pierwsze zadanie
        console.log('Pobieram zadanie do testu...');
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .limit(1)
            .single();
        
        console.log('Wynik pobierania zadania:', { data: task, error: taskError });
        
        if (taskError || !task) {
            console.error('❌ Nie można pobrać zadania do testu:', taskError);
            return;
        }
        
        console.log('📝 Test z zadaniem ID:', task.id);
        
        // Próba zapisu postępu
        const progressData = {
            user_id: currentUser.id,
            task_id: task.id,
            status: 'good',
            completed_at: new Date().toISOString()
        };
        
        console.log('💾 Próba zapisu:', progressData);
        
        const { data: saveResult, error: saveError } = await supabase
            .from('user_tasks')
            .upsert(progressData);
        
        console.log('Wynik zapisu postępu:', { data: saveResult, error: saveError });
        
        if (saveError) {
            console.error('❌ Błąd zapisu postępu:', saveError);
            console.error('Szczegóły:', {
                message: saveError.message,
                details: saveError.details,
                hint: saveError.hint,
                code: saveError.code
            });
        } else {
            console.log('✅ Zapis postępu udany:', saveResult);
            
            // Sprawdź czy można odczytać zapisany postęp
            console.log('Sprawdzam odczyt zapisanego postępu...');
            const { data: readResult, error: readError } = await supabase
                .from('user_tasks')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('task_id', task.id)
                .single();
            
            console.log('Wynik odczytu postępu:', { data: readResult, error: readError });
            
            if (readError) {
                console.error('❌ Błąd odczytu postępu:', readError);
            } else {
                console.log('✅ Odczyt postępu udany:', readResult);
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd podczas testowania:', error);
    }
}

// Funkcja do sprawdzenia polityk RLS
async function checkRLSPolicies() {
    console.log('🔒 Sprawdzanie polityk RLS...');
    
    if (!currentUser) {
        console.log('❌ Użytkownik nie jest zalogowany - nie można sprawdzić polityk RLS');
        return;
    }
    
    try {
        // Test 1: Sprawdź czy można odczytać zadania (powinno działać)
        console.log('Test 1: Sprawdzam SELECT z tasks...');
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .limit(1);
        
        console.log('Wynik SELECT z tasks:', { data: tasks, error: tasksError });
        
        if (tasksError) {
            console.error('❌ Błąd RLS dla tasks (SELECT):', tasksError);
        } else {
            console.log('✅ Polityka RLS dla tasks (SELECT) działa');
        }
        
        // Test 2: Sprawdź czy można odczytać obrazy (powinno działać)
        console.log('Test 2: Sprawdzam SELECT z task_images...');
        const { data: images, error: imagesError } = await supabase
            .from('task_images')
            .select('*')
            .limit(1);
        
        console.log('Wynik SELECT z task_images:', { data: images, error: imagesError });
        
        if (imagesError) {
            console.error('❌ Błąd RLS dla task_images (SELECT):', imagesError);
        } else {
            console.log('✅ Polityka RLS dla task_images (SELECT) działa');
        }
        
        // Test 3: Sprawdź czy można odczytać postęp użytkownika (powinno działać)
        console.log('Test 3: Sprawdzam SELECT z user_tasks...');
        const { data: userProgress, error: userProgressError } = await supabase
            .from('user_tasks')
            .select('*')
            .eq('user_id', currentUser.id)
            .limit(1);
        
        console.log('Wynik SELECT z user_tasks:', { data: userProgress, error: userProgressError });
        
        if (userProgressError) {
            console.error('❌ Błąd RLS dla user_tasks (SELECT):', userProgressError);
        } else {
            console.log('✅ Polityka RLS dla user_tasks (SELECT) działa');
        }
        
        // Test 4: Sprawdź czy można zapisać postęp użytkownika (powinno działać)
        console.log('Test 4: Sprawdzam INSERT do user_tasks...');
        const testData = {
            user_id: currentUser.id,
            task_id: 999999, // Nieistniejące ID zadania
            status: 'skip',
            completed_at: new Date().toISOString()
        };
        
        const { data: insertResult, error: insertError } = await supabase
            .from('user_tasks')
            .insert(testData);
        
        console.log('Wynik INSERT do user_tasks:', { data: insertResult, error: insertError });
        
        if (insertError) {
            if (insertError.code === '23503') { // Foreign key violation
                console.log('✅ Polityka RLS dla user_tasks (INSERT) działa (błąd klucza obcego to normalne)');
            } else {
                console.error('❌ Błąd RLS dla user_tasks (INSERT):', insertError);
            }
        } else {
            console.log('✅ Polityka RLS dla user_tasks (INSERT) działa');
            
            // Usuń testowy rekord
            const { error: deleteError } = await supabase
                .from('user_tasks')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('task_id', 999999);
            
            if (deleteError) {
                console.error('❌ Błąd usuwania testowego rekordu:', deleteError);
            } else {
                console.log('✅ Testowy rekord usunięty');
            }
        }
        
    } catch (error) {
        console.error('❌ Błąd podczas sprawdzania polityk RLS:', error);
    }
}

// Funkcja do pełnej diagnostyki
async function fullDatabaseDiagnostic() {
    console.log('🔍 ROZPOCZYNAM PEŁNĄ DIAGNOSTYKĘ BAZY DANYCH...');
    console.log('=' .repeat(50));
    console.log('Czas rozpoczęcia:', new Date().toLocaleString());
    
    await checkDatabaseTables();
    console.log('-'.repeat(30));
    
    await checkSampleData();
    console.log('-'.repeat(30));
    
    await checkRLSPolicies();
    console.log('-'.repeat(30));
    
    await testUserProgressSave();
    console.log('-'.repeat(30));
    
    console.log('🔍 DIAGNOSTYKA ZAKOŃCZONA');
    console.log('Czas zakończenia:', new Date().toLocaleString());
    console.log('=' .repeat(50));
}

// Prosta funkcja testowa
async function simpleTest() {
    console.log('🧪 PROSTY TEST POŁĄCZENIA...');
    console.log('1. Sprawdzam czy Supabase jest dostępny...');
    console.log('Supabase client:', !!supabase);
    
    if (!supabase) {
        console.error('❌ Supabase nie jest dostępny!');
        return;
    }
    
    console.log('2. Sprawdzam czy użytkownik jest zalogowany...');
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
        console.log('❌ Użytkownik nie jest zalogowany');
        return;
    }
    
    console.log('3. Próbuję prosty zapytanie do bazy...');
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('id')
            .limit(1);
        
        console.log('Wynik zapytania:', { data, error });
        
        if (error) {
            console.error('❌ Błąd zapytania:', error);
        } else {
            console.log('✅ Zapytanie udane!');
        }
    } catch (err) {
        console.error('❌ Wyjątek podczas zapytania:', err);
    }
}

// Eksportuj funkcje globalnie
window.checkDatabaseTables = checkDatabaseTables;
window.checkSampleData = checkSampleData;
window.testUserProgressSave = testUserProgressSave;
window.checkRLSPolicies = checkRLSPolicies;
window.fullDatabaseDiagnostic = fullDatabaseDiagnostic;
window.simpleTest = simpleTest;

// Automatyczne sprawdzenie po załadowaniu
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM załadowany, czekam na Supabase...');
    // Poczekaj na załadowanie Supabase
    setTimeout(() => {
        if (window.supabase) {
            console.log('🚀 Automatyczne sprawdzenie bazy danych...');
            checkDatabaseTables();
            checkSampleData();
        } else {
            console.log('❌ Supabase nie jest dostępny');
        }
    }, 2000);
}); 