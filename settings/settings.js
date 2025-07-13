const switchBtn = document.getElementById('global-enable');

chrome.storage.local.get(['globalEnabled'], (result) => {
    const enabled = (result.globalEnabled !== undefined) ? result.globalEnabled : true;
    switchBtn.checked = enabled;
});

switchBtn.addEventListener('change', () => {
    chrome.storage.local.set({ globalEnabled: switchBtn.checked });
});


