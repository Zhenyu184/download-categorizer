export class Logger {
    static #getLocation() {
        const err = new Error();
        const stackLines = err.stack.split('\n');
        const callerLine = stackLines[3] || '';
        const match = callerLine.match(/at\s+(?:.*\()?(.+):(\d+):\d+\)?/);
        let location = '';
        if (match) {
            const filePath = match[1].split(/[\\/]/).pop();
            const lineNumber = match[2];
            location = `[${filePath}:${lineNumber}]`;
        }
        return location;
    }

    static log(...args) {
        console.log(this.#getLocation(), ...args);
    }

    static info(...args) {
        console.info(this.#getLocation(), ...args);
    }

    static warn(...args) {
        console.warn(this.#getLocation(), ...args);
    }

    static error(...args) {
        console.error(this.#getLocation(), ...args);
    }
}

export class FileUtils {
    static getExtension(filename) {
        if (!filename) return '';
        const parts = filename.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    }
}
