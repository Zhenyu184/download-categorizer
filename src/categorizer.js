import { defaultConfig } from './default.js';

export class Categorizer {
    static #instance = null;

    constructor() {
        if (Categorizer.#instance) {
            return Categorizer.#instance;
        }
        
        this.mapping = defaultConfig.folderExtensionMapping;
        Categorizer.#instance = this;
    }

    static getInstance() {
        if (!Categorizer.#instance) {
            Categorizer.#instance = new Categorizer();
        }
        return Categorizer.#instance;
    }

    addMapping(key, value) {
        if (this.mapping[key]) return false;
        this.mapping[key] = value;
        return true;
    }

    updateMappingKey(currentKey, newKey) {
        if (!this.mapping[currentKey]) return false;
        this.mapping[newKey] = this.mapping[currentKey];
        delete this.mapping[currentKey];
        return true;
    }

    updateMappingValue(key, newValue) {
        if (!this.mapping[key]) return false;
        this.mapping[key] = newValue;
        return true;
    }

    categorize(target) {
        for (const [key, value] of Object.entries(this.mapping)) {
            if (!value.includes(target)) continue;
            return key;
        }
        return undefined;
    }
}

