import { defaultConfig } from './default.js';
import { Logger } from './misc.js';

export class StatusHandler {
    static #instance = null;

    constructor() {
        if (StatusHandler.#instance) {
            return StatusHandler.#instance;
        }
        
        this.enabled = defaultConfig.globalStatus.enable;
        this.conflictAction = defaultConfig.globalStatus.conflictAction;
        this.saveAllToStorage();
        this.setupStorageListener();
        StatusHandler.#instance = this;
    }

    static getInstance() {
        if (!StatusHandler.#instance) {
            StatusHandler.#instance = new StatusHandler();
        }
        return StatusHandler.#instance;
    }

    saveAllToStorage() {
        chrome.storage.local.set({
            globalEnabled: this.enabled,
            globalConflictAction: this.conflictAction
        }, () => {});
    }

    getEnabled() {
        return this.enabled;
    }

    getConflictAction() {
        return this.conflictAction;
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
            if (areaName === 'local' && changes.globalConflictAction) {
                const newValue = changes.globalConflictAction.newValue;
                const oldValue = changes.globalConflictAction.oldValue;
                
                if (newValue !== this.conflictAction) {
                    this.conflictAction = newValue;
                }
            }
        });
    }
}