import { defaultConfig } from '../src/default.js';
import { loadConfig, saveConfig, resetConfig } from '../src/config.js';
import { localizePage, t } from '../src/i18n.js';

// 翻譯靜態畫面（標題、區段標題、按鈕、衝突處理下拉選單等）。
localizePage();

// 側欄版本資訊：從 manifest 讀取，避免在多處寫死版本號。
const versionEl = document.getElementById('app-version');
if (versionEl) {
    const { version } = chrome.runtime.getManifest();
    versionEl.textContent = t('versionLabel', [version]) || `v${version}`;
}

// --- 左側分類導覽：點擊切換右側面板 ---
const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.panel');
navItems.forEach((item) => {
    item.addEventListener('click', () => {
        navItems.forEach((n) => n.classList.toggle('active', n === item));
        panels.forEach((p) => { p.hidden = p.id !== item.dataset.target; });
    });
});

// --- Elements ---
const conflictSelect  = document.getElementById('conflict-action');
const mappingList     = document.getElementById('mapping-list');
const conflictsBox    = document.getElementById('mapping-conflicts');
const invalidBox      = document.getElementById('mapping-invalid');
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
// 副檔名欄位只接受英文大小寫、數字、逗號、句點與空白；其餘字元視為非法。
// 全域版供 match() 蒐集所有非法字元；無 g 旗標版供 test()（避免 lastIndex 狀態問題）。
const EXTENSIONS_ILLEGAL = /[^A-Za-z0-9., ]/g;
const hasIllegalChars = (text) => /[^A-Za-z0-9., ]/.test(text);

function parseExtensions(text) {
    return [...new Set(
        text.split(',')
            .map((e) => e.trim().toLowerCase().replace(/^\./, ''))
            .filter(Boolean)
    )];
}

// 資料夾名稱採「黑名單」而非白名單：允許任何 Unicode 文字（中文／日文／
// 韓文／…），只擋掉跨檔案系統真正非法、或會被 Chrome downloads API 拒絕的
// 字元與模式。白名單會把非拉丁語系名稱全部誤判為非法，違背多國語言需求。
//   - \ / : * ? " < > | 與控制字元：Windows/macOS/Linux 共同的保留字元
//   - "." 與 ".."：相對路徑保留名，會被 suggest() 拒絕
//   - 結尾為句點：Windows 會自動裁掉，造成名稱與設定漂移
const FOLDER_ILLEGAL_CHARS = /[\\/:*?"<>|\x00-\x1F]/g;

// 回傳資料夾名稱的問題（{ chars } / { reserved } / { trailing }），無問題回 null。
function folderNameIssue(rawName) {
    const name = String(rawName).trim();
    if (!name) return null; // 空列於儲存時被略過，不視為錯誤
    const bad = name.match(FOLDER_ILLEGAL_CHARS);
    if (bad) return { chars: [...new Set(bad)] };
    if (name === '.' || name === '..') return { reserved: name };
    if (name.endsWith('.')) return { trailing: '.' };
    return null;
}

const VALID_CONFLICT_ACTIONS = ['uniquify', 'overwrite', 'prompt'];

// Coerce an untrusted parsed object (e.g. an imported file) into a valid config.
// Guarantees conflictAction is whitelisted and folderExtensionMapping is a plain
// object whose every value is a sanitized string array — so a malformed import
// can never reach storage and break the background's categorizer.
function sanitizeConfig(raw) {
    if (!raw || typeof raw !== 'object') throw new Error('not an object');

    const conflictAction = VALID_CONFLICT_ACTIONS.includes(raw.conflictAction)
        ? raw.conflictAction
        : defaultConfig.conflictAction;

    const mapping = {};
    const rawMapping = raw.folderExtensionMapping;
    if (rawMapping && typeof rawMapping === 'object' && !Array.isArray(rawMapping)) {
        for (const [folder, exts] of Object.entries(rawMapping)) {
            const name = String(folder).trim();
            if (!name || folderNameIssue(name) || !Array.isArray(exts)) continue;
            mapping[name] = parseExtensions(exts.map((e) => String(e)).join(','));
        }
    }
    if (Object.keys(mapping).length === 0) throw new Error('no valid mappings');

    return { conflictAction, folderExtensionMapping: mapping };
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
        folderInput.placeholder = t('folderNameRowPlaceholder');
        folderInput.classList.toggle('input-invalid', !!folderNameIssue(row.folder));
        folderInput.addEventListener('input', () => {
            row.folder = folderInput.value;
            folderInput.classList.toggle('input-invalid', !!folderNameIssue(folderInput.value));
            validate();
        });

        const extInput = document.createElement('input');
        extInput.type = 'text';
        extInput.className = 'form-input';
        extInput.value = row.extensions;
        extInput.placeholder = t('extensionsRowPlaceholder');
        extInput.classList.toggle('input-invalid', hasIllegalChars(row.extensions));
        extInput.addEventListener('input', () => {
            row.extensions = extInput.value;
            extInput.classList.toggle('input-invalid', hasIllegalChars(extInput.value));
            validate();
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger';
        removeBtn.textContent = t('remove');
        removeBtn.addEventListener('click', () => {
            rows.splice(index, 1);
            renderMappings();
        });

        item.append(folderInput, extInput, removeBtn);
        mappingList.appendChild(item);
    });

    validate();
}

// 偵測含有非法字元的副檔名欄位（僅檢查會被儲存的列，即資料夾名稱非空者），
// 回傳每列的資料夾名稱與出現過的非法字元。
function detectInvalidExtensions() {
    const result = [];
    for (const { folder, extensions } of rows) {
        const name = folder.trim();
        if (!name) continue;
        const bad = extensions.match(EXTENSIONS_ILLEGAL);
        if (bad) result.push({ folder: name, chars: [...new Set(bad)] });
    }
    return result;
}

// 偵測名稱非法的資料夾列。把每種問題都化為一組「示意字元」以沿用同一種提示
// 樣式：非法字元列出該字元；保留名（. / ..）列出名稱本身；結尾句點列出 "."。
function detectInvalidFolders() {
    const result = [];
    for (const { folder } of rows) {
        const issue = folderNameIssue(folder);
        if (!issue) continue;
        const chars = issue.chars ?? [issue.reserved ?? issue.trailing];
        result.push({ folder: folder.trim(), chars });
    }
    return result;
}

// 沿用「重複副檔名提示」的樣式輸出一個提示區塊（標題 + 清單）。
function appendInvalidBlock(titleText, items) {
    const title = document.createElement('p');
    title.textContent = titleText;
    invalidBox.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'conflict-list';
    for (const { folder, chars } of items) {
        const li = document.createElement('li');

        const folderStrong = document.createElement('strong');
        folderStrong.textContent = folder;

        const charsCode = document.createElement('code');
        charsCode.textContent = chars.join(' ');

        li.append(folderStrong, ' → ', charsCode);
        list.appendChild(li);
    }
    invalidBox.appendChild(list);
}

// 有非法資料夾名稱或非法副檔名時顯示提示並停用儲存按鈕。
function renderInvalid() {
    const badFolders = detectInvalidFolders();
    const badExtensions = detectInvalidExtensions();
    invalidBox.replaceChildren();
    saveBtn.disabled = badFolders.length > 0 || badExtensions.length > 0;

    if (badFolders.length === 0 && badExtensions.length === 0) {
        invalidBox.hidden = true;
        return;
    }
    invalidBox.hidden = false;

    // fallback：若該語系訊息缺漏或 i18n 快取尚未更新，至少顯示英文提示而非空白。
    if (badFolders.length > 0) {
        appendInvalidBlock(
            t('folderNameInvalidNotice')
                || 'These folder names are not allowed (cannot contain \\ / : * ? " < > |, be "." or "..", or end with a space or period). Fix them before saving:',
            badFolders
        );
    }
    if (badExtensions.length > 0) {
        appendInvalidBlock(
            t('extensionsInvalidNotice')
                || 'These extensions contain characters that are not allowed (only letters, numbers, commas, periods and spaces). Fix them before saving:',
            badExtensions
        );
    }
}

// 統一的即時驗證入口：重複副檔名提示 + 非法字元提示/停用儲存。
function validate() {
    renderConflicts();
    renderInvalid();
}

// Detect extensions that appear in more than one folder. Iteration follows
// `rows` order, which mirrors how Categorizer resolves a match top-to-bottom,
// so the first folder in each list is the one that actually wins.
function detectConflicts() {
    const extToFolders = new Map();
    for (const { folder, extensions } of rows) {
        const name = folder.trim();
        if (!name) continue;
        for (const ext of parseExtensions(extensions)) {
            if (!extToFolders.has(ext)) extToFolders.set(ext, []);
            const folders = extToFolders.get(ext);
            if (!folders.includes(name)) folders.push(name);
        }
    }
    return [...extToFolders.entries()]
        .filter(([, folders]) => folders.length > 1)
        .map(([ext, folders]) => ({ ext, folders }));
}

function renderConflicts() {
    const conflicts = detectConflicts();
    conflictsBox.replaceChildren();

    if (conflicts.length === 0) {
        conflictsBox.hidden = true;
        return;
    }
    conflictsBox.hidden = false;

    const title = document.createElement('p');
    const count = String(conflicts.length);
    title.textContent = conflicts.length === 1
        ? t('conflictNoticeOne', [count])
        : t('conflictNoticeMany', [count]);
    conflictsBox.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'conflict-list';
    for (const { ext, folders } of conflicts) {
        const [winner, ...others] = folders;
        const li = document.createElement('li');

        const extCode = document.createElement('code');
        extCode.textContent = ext;

        const winnerStrong = document.createElement('strong');
        winnerStrong.textContent = winner;

        li.append(extCode, ' → ', winnerStrong, ' ' + t('conflictAlsoIn', [others.join(', ')]));
        list.appendChild(li);
    }
    conflictsBox.appendChild(list);
}

function applyConfig(config) {
    conflictSelect.value = config.conflictAction;
    rows = rowsFromMapping(config.folderExtensionMapping);
    renderMappings();
}

function collectConfig() {
    return {
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

// Save / Cancel act ONLY on the folder mapping. Conflict action and
// import/export/reset persist immediately on their own (below), so here we
// merge just the mapping into the stored config and leave everything else.
saveBtn.addEventListener('click', async () => {
    const config = await loadConfig();
    config.folderExtensionMapping = mappingFromRows();
    await saveConfig(config);
    flash(saveBtn, t('saved'));
});

cancelBtn.addEventListener('click', async () => {
    const config = await loadConfig();
    rows = rowsFromMapping(config.folderExtensionMapping);
    renderMappings();
});

// Advanced Settings: conflict action is applied immediately (no Save needed).
conflictSelect.addEventListener('change', async () => {
    const config = await loadConfig();
    config.conflictAction = conflictSelect.value;
    await saveConfig(config);
});

resetBtn.addEventListener('click', async () => {
    if (!confirm(t('resetConfirm'))) return;
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
        // Validate + sanitize before persisting: a malformed file must never
        // reach storage (it would otherwise crash the background categorizer).
        const clean = sanitizeConfig(imported);
        await saveConfig(clean);
        applyConfig(clean);
        flash(importBtn, t('imported'));
    } catch {
        alert(t('invalidSettingsFile'));
    } finally {
        importFile.value = '';
    }
});

// --- Init ---
applyConfig(await loadConfig());
