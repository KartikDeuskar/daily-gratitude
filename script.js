document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker registration failed', err));
    }

    const gratitudeInput = document.getElementById('gratitudeInput');
    const saveBtn = document.getElementById('saveBtn');
    const entriesList = document.getElementById('entriesList');

    const STORAGE_KEY = 'daily_gratitude_entries';

    // Load entries on startup
    loadEntries();

    saveBtn.addEventListener('click', () => {
        const text = gratitudeInput.value.trim();
        if (text) {
            saveEntry(text);
            gratitudeInput.value = ''; // Clear input
        }
    });

    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', exportEntries);

    function exportEntries() {
        const entries = getEntries();
        if (entries.length === 0) {
            alert('No memories to export yet!');
            return;
        }

        const dataStr = JSON.stringify(entries, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `gratitude_memories_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function saveEntry(text) {
        const newEntry = {
            id: Date.now(),
            text: text,
            date: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        const entries = getEntries();
        entries.unshift(newEntry); // Add to beginning of list
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

        // Re-render
        renderEntries(entries);
    }

    function getEntries() {
        const entriesJSON = localStorage.getItem(STORAGE_KEY);
        return entriesJSON ? JSON.parse(entriesJSON) : [];
    }

    function loadEntries() {
        const entries = getEntries();
        renderEntries(entries);
    }

    function renderEntries(entries) {
        entriesList.innerHTML = '';
        entries.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'entry-card';

            const dateEl = document.createElement('span');
            dateEl.className = 'entry-date';
            dateEl.textContent = entry.date;

            const textEl = document.createElement('p');
            textEl.className = 'entry-text';
            textEl.textContent = entry.text;

            entryEl.appendChild(dateEl);
            entryEl.appendChild(textEl);

            entriesList.appendChild(entryEl);
        });
    }
});
