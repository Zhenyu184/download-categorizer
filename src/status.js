import { defaultConfig } from './default.js';
import { Logger } from './misc.js';

export class StatusHandler {
    static #instance = null;

    constructor() {
        if (StatusHandler.#instance) {
            return StatusHandler.#instance;
        }

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
            globalConflictAction: this.conflictAction
        }, () => {});
    }

    getConflictAction() {
        return this.conflictAction;
    }

    setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local' && changes.globalConflictAction) {
                const newValue = changes.globalConflictAction.newValue;
                if (newValue !== this.conflictAction) {
                    this.conflictAction = newValue;
                }
            }
        });
    }
}
