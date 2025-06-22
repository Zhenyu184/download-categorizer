const btn = document.getElementById('toggle-switch');
const status = document.getElementById('status');

function updateUI(enabled) {
    btn.textContent = enabled ? 'Disable' : 'Enable';
    status.textContent = enabled ? 'Categorizer is ON' : 'Categorizer is OFF';
    status.style.color = enabled ? '#319795' : '#f27843';
}

chrome.storage.local.get(['globalEnabled'], (result) => {
    const currentEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
    updateUI(currentEnabled);
});

btn.addEventListener('click', () => {
    
    chrome.storage.local.get(['globalEnabled'], (result) => {
        const currentEnabled = result.globalEnabled !== undefined ? result.globalEnabled : true;
        const newEnabled = !currentEnabled;
        
        chrome.storage.local.set({ globalEnabled: newEnabled }, () => {
            updateUI(newEnabled);
        });
    });
});
