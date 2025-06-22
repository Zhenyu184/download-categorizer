import { Categorizer } from './src/categorizer.js';
import * as misc from './src/misc.js';

class DownloadHandler {
    constructor(categorizer) {
        this.enabled = true;
        this.categorizer = categorizer;
        this.registerConfigers();
        this.registerListeners();
    }

    registerConfigers() {
        chrome.storage.sync.get({ categorizerEnabled: true }, this.initEnabled.bind(this));
        chrome.storage.onChanged.addListener(this.setEnabled.bind(this));
    }

    initEnabled (data) {
        console.log(`[DownloadHandler] initial categorizer enabled state: ${data.categorizerEnabled}`);
        this.enabled = data.categorizerEnabled;
    }

    setEnabled (changes, area) {
        console.log(`[DownloadHandler] storage change detected in area: ${area}`, changes);
        if (area === 'sync' && changes.categorizerEnabled) {
            this.enabled = changes.categorizerEnabled.newValue;
        }
    }

    registerListeners() {
        chrome.downloads.onCreated.addListener(this.onCreated.bind(this));
        chrome.downloads.onChanged.addListener(this.onChanged.bind(this));
        chrome.downloads.onDeterminingFilename.addListener(this.onDeterminingFilename.bind(this));
    }

    onCreated(downloadItem) {
        console.info(`[DownloadHandler] create download item, ID: ${downloadItem.id}, URL: ${downloadItem.url}, time: ${new Date()}`);
    }

    onChanged(DownloadDelta) {
        if (DownloadDelta.state && DownloadDelta.state.current === 'complete') {
            chrome.downloads.search({ id: DownloadDelta.id }, (results) => {
                if (results && results.length > 0) {
                    const item = results[0];
                    console.log(`[DownloadHandler] download complete ID: ${DownloadDelta.id}, filename: ${item.filename}, state: ${item.state}`);
                }
            });
        }
    }

    onDeterminingFilename(downloadItem, suggest) {
        if (!this.enabled) {
            suggest({
                filename: downloadItem.filename
            });
            return;
        }

        const extension = misc.getExtension(downloadItem.filename);
        const targetFolder = this.categorizer.categorize(extension);

        if (!targetFolder || !extension) {
            suggest({
                filename: downloadItem.filename
            });
            return;
        }

        const newFilename = `${targetFolder}/${downloadItem.filename}`;
        console.log(`[DownloadHandler] redirect file path: ${newFilename}`);

        suggest({
            filename: newFilename,
            conflictAction: 'uniquify'
        });
    }
}

const categorizer = new Categorizer();
new DownloadHandler(categorizer);