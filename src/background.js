import { defaultConfig }       from './default.js';
import { Categorizer }         from './categorizer.js';
import { Logger, FileUtils }   from './misc.js';
import { StatusHandler } from './status.js';

class DownloadHandler {
    constructor() {
        this.statusHandler = StatusHandler.getInstance();
        this.categorizer = Categorizer.getInstance();
        this.registerListeners();
    }

    registerListeners() {
        chrome.downloads.onCreated.addListener(this.onCreated.bind(this));
        chrome.downloads.onChanged.addListener(this.onChanged.bind(this));
        chrome.downloads.onDeterminingFilename.addListener(this.onDeterminingFilename.bind(this));
    }

    onCreated(downloadItem) {
        Logger.log(`[DownloadHandler] create download item, ID: ${downloadItem.id}, URL: ${downloadItem.url}, time: ${new Date()}`);
    }

    onChanged(DownloadDelta) {
        if (DownloadDelta.state && DownloadDelta.state.current === 'complete') {
            chrome.downloads.search({ id: DownloadDelta.id }, (results) => {
                if (!results || results.length === 0) return;
                const item = results[0];
                Logger.log(`[DownloadHandler] download complete ID: ${DownloadDelta.id}, filename: ${item.filename}, state: ${item.state}`);
            });
        }
    }

    onDeterminingFilename(downloadItem, suggest) {
        if (this.statusHandler.getEnabled() === false) {
            suggest({
                filename: downloadItem.filename
            });
            return;
        }

        const extension = FileUtils.getExtension(downloadItem.filename);
        const targetFolder = this.categorizer.categorize(extension);

        if (!targetFolder || !extension) {
            suggest({
                filename: downloadItem.filename
            });
            return;
        }

        const newFilename = `${targetFolder}/${downloadItem.filename}`;
        Logger.log(`[DownloadHandler] redirect file path: ${newFilename}`);

        suggest({
            filename: newFilename,
            conflictAction: 'uniquify'
        });
    }
}

new DownloadHandler();
