// Dependency-free regression test for the config + categorizer logic.
// Run with:  node test/logic.test.mjs
//
// Mocks the chrome.storage API so the real src/ modules can be imported and
// exercised under Node. Covers the bugs fixed in the storage.sync refactor:
// single-key config, default merging, change notifications, and categorization.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

// --- Mock chrome.storage.sync + onChanged ---
const store = {};
const listeners = [];
globalThis.chrome = {
    storage: {
        sync: {
            async get(key) { return key in store ? { [key]: store[key] } : {}; },
            async set(obj) {
                for (const [k, v] of Object.entries(obj)) {
                    const oldValue = store[k];
                    store[k] = v;
                    listeners.forEach((f) => f({ [k]: { oldValue, newValue: v } }, 'sync'));
                }
            },
            async remove(key) {
                const oldValue = store[key];
                delete store[key];
                listeners.forEach((f) => f({ [key]: { oldValue, newValue: undefined } }, 'sync'));
            }
        },
        onChanged: { addListener(f) { listeners.push(f); } }
    }
};

const { defaultConfig, STORAGE_KEY } = await import(`${srcDir}/default.js`);
const { loadConfig, saveConfig, resetConfig, onConfigChanged } = await import(`${srcDir}/config.js`);
const { Categorizer } = await import(`${srcDir}/categorizer.js`);

let pass = 0, fail = 0;
const ok = (name, cond) => { (cond ? pass++ : fail++); console.log(`${cond ? '✓' : '✗ FAIL'}  ${name}`); };

// config module
const c1 = await loadConfig();
ok('loadConfig returns defaults when empty', c1.conflictAction === 'uniquify' && !!c1.folderExtensionMapping.music);

await saveConfig({ ...defaultConfig, conflictAction: 'overwrite' });
ok('saveConfig persists under single "config" key', STORAGE_KEY === 'config' && store.config.conflictAction === 'overwrite');

const c3 = await loadConfig();
ok('loadConfig merges stored over defaults', c3.conflictAction === 'overwrite' && !!c3.folderExtensionMapping.video);

let observed = null;
onConfigChanged((cfg) => { observed = cfg; });
await saveConfig({ ...defaultConfig, folderExtensionMapping: { docs: ['pdf'] } });
ok('onConfigChanged delivers merged config on sync change', observed && observed.folderExtensionMapping.docs[0] === 'pdf');

const c5 = await resetConfig();
ok('resetConfig clears storage and returns defaults', !('config' in store) && c5.conflictAction === 'uniquify');

// categorizer
const cat = Categorizer.getInstance();
cat.setMapping(defaultConfig.folderExtensionMapping);
ok('categorize: mp3 -> music', cat.categorize('mp3') === 'music');
ok('categorize: pdf -> document', cat.categorize('pdf') === 'document');
ok('categorize: unknown ext -> undefined', cat.categorize('xyz') === undefined);
ok('categorize: empty ext -> undefined', cat.categorize('') === undefined);
ok('Categorizer.getInstance is a singleton', Categorizer.getInstance() === cat);

cat.setMapping(null);
ok('setMapping(null) is safe and yields undefined', cat.categorize('mp3') === undefined);

// Malformed mapping (non-array values) must not throw — guards the background
// against a bad import bricking every download.
cat.setMapping({ broken: null, also: 42, good: ['pdf'] });
let threw = false;
try { ok('categorize skips non-array values', cat.categorize('pdf') === 'good'); }
catch { threw = true; }
ok('categorize never throws on malformed mapping', !threw);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
