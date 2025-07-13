const switchBtn = document.getElementById('global-enable');
const conflictSelect = document.getElementById('conflict-action');

// on load
chrome.storage.local.get(['globalEnabled'], (result) => {
    const enabled = (result.globalEnabled !== undefined) ? result.globalEnabled : true;
    switchBtn.checked = enabled;
});

chrome.storage.local.get(['conflictAction'], (result) => {
    if (result.conflictAction) {
        conflictSelect.value = result.conflictAction;
    }
});

// save in change
switchBtn.addEventListener('change', () => {
    chrome.storage.local.set({ globalEnabled: switchBtn.checked });
});

conflictSelect.addEventListener('change', () => {
    chrome.storage.local.set({ conflictAction: conflictSelect.value });
});


