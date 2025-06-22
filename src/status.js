import { defaultConfig } from './default.js';
import { Logger } from './misc.js';

export class StatusHandler {
    static #instance = null;

    constructor() {
        if (StatusHandler.#instance) {
            return StatusHandler.#instance;
        }
        
        this.enabled = defaultConfig.globalStatus.enable;
        this.saveToStorage();
        this.setupStorageListener();
        StatusHandler.#instance = this;
    }

    static getInstance() {
        if (!StatusHandler.#instance) {
            StatusHandler.#instance = new StatusHandler();
        }
        return StatusHandler.#instance;
    }

    saveToStorage() {
        chrome.storage.local.set({ globalEnabled: this.enabled }, () => {});
    }

    getEnabled() {
        return this.enabled;
    }

    setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local' && changes.globalEnabled) {
                const newValue = changes.globalEnabled.newValue;
                const oldValue = changes.globalEnabled.oldValue;
                
                if (newValue !== this.enabled) {
                    this.enabled = newValue;
                }
            }
        });
    }
}