import { loadConfig, onConfigChanged } from './config.js';
import { Categorizer } from './categorizer.js';
import { Logger, FileUtils } from './misc.js';

class DownloadHandler {
    #config = null;
    #categorizer = Categorizer.getInstance();
    #ready;

    constructor() {
        // Kick off the async config load, but register listeners synchronously:
        // an MV3 service worker may be woken *by* the download event, and
        // listeners added after an await can miss it.
        this.#ready = this.#init();
        this.#registerListeners();
    }

    async #init() {
        this.#config = await loadConfig();
        this.#categorizer.setMapping(this.#config.folderExtensionMapping);
        onConfigChanged((config) => {
            this.#config = config;
            this.#categorizer.setMapping(config.folderExtensionMapping);
        });
    }

    #registerListeners() {
        chrome.downloads.onCreated.addListener((item) => this.#onCreated(item));
        chrome.downloads.onChanged.addListener((delta) => this.#onChanged(delta));
        chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
            this.#onDeterminingFilename(item, suggest);
            return true; // we respond to suggest() asynchronously
        });
    }

    #onCreated(downloadItem) {
        Logger.log(`[DownloadHandler] created id=${downloadItem.id} url=${downloadItem.url}`);
    }

    async #onChanged(delta) {
        if (delta.state?.current !== 'complete') return;
        const [item] = await chrome.downloads.search({ id: delta.id });
        if (!item) return;
        Logger.log(`[DownloadHandler] complete id=${delta.id} file=${item.filename}`);
    }

    async #onDeterminingFilename(downloadItem, suggest) {
        // Any throw here (e.g. a malformed mapping that slipped into storage)
        // must still end in a suggest() call — returning true without ever
        // calling suggest() leaves the download's filename determination hung.
        try {
            await this.#ready;

            const extension = FileUtils.getExtension(downloadItem.filename);
            const targetFolder = this.#categorizer.categorize(extension);

            if (!targetFolder) {
                suggest();
                return;
            }

            const filename = `${targetFolder}/${downloadItem.filename}`;
            Logger.log(`[DownloadHandler] redirect → ${filename}`);
            suggest({ filename, conflictAction: this.#config.conflictAction });
        } catch (err) {
            Logger.error('[DownloadHandler] onDeterminingFilename failed, falling back to default', err);
            suggest(); // fall back to Chrome's default behaviour; never hang the download
        }
    }
}

new DownloadHandler();
