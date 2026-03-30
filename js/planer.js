// planer.js — Strona /planer korzysta z tego samego renderStudyPlanInLesson co kurs

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
                <h3 class="paywall-modal-title">Ups! Ta lekcja jest częścią płatnego Pakietu Ratunkowego</h3>
                <p class="paywall-modal-desc">Pakiet Ratunkowy na 7 tygodni przed maturą daje Ci dostęp do wszystkich nagrań, PDF-ów i quizów. Wykup pełny dostęp, aby odblokować to i wszystkie inne nagrania.</p>
                <a href="/oferta-ratunkowa" onclick="hidePlanerPaywall();showSection('oferta-ratunkowa');return false;" class="btn btn-gradient paywall-modal-btn">ZOBACZ OFERTĘ</a>
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

/**
 * Renderuje planer na stronie /planer — identyczny jak w kursie "Tutaj zacznij".
 * Korzysta z renderStudyPlanInLesson z navigation.js.
 */
async function renderPlaner() {
    const container = document.getElementById('planerContent');
    if (!container) return;

    // renderStudyPlanInLesson jest zdefiniowane w navigation.js
    // i obsługuje: brak logowania, brak planu (formularz konfiguracji), istniejący plan (karty)
    if (typeof renderStudyPlanInLesson === 'function') {
        await renderStudyPlanInLesson(container);
    } else {
        container.innerHTML = '<p style="color:#ef4444;">Nie udało się załadować planera. Odśwież stronę.</p>';
    }
}
window.renderPlaner = renderPlaner;
