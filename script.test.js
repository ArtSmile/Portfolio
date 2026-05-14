const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const crypto = require('crypto');

// Mock browser globals so the script can evaluate without crashing
global.document = {
    addEventListener: () => {},
    createElement: () => {},
    body: { appendChild: () => {} },
    getElementById: () => {},
    querySelector: () => {},
    querySelectorAll: () => [],
};
global.window = {
    addEventListener: () => {},
};
global.sessionStorage = {
    getItem: () => {},
    setItem: () => {},
};

if (!global.crypto) {
    global.crypto = crypto.webcrypto;
}

// Evaluate script.js
const scriptContent = fs.readFileSync('./script.js', 'utf8');
eval(scriptContent);

test('sha256 function tests', async (t) => {
    await t.test('computes correct hash for a standard string', async () => {
        const hash = await sha256('password');
        assert.strictEqual(hash, '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');
    });

    await t.test('computes correct hash for an empty string', async () => {
        const hash = await sha256('');
        assert.strictEqual(hash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    await t.test('computes correct hash for string with special characters', async () => {
        const hash = await sha256('!@#$%^&*()_+');
        const expected = crypto.createHash('sha256').update('!@#$%^&*()_+').digest('hex');
        assert.strictEqual(hash, expected);
    });

    await t.test('computes correct hash for unicode characters', async () => {
        const hash = await sha256('🚀🌍');
        const expected = crypto.createHash('sha256').update('🚀🌍').digest('hex');
        assert.strictEqual(hash, expected);
    });

    await t.test('handles non-string inputs safely (undefined/null/numbers)', async () => {
        // TextEncoder.encode() treats undefined as an empty string (or empty ArrayBuffer)
        const hashUndefined = await sha256(undefined);
        const expectedUndefined = crypto.createHash('sha256').update('').digest('hex');
        assert.strictEqual(hashUndefined, expectedUndefined);

        // numbers are converted to string
        const hashNumber = await sha256(12345);
        const expectedNumber = crypto.createHash('sha256').update('12345').digest('hex');
        assert.strictEqual(hashNumber, expectedNumber);

        // null is converted to "null"
        const hashNull = await sha256(null);
        const expectedNull = crypto.createHash('sha256').update('null').digest('hex');
        assert.strictEqual(hashNull, expectedNull);
    });
});
