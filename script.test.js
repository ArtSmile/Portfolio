const test = require('node:test');
const assert = require('node:assert');

// Mocks for browser globals
global.document = {
    addEventListener: () => {},
    createElement: () => ({ classList: { add: () => {}, remove: () => {} }, style: { setProperty: () => {} } }),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    body: { appendChild: () => {} }
};
global.sessionStorage = {
    getItem: () => null,
    setItem: () => {}
};

if (typeof TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
}

const { sha256 } = require('./script.js');

test('sha256 function tests', async (t) => {
    await t.test('should correctly hash a known string', async () => {
        const hash = await sha256('test');
        assert.strictEqual(hash, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    });

    await t.test('should return different hashes for different inputs', async () => {
        const hash1 = await sha256('hello');
        const hash2 = await sha256('world');
        assert.notStrictEqual(hash1, hash2);
    });

    await t.test('should return deterministic results for same input', async () => {
        const hash1 = await sha256('deterministic');
        const hash2 = await sha256('deterministic');
        assert.strictEqual(hash1, hash2);
    });

    await t.test('should handle empty string', async () => {
        const hash = await sha256('');
        assert.strictEqual(hash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });
});
