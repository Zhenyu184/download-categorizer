import { defaultConfig } from '../src/default.js';
import { loadConfig, saveConfig, resetConfig } from '../src/config.js';

// --- Elements ---
const enableToggle    = document.getElementById('global-enable');
const conflictSelect  = document.getElementById('conflict-action');
const mappingList     = document.getElementById('mapping-list');
const addMappingBtn   = document.getElementById('add-mapping-btn');
const exportBtn       = document.getElementById('export-btn');
const importBtn       = document.getElementById('import-btn');
const importFile      = document.getElementById('import-file');
const resetBtn        = document.getElementById('reset-btn');
const saveBtn         = document.getElementById('save-btn');
const cancelBtn       = document.getElementById('cancel-btn');

const modal           = document.getElementById('add-mapping-modal');
const modalClose      = modal.querySelector('.close');
const modalAddBtn     = document.getElementById('modal-add-btn');
const modalCancelBtn  = document.getElementById('modal-cancel-btn');
const folderNameInput = document.getElementById('folder-name');
const extensionsInput = document.getElementById('extensions');

// --- In-memory edit state ---
// Edits live here until "Save Settings" persists them. Each row keeps
// extensions as a comma-separated string for friendlier inline editing.
let rows = []; // [{ folder, extensions }]

// --- Helpers ---
function parseExtensions(text) {
    return [...new Set(
        text.split(',')
            .map((e) => e.trim().toLowerCase().replace(/^\./, ''))
            .filter(Boolean)
    )];
}

function rowsFromMapping(mapping) {
    return Object.entries(mapping).map(([folder, exts]) => ({
        folder,
        extensions: exts.join(', ')
    }));
}

function mappingFromRows() {
    const mapping = {};
    for (const { folder, extensions } of rows) {
        const name = folder.trim();
        if (!name) continue;
        mapping[name] = parseExtensions(extensions);
    }
    return mapping;
}

function renderMappings() {
    mappingList.replaceChildren();

    rows.forEach((row, index) => {
        const item = document.createElement('div');
        item.className = 'mapping-item';

        const folderInput = document.createElement('input');
        folderInput.type = 'text';
        folderInput.className = 'form-input';
        folderInput.value = row.folder;
        folderInput.placeholder = 'folder-name';
        folderInput.addEventListener('input', () => { row.folder = folderInput.value; });

        const extInput = document.createElement('input');
        extInput.type = 'text';
        extInput.className = 'form-input';
        extInput.value = row.extensions;
        extInput.placeholder = 'pdf, doc, docx';
        extInput.addEventListener('input', () => { row.extensions = extInput.value; });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            rows.splice(index, 1);
            renderMappings();
        });

        item.append(folderInput, extInput, removeBtn);
        mappingList.appendChild(item);
    });
}

function applyConfig(config) {
    enableToggle.checked = config.enabled;
    conflictSelect.value = config.conflictAction;
    rows = rowsFromMapping(config.folderExtensionMapping);
    renderMappings();
}

function collectConfig() {
    return {
        enabled: enableToggle.checked,
        conflictAction: conflictSelect.value,
        folderExtensionMapping: mappingFromRows()
    };
}

function flash(btn, text) {
    const original = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
    }, 1200);
}

// --- Modal ---
function openModal() {
    folderNameInput.value = '';
    extensionsInput.value = '';
    modal.style.display = 'block';
    folderNameInput.focus();
}

function closeModal() {
    modal.style.display = 'none';
}

// --- Wiring ---
addMappingBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

modalAddBtn.addEventListener('click', () => {
    const folder = folderNameInput.value.trim();
    if (!folder) {
        folderNameInput.focus();
        return;
    }
    rows.push({ folder, extensions: extensionsInput.value.trim() });
    renderMappings();
    closeModal();
});

saveBtn.addEventListener('click', async () => {
    await saveConfig(collectConfig());
    flash(saveBtn, 'Saved!');
});

cancelBtn.addEventListener('click', async () => {
    applyConfig(await loadConfig());
});

resetBtn.addEventListener('click', async () => {
    if (!confirm('Reset all settings to default? This cannot be undone.')) return;
    applyConfig(await resetConfig());
});

exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(collectConfig(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download-categorizer-settings.json';
    a.click();
    URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
        const imported = JSON.parse(await file.text());
        applyConfig({ ...defaultConfig, ...imported });
        flash(importBtn, 'Imported — remember to Save');
    } catch {
        alert('Invalid settings file.');
    } finally {
        importFile.value = '';
    }
});

// --- Init ---
applyConfig(await loadConfig());
