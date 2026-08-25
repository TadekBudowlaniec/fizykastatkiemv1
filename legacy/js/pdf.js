// pdf.js
async function downloadPDF(pdfType) {
    if (!userHasAccess) {
        alert('Musisz kupić dostęp do platformy, aby pobierać materiały PDF!');
        return;
    }
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user.id;
        const hasAccess = userEnrollments.some(enrollment => 
            enrollment.course_id === 'full_access' || 
            enrollment.course_id === String(pdfType)
        );
        if (!hasAccess) {
            alert('Nie masz dostępu do tego materiału!');
            return;
        }
        const { data, error } = await supabase.storage
            .from('pdfs')
            .download(`${pdfType}.pdf`);
        if (error) throw error;
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pdfType}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        await supabase
            .from('download_logs')
            .insert({
                user_id: userId,
                file_type: pdfType,
                downloaded_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Błąd pobierania pliku:', error);
        alert('Błąd pobierania pliku: ' + error.message);
    }
} 