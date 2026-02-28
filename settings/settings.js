const conflictSelect = document.getElementById('conflict-action');

// on load
chrome.storage.local.get(['conflictAction'], (result) => {
    if (result.conflictAction) {
        conflictSelect.value = result.conflictAction;
    }
});

// save in change
conflictSelect.addEventListener('change', () => {
    chrome.storage.local.set({ conflictAction: conflictSelect.value });
});
