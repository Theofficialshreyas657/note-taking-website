// 🔐 Redirect to login if no token
let token = localStorage.getItem('notesAppToken');
if (!token || token === 'undefined' || token === 'null') {
    window.location.href = 'auth.html';
}

// App state
let blocks = [];
let currentBlockId = null;
let editingNoteId = null;

// DOM elements
const blocksContainer = document.getElementById('blocks-container');
const addBlockBtn = document.getElementById('add-block-btn');

// Modals
const blockModal = document.getElementById('block-modal');
const noteModal = document.getElementById('note-modal');
const blockModalTitle = document.getElementById('block-modal-title');
const noteModalTitle = document.getElementById('note-modal-title');
const blockTitleInput = document.getElementById('block-title');
const saveBlockBtn = document.getElementById('save-block-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTypeSelect = document.getElementById('note-type');

// Note type fields
const textNoteFields = document.getElementById('text-note-fields');
const imageNoteFields = document.getElementById('image-note-fields');
const checkboxNoteFields = document.getElementById('checkbox-note-fields');

// API
const API_URL = 'http://localhost:3000/api';

// ✅ Helper for authorized requests
function authFetch(url, options = {}) {
    const token = localStorage.getItem('notesAppToken');
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    });
}

// ✅ Initialize app
function init() {
    loadFromAPI();
    setupEventListeners();
}

// ✅ Load blocks from API
async function loadFromAPI() {
    try {
        const response = await authFetch(`${API_URL}/blocks`);
        if (!response.ok) throw new Error('Failed to fetch blocks');
        blocks = await response.json();
        renderBlocks();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load from server. Using local data if available.');
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    const savedBlocks = localStorage.getItem('notesAppBlocks');
    blocks = savedBlocks ? JSON.parse(savedBlocks) : [];
    renderBlocks();
}

function saveToLocalStorage() {
    localStorage.setItem('notesAppBlocks', JSON.stringify(blocks));
}

async function saveBlockToAPI(blockData) {
    try {
        const method = blockData.id && currentBlockId ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_URL}/blocks/${blockData.id}` : `${API_URL}/blocks`;
        const response = await authFetch(url, {
            method,
            body: JSON.stringify(blockData)
        });
        if (!response.ok) throw new Error('Failed to save block');
        return await response.json();
    } catch (error) {
        console.error('Error saving block:', error);
        alert('Failed to save to server. Saving locally.');
        return null;
    }
}

async function deleteBlockFromAPI(blockId) {
    try {
        const response = await authFetch(`${API_URL}/blocks/${blockId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete block');
        return true;
    } catch (error) {
        console.error('Error deleting block:', error);
        alert('Failed to delete from server. Deleting locally.');
        return false;
    }
}

async function saveNoteToAPI(noteData) {
    try {
        const method = noteData.id && editingNoteId ? 'PUT' : 'POST';
        const url = method === 'PUT' ? `${API_URL}/notes/${noteData.id}` : `${API_URL}/notes`;
        const response = await authFetch(url, {
            method,
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Failed to save note');
        return await response.json();
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Failed to save to server. Saving locally.');
        return null;
    }
}

async function deleteNoteFromAPI(noteId) {
    try {
        const response = await authFetch(`${API_URL}/notes/${noteId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete note');
        return true;
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete from server. Deleting locally.');
        return false;
    }
}

async function toggleCheckboxInAPI(noteId, checked) {
    try {
        const response = await authFetch(`${API_URL}/notes/${noteId}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ checked })
        });
        if (!response.ok) throw new Error('Failed to toggle checkbox');
        return true;
    } catch (error) {
        console.error('Error toggling checkbox:', error);
        return false;
    }
}

async function saveBlock() {
    const title = blockTitleInput.value.trim();
    if (!title) return alert('Please enter a block title');

    const blockData = currentBlockId
        ? { id: currentBlockId, title }
        : { id: generateId(), title, notes: [] };

    const savedBlock = await saveBlockToAPI(blockData);

    if (savedBlock) {
        if (currentBlockId) {
            const i = blocks.findIndex(b => b.id === currentBlockId);
            if (i !== -1) {
                // ✅ Instead of replacing, merge data
                blocks[i] = {
                    ...blocks[i],        // keep existing block (especially notes)
                    ...savedBlock        // overwrite updated fields like title
                };
            }
        } else {
            if (!savedBlock.notes) savedBlock.notes = [];
            blocks.push(savedBlock);
        }
    } else {
        // fallback: local update
        if (currentBlockId) {
            const i = blocks.findIndex(b => b.id === currentBlockId);
            if (i !== -1) blocks[i].title = title;
        } else {
            blocks.push(blockData);
        }
        saveToLocalStorage();
    }

    renderBlocks();
    closeModals();
}


async function deleteBlock(blockId) {
    if (!confirm('Delete this block and its notes?')) return;
    const deleted = await deleteBlockFromAPI(blockId);
    blocks = blocks.filter(b => b.id !== blockId);
    if (!deleted) saveToLocalStorage();
    renderBlocks();
}

async function saveNote() {
    const noteType = noteTypeSelect.value;
    const blockIndex = blocks.findIndex(b => b.id === currentBlockId);
    if (blockIndex === -1) return;

    const noteData = { block_id: currentBlockId, type: noteType };

    switch (noteType) {
        case 'text':
            const content = document.getElementById('text-content').value.trim();
            if (!content) return alert('Please enter note content');
            noteData.content = content;
            break;
        case 'image':
            const imageUrl = document.getElementById('image-url').value.trim();
            if (!imageUrl) return alert('Please enter image URL');
            noteData.imageUrl = imageUrl;
            break;
        case 'checkbox':
            const label = document.getElementById('checkbox-label').value.trim();
            const checked = document.getElementById('checkbox-checked').checked;
            if (!label) return alert('Please enter checkbox label');
            noteData.label = label;
            noteData.checked = checked;
            break;
    }

    if (editingNoteId) {
        noteData.id = editingNoteId;
        const noteIndex = blocks[blockIndex].notes.findIndex(n => n.id === editingNoteId);
        const savedNote = await saveNoteToAPI(noteData);
        if (savedNote && noteIndex !== -1) {
            blocks[blockIndex].notes[noteIndex] = savedNote;
        } else if (noteIndex !== -1) {
            blocks[blockIndex].notes[noteIndex] = noteData;
            saveToLocalStorage();
        }
    } else {
        noteData.id = noteData.id || generateId();
        const savedNote = await saveNoteToAPI(noteData);
        if (savedNote) {
            blocks[blockIndex].notes.push(savedNote);
        } else {
            blocks[blockIndex].notes.push(noteData);
            saveToLocalStorage();
        }
    }

    renderBlocks();
    closeModals();
}

function renderBlocks() {
    blocksContainer.innerHTML = '';

    if (blocks.length === 0) {
        blocksContainer.innerHTML = `
            <div class="no-blocks">
                <h2>No blocks yet</h2>
                <p>Create your first block to get started!</p>
            </div>`;
        return;
    }

    blocks.forEach(block => {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.id = `block-${block.id}`;

        blockElement.innerHTML = `
            <div class="block-header">
                <h3 class="block-title">${block.title}</h3>
                <div class="block-actions">
                    <button class="btn-secondary btn-sm edit-block" data-id="${block.id}">Edit</button>
                    <button class="btn-danger btn-sm delete-block" data-id="${block.id}">Delete</button>
                </div>
            </div>
            <div class="notes-container" id="notes-container-${block.id}">
                ${renderNotes(block.notes || [])}
            </div>
            <div class="add-note-form">
                <button class="btn-secondary add-note" data-block-id="${block.id}">Add Note</button>
            </div>
        `;

        blocksContainer.appendChild(blockElement);
    });
}

function renderNotes(notes) {
    if (!notes || notes.length === 0) {
        return `<div class="empty-state"><p>No notes in this block yet</p></div>`;
    }

    return notes.map(note => {
        let content = '';
        switch (note.type) {
            case 'text':
                content = `<div class="note-content">${note.content}</div>`;
                break;
            case 'image':
                content = `<div class="note-content img-note"><img src="${note.imageUrl}" alt="Image Note"></div>`;
                break;
            case 'checkbox':
                content = `<div class="note-content checkbox-note">
                    <input type="checkbox" id="checkbox-${note.id}" class="toggle-checkbox" data-note-id="${note.id}" ${note.checked ? 'checked' : ''}>
                    <label for="checkbox-${note.id}">${note.label}</label>
                </div>`;
                break;
        }

        return `
            <div class="note" id="note-${note.id}">
                <div class="note-header">
                    <div class="note-type-label">${note.type}</div>
                    <div class="note-actions">
                        <button class="btn-secondary btn-sm edit-note" data-id="${note.id}">Edit</button>
                        <button class="btn-danger btn-sm delete-note" data-id="${note.id}">Delete</button>
                    </div>
                </div>
                ${content}
            </div>`;
    }).join('');
}

function setupEventListeners() {
    addBlockBtn.addEventListener('click', showAddBlockModal);
    saveBlockBtn.addEventListener('click', saveBlock);
    saveNoteBtn.addEventListener('click', saveNote);

    document.querySelectorAll('.modal-close, .block-modal-cancel, .note-modal-cancel').forEach(elem => {
        elem.addEventListener('click', closeModals);
    });

    noteTypeSelect.addEventListener('change', handleNoteTypeChange);
    document.addEventListener('click', handleButtonClicks);
    document.addEventListener('change', handleCheckboxChange);
}

function handleButtonClicks(e) {
    if (e.target.classList.contains('edit-block')) showEditBlockModal(e.target.dataset.id);
    if (e.target.classList.contains('delete-block')) deleteBlock(e.target.dataset.id);
    if (e.target.classList.contains('add-note')) showAddNoteModal(e.target.dataset.blockId);
    if (e.target.classList.contains('edit-note')) showEditNoteModal(e.target.dataset.id);
    if (e.target.classList.contains('delete-note')) deleteNote(e.target.dataset.id);
}

function handleCheckboxChange(e) {
    if (e.target.classList.contains('toggle-checkbox')) {
        const noteId = e.target.dataset.noteId;
        toggleCheckbox(noteId, e.target.checked);
    }
}

function toggleCheckbox(noteId, checked) {
    toggleCheckboxInAPI(noteId, checked);
}

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

function showAddBlockModal() {
    blockModalTitle.textContent = 'Add New Block';
    blockTitleInput.value = '';
    currentBlockId = null;
    blockModal.style.display = 'flex';
}

function showEditBlockModal(blockId) {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
        blockModalTitle.textContent = 'Edit Block';
        blockTitleInput.value = block.title;
        currentBlockId = blockId;
        blockModal.style.display = 'flex';
    }
}

function showAddNoteModal(blockId) {
    noteModalTitle.textContent = 'Add New Note';
    noteTypeSelect.value = 'text';
    document.getElementById('text-content').value = '';
    document.getElementById('image-url').value = '';
    document.getElementById('checkbox-label').value = '';
    document.getElementById('checkbox-checked').checked = false;

    handleNoteTypeChange();
    currentBlockId = blockId;
    editingNoteId = null;
    noteModal.style.display = 'flex';
}

function showEditNoteModal(noteId) {
    let foundNote = null;
    let foundBlockId = null;

    for (const block of blocks) {
        const note = block.notes.find(n => n.id === noteId);
        if (note) {
            foundNote = note;
            foundBlockId = block.id;
            break;
        }
    }

    if (foundNote) {
        noteModalTitle.textContent = 'Edit Note';
        noteTypeSelect.value = foundNote.type;

        switch (foundNote.type) {
            case 'text':
                document.getElementById('text-content').value = foundNote.content;
                break;
            case 'image':
                document.getElementById('image-url').value = foundNote.imageUrl;
                break;
            case 'checkbox':
                document.getElementById('checkbox-label').value = foundNote.label;
                document.getElementById('checkbox-checked').checked = foundNote.checked;
                break;
        }

        handleNoteTypeChange();
        currentBlockId = foundBlockId;
        editingNoteId = noteId;
        noteModal.style.display = 'flex';
    }
}

function handleNoteTypeChange() {
    textNoteFields.style.display = 'none';
    imageNoteFields.style.display = 'none';
    checkboxNoteFields.style.display = 'none';

    const type = noteTypeSelect.value;
    if (type === 'text') textNoteFields.style.display = 'block';
    if (type === 'image') imageNoteFields.style.display = 'block';
    if (type === 'checkbox') checkboxNoteFields.style.display = 'block';
}

function closeModals() {
    blockModal.style.display = 'none';
    noteModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('notesAppToken');
            localStorage.removeItem('notesAppUser');
            window.location.href = 'auth.html';
        });
    }
});

document.addEventListener('DOMContentLoaded', init);
