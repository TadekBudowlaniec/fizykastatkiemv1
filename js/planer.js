// planer.js — Renderowanie planera maturalnego + paywall modal

// Sprawdza czy uzytkownik ma pelny dostep (full_access lub wiele kursow)
function userHasFullAccess() {
    if (currentUserIsAdmin) return true;
    if (!userEnrollments || userEnrollments.length === 0) return false;
    return userEnrollments.some(e => e.course_id === 'full_access');
}

// Zapisz/odczytaj postep checkboxow w Supabase (tabela user_planer_progress)
// Fallback na localStorage jesli nie zalogowany
async function savePlanerProgress(topicKey, checked) {
    if (currentUser && supabase) {
        try {
            await supabase
                .from('user_planer_progress')
                .upsert({
                    user_id: currentUser.id,
                    topic_key: topicKey,
                    checked: checked
                }, { onConflict: 'user_id,topic_key' });
        } catch (e) {
            console.error('Blad zapisu postepu planera:', e);
        }
    } else {
        const progress = JSON.parse(localStorage.getItem('planerProgress') || '{}');
        progress[topicKey] = checked;
        localStorage.setItem('planerProgress', JSON.stringify(progress));
    }
}

async function loadPlanerProgress() {
    if (currentUser && supabase) {
        try {
            const { data } = await supabase
                .from('user_planer_progress')
                .select('topic_key, checked')
                .eq('user_id', currentUser.id);
            const map = {};
            if (data) data.forEach(r => { map[r.topic_key] = r.checked; });
            return map;
        } catch (e) {
            console.error('Blad odczytu postepu planera:', e);
            return {};
        }
    } else {
        return JSON.parse(localStorage.getItem('planerProgress') || '{}');
    }
}

// Pokaz modal paywall
function showPlanerPaywall() {
    let modal = document.getElementById('planerPaywallModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'planerPaywallModal';
        modal.className = 'paywall-modal-overlay';
        modal.innerHTML = `
            <div class="paywall-modal-card" role="dialog" aria-modal="true">
                <button class="paywall-modal-close" aria-label="Zamknij" onclick="hidePlanerPaywall()">&times;</button>
                <div class="paywall-modal-icon">&#128274;</div>
                <h3 class="paywall-modal-title">Ups! Ta lekcja jest czescia platnego Pakietu Ratunkowego</h3>
                <p class="paywall-modal-desc">Pakiet Ratunkowy na 7 tygodni przed matura daje Ci dostep do wszystkich nagran, PDF-ow i quizow. Wykup pelny dostep, aby odblokowac to i wszystkie inne nagrania.</p>
                <a href="/oferta-ratunkowa" onclick="hidePlanerPaywall();showSection('oferta-ratunkowa');return false;" class="btn btn-gradient paywall-modal-btn">ZOBACZ OFERTE</a>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}
window.showPlanerPaywall = showPlanerPaywall;

function hidePlanerPaywall() {
    const modal = document.getElementById('planerPaywallModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
window.hidePlanerPaywall = hidePlanerPaywall;

// Renderuj planer z lista tematow/lekcji
async function renderPlaner() {
    const container = document.getElementById('planerContent');
    if (!container) return;

    const hasFullAccess = userHasFullAccess();
    const progress = await loadPlanerProgress();

    // Sortuj kursy
    const sortedSubjects = Object.entries(window.subjects).sort(([a], [b]) => {
        if (a === '0') return -1;
        if (b === '0') return 1;
        return Number(a) - Number(b);
    });

    let html = '<div class="planer-list">';

    sortedSubjects.forEach(([key, subject]) => {
        const topicKey = 'topic_' + key;
        const isChecked = progress[topicKey] === true;

        html += `
        <div class="planer-item" data-key="${key}">
            <label class="planer-checkbox-label">
                <input type="checkbox" class="planer-checkbox" data-topic="${topicKey}" ${isChecked ? 'checked' : ''}>
                <span class="planer-checkmark"></span>
                <span class="planer-topic-title">${subject.title}</span>
            </label>
            <button class="btn btn-outline planer-play-btn" data-course="${key}" title="Przejdz do lekcji">
                &#9654; Lekcja
            </button>
        </div>`;
    });

    html += '</div>';

    // Pasek postepu
    const totalTopics = sortedSubjects.length;
    const checkedCount = Object.values(progress).filter(v => v === true).length;
    const pct = totalTopics > 0 ? Math.round((checkedCount / totalTopics) * 100) : 0;

    html = `
    <div class="planer-progress-bar-wrap">
        <div class="planer-progress-bar">
            <div class="planer-progress-fill" style="width:${pct}%"></div>
        </div>
        <span class="planer-progress-text">${pct}% ukonczone (${checkedCount}/${totalTopics})</span>
    </div>` + html;

    container.innerHTML = html;

    // Obsluga checkboxow — zapisuj postep
    container.querySelectorAll('.planer-checkbox').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const topic = e.target.dataset.topic;
            await savePlanerProgress(topic, e.target.checked);
            // Update progress bar
            const allBoxes = container.querySelectorAll('.planer-checkbox');
            const checked = container.querySelectorAll('.planer-checkbox:checked').length;
            const total = allBoxes.length;
            const newPct = Math.round((checked / total) * 100);
            const fill = container.querySelector('.planer-progress-fill');
            const text = container.querySelector('.planer-progress-text');
            if (fill) fill.style.width = newPct + '%';
            if (text) text.textContent = `${newPct}% ukonczone (${checked}/${total})`;
        });
    });

    // Obsluga przyciskow lekcji — paywall lub nawigacja
    container.querySelectorAll('.planer-play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const courseKey = btn.dataset.course;
            if (hasFullAccess || hasAccessToCourse(courseKey)) {
                // Ma dostep — przejdz do lekcji
                showSection('dashboard');
                // Wybierz kurs w sidebarze
                setTimeout(() => {
                    const sidebarBtn = document.querySelector(`#dashboardSidebar [data-key="${courseKey}"]`);
                    if (sidebarBtn) sidebarBtn.click();
                }, 100);
            } else {
                // Brak dostepu — pokaz paywall modal
                showPlanerPaywall();
            }
        });
    });
}
window.renderPlaner = renderPlaner;
