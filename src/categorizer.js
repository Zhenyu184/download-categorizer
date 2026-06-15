export class Categorizer {
    static #instance = null;

    #mapping = {};

    static getInstance() {
        if (!Categorizer.#instance) {
            Categorizer.#instance = new Categorizer();
        }
        return Categorizer.#instance;
    }

    setMapping(mapping) {
        this.#mapping = mapping ?? {};
    }

    /** Return the folder a given extension maps to, or undefined if none. */
    categorize(extension) {
        if (!extension) return undefined;
        for (const [folder, extensions] of Object.entries(this.#mapping)) {
            // Guard against malformed mappings (non-array values): a stray
            // value would otherwise throw on .includes() and break every download.
            if (Array.isArray(extensions) && extensions.includes(extension)) return folder;
        }
        return undefined;
    }
}
