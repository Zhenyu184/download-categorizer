import { defaultConfig, STORAGE_KEY } from './default.js';

/**
 * Shared, Promise-based access to the extension config.
 * The whole config lives under a single key in chrome.storage.sync,
 * so popup / settings / background can never drift out of sync on key names.
 */

export async function loadConfig() {
    const stored = await chrome.storage.sync.get(STORAGE_KEY);
    return { ...defaultConfig, ...stored[STORAGE_KEY] };
}

export async function saveConfig(config) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: config });
}

export async function resetConfig() {
    await chrome.storage.sync.remove(STORAGE_KEY);
    return { ...defaultConfig };
}

/** Subscribe to config changes; callback receives the merged config. */
export function onConfigChanged(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync' || !changes[STORAGE_KEY]) return;
        callback({ ...defaultConfig, ...changes[STORAGE_KEY].newValue });
    });
}
