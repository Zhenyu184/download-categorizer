# Download Categorizer
![GitHub license](https://img.shields.io/github/license/Zhenyu184/download-categorizer?style=flat-square) ![GitHub issues](https://img.shields.io/github/issues/Zhenyu184/download-categorizer?style=flat-square)

A Chrome extension that automatically categorizes downloaded files into folders based on their file extensions.

<br>

## Features

- 🚀 **Auto Categorization**: Automatically sorts downloaded files into corresponding folders based on file extension
- 🗂️ **Multiple Categories**: Supports many common formats including music, video, photo, programs, archives, documents, and more
- 💾 **Persistent Settings**: The enable/disable state of the categorization feature is automatically saved to browser sync storage
- 🛡️ **Open Source**: Licensed under [GPLv3](LICENSE)

<br>

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** in the top-right corner
4. Click **Load unpacked** and select the project folder

![Chrome Extensions page](readme_img/img1.png)

<br>

## Category Rules

Category rules are defined in [`src/default.js`](src/default.js). The following types are supported by default:

| Category  | Example Extensions                                                          |
|-----------|-----------------------------------------------------------------------------|
| music     | mp3, wav, flac, aac, ogg, m4a, alac, aiff, wma, opus                       |
| video     | mp4, mkv, avi, mov, wmv, flv, webm, mpeg, mpg, ts, m4v                     |
| photo     | jpg, jpeg, png, gif, bmp, tiff, heic, heif, raw, cr2, nef, orf, sr2        |
| image     | img, iso, dmg                                                               |
| install   | exe, msi, apk, dmg, pkg, sh, deb, rpm, bat, run, jar, dpkg, qpkg           |
| program   | c, cpp, h, hpp, cc, cs, java, py, js, mjs, cjs, ts, rb, go, rs, swift, ... |
| document  | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, odt, ods, odp, rtf, tex, csv   |
| compress  | zip, rar, 7z, tar, gz, bz2, xz, iso, lz, lzma, zst, tgz, tar.gz, tar.bz2  |

<br>

## Development & Contributing

1. Fork and clone this repository
2. Make your changes and submit a Pull Request
3. Feel free to open an issue to report bugs or suggest new features

<br>

## Related Links

- [GitHub Repository](https://github.com/Zhenyu184/download-collector)
- [GPLv3 License](LICENSE)
- [FAQ](docs/FAQ.md)

<br>

## Contact

If you have any questions, feel free to leave a comment on [GitHub Issues](https://github.com/Zhenyu184/download-collector/issues).
Thank you for using Download Categorizer! 🎉
