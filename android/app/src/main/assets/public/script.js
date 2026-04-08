const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const noteTitleInput = document.getElementById('noteTitle');
const noteContentInput = document.getElementById('noteContent');
const notesContainer = document.getElementById('notesContainer');
const modalTitle = document.getElementById('modalTitle');
const colorPickerOpts = document.querySelectorAll('.color-option');
const toastContainer = document.getElementById('toastContainer');
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const voiceBtn = document.getElementById('voiceBtn');

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let editingNoteId = null;
let selectedColor = 'default';
let searchQuery = '';

function renderNotes() {
    notesContainer.innerHTML = '';
    
    // Filter notes based on searchQuery
    const filteredNotes = notes.filter(note => {
        const query = searchQuery.toLowerCase();
        return note.title.toLowerCase().includes(query) || 
               note.content.toLowerCase().includes(query);
    });

    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); margin-top: 3rem;">
                <p style="font-size: 1.2rem;">${searchQuery ? 'No notes match your search.' : "You don't have any notes yet."}</p>
                <p>${searchQuery ? 'Try a different search term.' : 'Click "+ New Note" to create one.'}</p>
            </div>
        `;
        return;
    }

    // Sort notes: pinned first, then by date descending
    const sortedNotes = [...filteredNotes].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    sortedNotes.forEach((note, index) => {
        const noteEl = document.createElement('div');
        noteEl.classList.add('note-card', 'animate-in');
        noteEl.style.animationDelay = `${index * 0.05}s`;
        if (note.color && note.color !== 'default') {
            noteEl.classList.add(`note-color-${note.color}`);
        }
        
        const date = new Date(note.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        noteEl.innerHTML = `
            <div class="note-header">
                <h3 class="note-title" title="${escapeHtml(note.title)}">${escapeHtml(note.title) || 'Untitled Note'}</h3>
                <div>
                    <button class="icon-action-btn pin-btn ${note.pinned ? 'pinned' : ''}" onclick="togglePin('${note.id}', event)" title="Pin Note">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${note.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.87l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                    </button>
                    <button class="icon-action-btn delete-btn" onclick="deleteNote('${note.id}', event)" title="Delete Note">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="note-card-clickable" onclick="openEditModal('${note.id}')">
                <div class="note-date">${date}</div>
                <div class="note-body">${escapeHtml(note.content)}</div>
            </div>
        `;
        
        notesContainer.appendChild(noteEl);
    });
}

function openModal() {
    noteTitleInput.value = '';
    noteContentInput.value = '';
    editingNoteId = null;
    selectedColor = 'default';
    updateColorSelection();
    modalTitle.textContent = 'Add a Note';
    noteModal.classList.remove('hidden');
    noteTitleInput.focus();
}

function closeModal() {
    noteModal.classList.add('hidden');
}

function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (!title && !content) {
        closeModal();
        return;
    }

    if (editingNoteId) {
        // Edit existing
        const noteIndex = notes.findIndex(n => n.id === editingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].content = content;
            notes[noteIndex].color = selectedColor;
            notes[noteIndex].date = new Date().toISOString();
        }
        showToast('Note updated successfully!');
    } else {
        // Create new
        const newNote = {
            id: generateId(),
            title: title,
            content: content,
            color: selectedColor,
            date: new Date().toISOString()
        };
        notes.unshift(newNote); // Add to beginning
        showToast('Note created successfully!');
    }

    saveToLocalStorage();
    renderNotes();
    closeModal();
}

window.deleteNote = function(id, event) {
    if (event) {
        event.stopPropagation();
    }
    
    notes = notes.filter(note => note.id !== id);
    saveToLocalStorage();
    renderNotes();
    showToast('Note deleted');
}

window.togglePin = function(id, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
        notes[noteIndex].pinned = !notes[noteIndex].pinned;
        saveToLocalStorage();
        renderNotes();
        showToast(notes[noteIndex].pinned ? 'Note pinned' : 'Note unpinned');
    }
}

window.openEditModal = function(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    editingNoteId = id;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    selectedColor = note.color || 'default';
    updateColorSelection();
    modalTitle.textContent = 'Edit Note';
    
    noteModal.classList.remove('hidden');
    noteContentInput.focus();
}

function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Basic HTML sanitization to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Event Listeners
addNoteBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', saveNote);

// Close modal when clicking outside
noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) {
        closeModal();
    }
});

// Save on Cmd/Ctrl + Enter
noteModal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        saveNote();
    }
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Initial render
renderNotes();

// UI Interactions and Polish
function updateColorSelection() {
    colorPickerOpts.forEach(opt => {
        if (opt.dataset.color === selectedColor) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

colorPickerOpts.forEach(opt => {
    opt.addEventListener('click', (e) => {
        selectedColor = e.target.dataset.color;
        updateColorSelection();
    });
});

function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Trigger paint before adding "show" class
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Background paralax effect on mousemove
const blobs = document.querySelectorAll('.blob');
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    blobs.forEach((blob, index) => {
        const factor = index === 0 ? 30 : -40;
        blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
});

// Live Clock and Date
const liveClockDateEl = document.getElementById('liveClockDate');
function updateClock() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    liveClockDateEl.textContent = now.toLocaleDateString('en-US', options);
}
setInterval(updateClock, 1000);
updateClock();

// Focus Timer
const timerDisplay = document.getElementById('timerDisplay');
const startTimerBtn = document.getElementById('startTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');

let timerInterval;
let timerSeconds = 0;
let isTimerRunning = false;

function updateTimerDisplay() {
    const hrs = Math.floor(timerSeconds / 3600);
    const mins = Math.floor((timerSeconds % 3600) / 60);
    const secs = timerSeconds % 60;
    timerDisplay.textContent = 
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

startTimerBtn.addEventListener('click', () => {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        startTimerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'; // Play icon
    } else {
        timerInterval = setInterval(() => {
            timerSeconds++;
            updateTimerDisplay();
        }, 1000);
        startTimerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'; // Pause icon
    }
    isTimerRunning = !isTimerRunning;
});

resetTimerBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerSeconds = 0;
    isTimerRunning = false;
    updateTimerDisplay();
    startTimerBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderNotes();
});

// Export Notes as JSON
exportBtn.addEventListener('click', () => {
    if (notes.length === 0) {
        showToast('No notes to export.');
        return;
    }
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Notes exported successfully!');
});

// Import Notes from JSON
importBtn.addEventListener('click', () => {
    importFile.click();
});

importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('Importing will overwrite your current notes. Continue?')) {
        importFile.value = ''; // Reset
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedNotes = JSON.parse(event.target.result);
            if (Array.isArray(importedNotes)) {
                notes = importedNotes;
                saveToLocalStorage();
                renderNotes();
                showToast('Notes imported successfully!');
            } else {
                throw new Error('Invalid format');
            }
        } catch (err) {
            showToast('Error importing notes. Invalid file.');
            console.error(err);
        }
        importFile.value = ''; // Reset
    };
    reader.readAsText(file);
});

// Voice-to-Text Logic
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    let isRecording = false;

    voiceBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        isRecording = true;
        voiceBtn.classList.add('recording');
        showToast('Listening...');
    };

    recognition.onend = () => {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        showToast('Voice dictation stopped');
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
            const separator = noteContentInput.value ? ' ' : '';
            noteContentInput.value += separator + finalTranscript;
            // Scroll to bottom
            noteContentInput.scrollTop = noteContentInput.scrollHeight;
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            showToast('Microphone access denied');
        } else {
            showToast('Error in voice dictation');
        }
        recognition.stop();
    };
} else {
    // Hide or disable voice button if not supported
    voiceBtn.style.display = 'none';
    console.log('Speech Recognition not supported by this browser.');
}
