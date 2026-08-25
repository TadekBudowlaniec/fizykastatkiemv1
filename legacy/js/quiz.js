// quiz.js
function checkQuiz(subjectKey) {
    const subject = subjects[subjectKey];
    if (!subject) return;
    const question = subject.quiz[0];
    const selected = document.querySelector('input[name="q1"]:checked');
    if (!selected) {
        alert('Wybierz odpowiedź!');
        return;
    }
    const answer = parseInt(selected.value);
    if (answer === question.correct) {
        alert('Brawo! Poprawna odpowiedź.');
    } else {
        alert('Niestety, to nie jest poprawna odpowiedź.');
    }
} 