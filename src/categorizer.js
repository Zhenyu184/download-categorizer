const defaultFolderExtensionMapping = {
    music: [
        'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'alac', 'aiff', 'wma', 'opus'
    ],
    video: [
        'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mpeg', 'mpg', 'ts', 'm4v'
    ],
    photo: [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'heic', 'heif', 'raw', 'cr2', 'nef', 'orf', 'sr2'
    ],
    image: [
        'img', 'iso', 'dmg'
    ],
    program: [
        'c', 'cpp', 'h', 'hpp', 'cc', 'cs', 'java', 'py', 'js', 'mjs', 'cjs', 'ts', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'md', 'json', 'yaml', 'yml', 'xml', 'html', 'css', 'scss'
    ],
    install: [
        'exe', 'msi', 'apk', 'dmg', 'pkg', 'sh', 'deb', 'rpm', 'bat', 'run', 'jar', 'dpkg', 'qpkg',
    ],
    document: [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'odt', 'ods', 'odp', 'rtf', 'tex', 'csv', 'log'
    ],
    compress: [
        'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'lz', 'lzma', 'zst', 'tgz', 'tar.gz', 'tar.bz2'
    ]
};

export class Categorizer {
    constructor(mapping = defaultFolderExtensionMapping) {
        this.mapping = mapping;
    }

    categorize(target) {
        for (const [key, value] of Object.entries(this.mapping)) {
            if (!value.includes(target)) continue;
            return key;
        }
    }
}

