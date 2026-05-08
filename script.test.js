const test = require('node:test');
const assert = require('node:assert');

// Mock browser globals
global.TextEncoder = require('util').TextEncoder;

// Improved DOM mock to track state
class MockElement {
    constructor(tag) {
        this.tagName = tag.toUpperCase();
        this._className = '';
        this.classList = {
            classes: new Set(),
            add: (cls) => {
                const parts = cls.split(' ');
                parts.forEach(p => {
                    if (p) this.classList.classes.add(p);
                });
            },
            remove: (cls) => {
                const parts = cls.split(' ');
                parts.forEach(p => {
                    if (p) this.classList.classes.delete(p);
                });
            },
            contains: (cls) => this.classList.classes.has(cls)
        };
        this.innerHTML = '';
        this.children = [];
    }

    get className() {
        return Array.from(this.classList.classes).join(' ');
    }

    set className(val) {
        this.classList.classes.clear();
        val.split(' ').forEach(p => {
            if (p) this.classList.classes.add(p);
        });
    }

    remove() {
        this.removed = true;
    }
    appendChild(child) {
        this.children.push(child);
    }
    addEventListener(event, cb) {}
    focus() {}
    style = {
        setProperty: (prop, val) => { this[prop] = val; }
    };
}

const body = new MockElement('body');
const main = new MockElement('main');
let elementsById = {};

global.document = {
    createElement: (tag) => new MockElement(tag),
    body: body,
    getElementById: (id) => {
        if (!elementsById[id]) {
            elementsById[id] = new MockElement('div');
        }
        return elementsById[id];
    },
    querySelector: (selector) => {
        if (selector === '.lock-screen') {
            return body.children.find(c => c.classList.contains('lock-screen') && !c.removed);
        }
        if (selector === 'main') return main;
        return null;
    },
    querySelectorAll: (selector) => [],
    addEventListener: (event, cb) => {}
};

global.sessionStorage = {
    data: {},
    setItem: (key, value) => { global.sessionStorage.data[key] = value; },
    getItem: (key) => global.sessionStorage.data[key] || null
};

global.setTimeout = (cb, ms) => cb();

const { sha256, VALID_HASH, createLockScreen, unlockPortfolio } = require('./script.js');

test('sha256 produces correct hash for known input', async () => {
    // SHA-256 for "password"
    const expected = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";
    const actual = await sha256("password");
    assert.strictEqual(actual, expected);
});

test('createLockScreen adds lock-screen to document body', () => {
    body.children = []; // reset
    createLockScreen();
    const lockScreen = body.children.find(c => c.classList.contains('lock-screen'));
    assert.ok(lockScreen, "Lock screen should be added to body");
    assert.strictEqual(lockScreen.tagName, 'DIV');
    assert.ok(lockScreen.classList.contains('lock-screen'), "Should have lock-screen class");
    assert.ok(lockScreen.classList.contains('fade-in'), "Should have fade-in class");
});

test('unlockPortfolio removes lock screen and marks main as unlocked', () => {
    // Setup: add a lock screen
    body.children = [];
    const lockScreen = new MockElement('div');
    lockScreen.classList.add('lock-screen');
    body.appendChild(lockScreen);

    main.classList.remove('unlocked');

    unlockPortfolio();

    assert.ok(lockScreen.removed, "Lock screen should be removed");
    assert.ok(main.classList.contains('unlocked'), "Main should have 'unlocked' class");
});
