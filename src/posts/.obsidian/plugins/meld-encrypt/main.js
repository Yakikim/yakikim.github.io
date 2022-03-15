'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class DecryptModal extends obsidian.Modal {
    constructor(app, title, text = '') {
        super(app);
        this.decryptInPlace = false;
        this.text = text;
        this.titleEl.innerText = title;
    }
    onOpen() {
        let { contentEl } = this;
        const textEl = contentEl.createDiv().createEl('textarea', { text: this.text });
        textEl.style.width = '100%';
        textEl.style.height = '100%';
        textEl.rows = 10;
        textEl.readOnly = true;
        //textEl.focus(); // Doesn't seem to work here...
        setTimeout(() => { textEl.focus(); }, 100); //... but this does
        const btnContainerEl = contentEl.createDiv('');
        const decryptInPlaceBtnEl = btnContainerEl.createEl('button', { text: 'Decrypt in-place' });
        decryptInPlaceBtnEl.addEventListener('click', () => {
            this.decryptInPlace = true;
            this.close();
        });
        const cancelBtnEl = btnContainerEl.createEl('button', { text: 'Close' });
        cancelBtnEl.addEventListener('click', () => {
            this.close();
        });
    }
}

class PasswordModal extends obsidian.Modal {
    constructor(app, confirmPassword, defaultPassword = null) {
        super(app);
        this.password = null;
        this.defaultPassword = null;
        this.defaultPassword = defaultPassword;
        this.confirmPassword = confirmPassword;
    }
    onOpen() {
        var _a, _b;
        let { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('meld-e-password');
        if (obsidian.Platform.isMobile) {
            contentEl.addClass('meld-e-platform-mobile');
        }
        else if (obsidian.Platform.isDesktop) {
            contentEl.addClass('meld-e-platform-desktop');
        }
        /* Main password input row */
        const inputPwContainerEl = contentEl.createDiv({ cls: 'meld-e-row' });
        inputPwContainerEl.createSpan({ cls: 'meld-e-icon', text: '🔑' });
        const pwInputEl = inputPwContainerEl.createEl('input', { type: 'password', value: (_a = this.defaultPassword) !== null && _a !== void 0 ? _a : '' });
        pwInputEl.placeholder = 'Enter your password';
        pwInputEl.focus();
        if (obsidian.Platform.isMobile) {
            // Add 'Next' button for mobile
            const inputInputNextBtnEl = inputPwContainerEl.createEl('button', {
                text: '→',
                cls: 'meld-e-button-next'
            });
            inputInputNextBtnEl.addEventListener('click', (ev) => {
                inputPasswordHandler();
            });
        }
        /* End Main password input row */
        /* Confirm password input row */
        const confirmPwContainerEl = contentEl.createDiv({ cls: 'meld-e-row' });
        confirmPwContainerEl.createSpan({ cls: 'meld-e-icon', text: '🔑' });
        const pwConfirmInputEl = confirmPwContainerEl.createEl('input', {
            type: 'password',
            value: (_b = this.defaultPassword) !== null && _b !== void 0 ? _b : ''
        });
        pwConfirmInputEl.placeholder = 'Confirm your password';
        const messageEl = contentEl.createDiv({ cls: 'meld-e-message' });
        messageEl.hide();
        if (obsidian.Platform.isMobile) {
            // Add 'Next' button for mobile
            const confirmInputNextBtnEl = confirmPwContainerEl.createEl('button', {
                text: '→',
                cls: 'meld-e-button-next'
            });
            confirmInputNextBtnEl.addEventListener('click', (ev) => {
                confirmPasswordHandler();
            });
        }
        /* End Confirm password input row */
        const confirmPwButtonEl = contentEl.createEl('button', {
            text: 'Confirm',
            cls: 'meld-e-button-confirm'
        });
        confirmPwButtonEl.addEventListener('click', (ev) => {
            if (this.confirmPassword) {
                if (pwInputEl.value == pwConfirmInputEl.value) {
                    this.password = pwConfirmInputEl.value;
                    this.close();
                }
                else {
                    // passwords don't match
                    messageEl.setText('Passwords don\'t match');
                    messageEl.show();
                }
            }
            else {
                this.password = pwInputEl.value;
                this.close();
            }
        });
        const inputPasswordHandler = () => {
            if (this.confirmPassword) {
                // confim password
                pwConfirmInputEl.focus();
            }
            else {
                this.password = pwInputEl.value;
                this.close();
            }
        };
        const confirmPasswordHandler = () => {
            if (pwInputEl.value == pwConfirmInputEl.value) {
                this.password = pwConfirmInputEl.value;
                this.close();
            }
            else {
                // passwords don't match
                messageEl.setText('Passwords don\'t match');
                messageEl.show();
            }
        };
        pwConfirmInputEl.addEventListener('keypress', (ev) => {
            if ((ev.code === 'Enter' || ev.code === 'NumpadEnter')
                && pwConfirmInputEl.value.length > 0) {
                ev.preventDefault();
                confirmPasswordHandler();
            }
        });
        if (!this.confirmPassword) {
            confirmPwContainerEl.hide();
        }
        pwInputEl.addEventListener('keypress', (ev) => {
            if ((ev.code === 'Enter' || ev.code === 'NumpadEnter')
                && pwInputEl.value.length > 0) {
                ev.preventDefault();
                inputPasswordHandler();
            }
        });
    }
}

const vectorSize = 16;
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();
const iterations = 1000;
const salt = utf8Encoder.encode('XHWnDAT6ehMVY2zD');
class CryptoHelperV2 {
    deriveKey(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = utf8Encoder.encode(password);
            const key = yield crypto.subtle.importKey('raw', buffer, { name: 'PBKDF2' }, false, ['deriveKey']);
            const privateKey = crypto.subtle.deriveKey({
                name: 'PBKDF2',
                hash: { name: 'SHA-256' },
                iterations,
                salt
            }, key, {
                name: 'AES-GCM',
                length: 256
            }, false, ['encrypt', 'decrypt']);
            return privateKey;
        });
    }
    encryptToBase64(text, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.deriveKey(password);
            const textBytesToEncrypt = utf8Encoder.encode(text);
            const vector = crypto.getRandomValues(new Uint8Array(vectorSize));
            // encrypt into bytes
            const encryptedBytes = new Uint8Array(yield crypto.subtle.encrypt({ name: 'AES-GCM', iv: vector }, key, textBytesToEncrypt));
            const finalBytes = new Uint8Array(vector.byteLength + encryptedBytes.byteLength);
            finalBytes.set(vector, 0);
            finalBytes.set(encryptedBytes, vector.byteLength);
            //convert array to base64
            const base64Text = btoa(String.fromCharCode(...finalBytes));
            return base64Text;
        });
    }
    stringToArray(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i));
        }
        return new Uint8Array(result);
    }
    decryptFromBase64(base64Encoded, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let bytesToDecode = this.stringToArray(atob(base64Encoded));
                // extract iv
                const vector = bytesToDecode.slice(0, vectorSize);
                // extract encrypted text
                const encryptedTextBytes = bytesToDecode.slice(vectorSize);
                const key = yield this.deriveKey(password);
                // decrypt into bytes
                let decryptedBytes = yield crypto.subtle.decrypt({ name: 'AES-GCM', iv: vector }, key, encryptedTextBytes);
                // convert bytes to text
                let decryptedText = utf8Decoder.decode(decryptedBytes);
                return decryptedText;
            }
            catch (e) {
                //console.error(e);
                return null;
            }
        });
    }
}
const algorithmObsolete = {
    name: 'AES-GCM',
    iv: new Uint8Array([196, 190, 240, 190, 188, 78, 41, 132, 15, 220, 84, 211]),
    tagLength: 128
};
class CryptoHelperObsolete {
    buildKey(password) {
        return __awaiter(this, void 0, void 0, function* () {
            let utf8Encode = new TextEncoder();
            let passwordBytes = utf8Encode.encode(password);
            let passwordDigest = yield crypto.subtle.digest({ name: 'SHA-256' }, passwordBytes);
            let key = yield crypto.subtle.importKey('raw', passwordDigest, algorithmObsolete, false, ['encrypt', 'decrypt']);
            return key;
        });
    }
    encryptToBase64(text, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = yield this.buildKey(password);
            let utf8Encode = new TextEncoder();
            let bytesToEncrypt = utf8Encode.encode(text);
            // encrypt into bytes
            let encryptedBytes = new Uint8Array(yield crypto.subtle.encrypt(algorithmObsolete, key, bytesToEncrypt));
            //convert array to base64
            let base64Text = btoa(String.fromCharCode(...encryptedBytes));
            return base64Text;
        });
    }
    stringToArray(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i));
        }
        return new Uint8Array(result);
    }
    decryptFromBase64(base64Encoded, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // convert base 64 to array
                let bytesToDecrypt = this.stringToArray(atob(base64Encoded));
                let key = yield this.buildKey(password);
                // decrypt into bytes
                let decryptedBytes = yield crypto.subtle.decrypt(algorithmObsolete, key, bytesToDecrypt);
                // convert bytes to text
                let utf8Decode = new TextDecoder();
                let decryptedText = utf8Decode.decode(decryptedBytes);
                return decryptedText;
            }
            catch (e) {
                return null;
            }
        });
    }
}

class MeldEncryptSettingsTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for Meld Encrypt' });
        new obsidian.Setting(containerEl)
            .setName('Expand selection to whole line?')
            .setDesc('Partial selections will get expanded to the whole line.')
            .addToggle(toggle => {
            toggle
                .setValue(this.plugin.settings.expandToWholeLines)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.expandToWholeLines = value;
                yield this.plugin.saveSettings();
                //this.updateSettingsUi();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName('Confirm password?')
            .setDesc('Confirm password when encrypting.')
            .addToggle(toggle => {
            toggle
                .setValue(this.plugin.settings.confirmPassword)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.confirmPassword = value;
                yield this.plugin.saveSettings();
                this.updateSettingsUi();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName('Remember password?')
            .setDesc('Remember the last used password for this session.')
            .addToggle(toggle => {
            toggle
                .setValue(this.plugin.settings.rememberPassword)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.rememberPassword = value;
                yield this.plugin.saveSettings();
                this.updateSettingsUi();
            }));
        });
        this.pwTimeoutSetting = new obsidian.Setting(containerEl)
            .setName(this.buildPasswordTimeoutSettingName())
            .setDesc('The number of minutes to remember the last used password.')
            .addSlider(slider => {
            slider
                .setLimits(0, 120, 5)
                .setValue(this.plugin.settings.rememberPasswordTimeout)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.rememberPasswordTimeout = value;
                yield this.plugin.saveSettings();
                this.updateSettingsUi();
            }));
        });
        this.updateSettingsUi();
    }
    updateSettingsUi() {
        this.pwTimeoutSetting.setName(this.buildPasswordTimeoutSettingName());
        if (this.plugin.settings.rememberPassword) {
            this.pwTimeoutSetting.settingEl.show();
        }
        else {
            this.pwTimeoutSetting.settingEl.hide();
        }
    }
    buildPasswordTimeoutSettingName() {
        const value = this.plugin.settings.rememberPasswordTimeout;
        let timeoutString = `${value} minutes`;
        if (value == 0) {
            timeoutString = 'Never forget';
        }
        return `Remember Password Timeout (${timeoutString})`;
    }
}

const _PREFIX_OBSOLETE = '%%🔐 ';
const _PREFIX_A = '%%🔐α ';
const _SUFFIX = ' 🔐%%';
const DEFAULT_SETTINGS = {
    expandToWholeLines: true,
    confirmPassword: true,
    rememberPassword: true,
    rememberPasswordTimeout: 30
};
class MeldEncrypt extends obsidian.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new MeldEncryptSettingsTab(this.app, this));
            this.addCommand({
                id: 'meld-encrypt',
                name: 'Encrypt/Decrypt',
                editorCheckCallback: (checking, editor, view) => this.processEncryptDecryptCommand(checking, editor, view, false)
            });
            this.addCommand({
                id: 'meld-encrypt-in-place',
                name: 'Encrypt/Decrypt In-place',
                editorCheckCallback: (checking, editor, view) => this.processEncryptDecryptCommand(checking, editor, view, true)
            });
            this.addCommand({
                id: 'meld-encrypt-note',
                name: 'Encrypt/Decrypt Whole Note',
                editorCheckCallback: (checking, editor, view) => this.processEncryptDecryptWholeNoteCommand(checking, editor, view)
            });
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    isSettingsModalOpen() {
        return document.querySelector('.mod-settings') !== null;
    }
    processEncryptDecryptWholeNoteCommand(checking, editor, view) {
        if (checking && this.isSettingsModalOpen()) {
            // Settings is open, ensures this command can show up in other
            // plugins which list commands e.g. customizable-sidebar
            return true;
        }
        const startPos = editor.offsetToPos(0);
        const endPos = { line: editor.lastLine(), ch: editor.getLine(editor.lastLine()).length };
        const selectionText = editor.getRange(startPos, endPos).trim();
        return this.processSelection(checking, editor, selectionText, startPos, endPos, true);
    }
    processEncryptDecryptCommand(checking, editor, view, decryptInPlace) {
        if (checking && this.isSettingsModalOpen()) {
            // Settings is open, ensures this command can show up in other
            // plugins which list commands e.g. customizable-sidebar
            console.log('Settings screen is open');
            return true;
        }
        let startPos = editor.getCursor('from');
        let endPos = editor.getCursor('to');
        if (this.settings.expandToWholeLines) {
            const startLine = startPos.line;
            startPos = { line: startLine, ch: 0 }; // want the start of the first line
            const endLine = endPos.line;
            const endLineText = editor.getLine(endLine);
            endPos = { line: endLine, ch: endLineText.length }; // want the end of last line
        }
        const selectionText = editor.getRange(startPos, endPos);
        return this.processSelection(checking, editor, selectionText, startPos, endPos, decryptInPlace);
    }
    analyseSelection(selectionText) {
        const result = new SelectionAnalysis();
        result.isEmpty = selectionText.length === 0;
        result.hasObsoleteEncryptedPrefix = selectionText.startsWith(_PREFIX_OBSOLETE);
        result.hasEncryptedPrefix = result.hasObsoleteEncryptedPrefix || selectionText.startsWith(_PREFIX_A);
        result.hasDecryptSuffix = selectionText.endsWith(_SUFFIX);
        result.containsEncryptedMarkers =
            selectionText.contains(_PREFIX_OBSOLETE)
                || selectionText.contains(_PREFIX_A)
                || selectionText.contains(_SUFFIX);
        result.canDecrypt = result.hasEncryptedPrefix && result.hasDecryptSuffix;
        result.canEncrypt = !result.hasEncryptedPrefix && !result.containsEncryptedMarkers;
        //console.debug(result);
        return result;
    }
    processSelection(checking, editor, selectionText, finalSelectionStart, finalSelectionEnd, decryptInPlace) {
        const selectionAnalysis = this.analyseSelection(selectionText);
        if (selectionAnalysis.isEmpty) {
            if (!checking) {
                new obsidian.Notice('Nothing to Encrypt.');
            }
            return false;
        }
        if (!selectionAnalysis.canDecrypt && !selectionAnalysis.canEncrypt) {
            if (!checking) {
                new obsidian.Notice('Unable to Encrypt or Decrypt that.');
            }
            return false;
        }
        if (checking) {
            return true;
        }
        // Fetch password from user
        // determine default password
        const isRememberPasswordExpired = !this.settings.rememberPassword
            || (this.passwordLastUsedExpiry != null
                && Date.now() > this.passwordLastUsedExpiry);
        const confirmPassword = selectionAnalysis.canEncrypt && this.settings.confirmPassword;
        if (isRememberPasswordExpired || confirmPassword) {
            // forget password
            this.passwordLastUsed = '';
        }
        const pwModal = new PasswordModal(this.app, confirmPassword, this.passwordLastUsed);
        pwModal.onClose = () => {
            var _a;
            const pw = (_a = pwModal.password) !== null && _a !== void 0 ? _a : '';
            if (pw.length == 0) {
                return;
            }
            // remember password?
            if (this.settings.rememberPassword) {
                this.passwordLastUsed = pw;
                this.passwordLastUsedExpiry =
                    this.settings.rememberPasswordTimeout == 0
                        ? null
                        : Date.now() + this.settings.rememberPasswordTimeout * 1000 * 60 // new expiry
                ;
            }
            if (selectionAnalysis.canEncrypt) {
                this.encryptSelection(editor, selectionText, pw, finalSelectionStart, finalSelectionEnd);
            }
            else {
                if (!selectionAnalysis.hasObsoleteEncryptedPrefix) {
                    this.decryptSelection_a(editor, selectionText, pw, finalSelectionStart, finalSelectionEnd, decryptInPlace);
                }
                else {
                    this.decryptSelectionObsolete(editor, selectionText, pw, finalSelectionStart, finalSelectionEnd, decryptInPlace);
                }
            }
        };
        pwModal.open();
        return true;
    }
    encryptSelection(editor, selectionText, password, finalSelectionStart, finalSelectionEnd) {
        return __awaiter(this, void 0, void 0, function* () {
            //encrypt
            const crypto = new CryptoHelperV2();
            const base64EncryptedText = this.addMarkers(yield crypto.encryptToBase64(selectionText, password));
            editor.setSelection(finalSelectionStart, finalSelectionEnd);
            editor.replaceSelection(base64EncryptedText);
        });
    }
    decryptSelection_a(editor, selectionText, password, selectionStart, selectionEnd, decryptInPlace) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log('decryptSelection_a');
            // decrypt
            const base64CipherText = this.removeMarkers(selectionText);
            const crypto = new CryptoHelperV2();
            const decryptedText = yield crypto.decryptFromBase64(base64CipherText, password);
            if (decryptedText === null) {
                new obsidian.Notice('❌ Decryption failed!');
            }
            else {
                if (decryptInPlace) {
                    editor.setSelection(selectionStart, selectionEnd);
                    editor.replaceSelection(decryptedText);
                }
                else {
                    const decryptModal = new DecryptModal(this.app, '🔓', decryptedText);
                    decryptModal.onClose = () => {
                        editor.focus();
                        if (decryptModal.decryptInPlace) {
                            editor.setSelection(selectionStart, selectionEnd);
                            editor.replaceSelection(decryptedText);
                        }
                    };
                    decryptModal.open();
                }
            }
        });
    }
    decryptSelectionObsolete(editor, selectionText, password, selectionStart, selectionEnd, decryptInPlace) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log('decryptSelectionObsolete');
            // decrypt
            const base64CipherText = this.removeMarkers(selectionText);
            const crypto = new CryptoHelperObsolete();
            const decryptedText = yield crypto.decryptFromBase64(base64CipherText, password);
            if (decryptedText === null) {
                new obsidian.Notice('❌ Decryption failed!');
            }
            else {
                if (decryptInPlace) {
                    editor.setSelection(selectionStart, selectionEnd);
                    editor.replaceSelection(decryptedText);
                }
                else {
                    const decryptModal = new DecryptModal(this.app, '🔓', decryptedText);
                    decryptModal.onClose = () => {
                        editor.focus();
                        if (decryptModal.decryptInPlace) {
                            editor.setSelection(selectionStart, selectionEnd);
                            editor.replaceSelection(decryptedText);
                        }
                    };
                    decryptModal.open();
                }
            }
        });
    }
    removeMarkers(text) {
        if (text.startsWith(_PREFIX_A) && text.endsWith(_SUFFIX)) {
            return text.replace(_PREFIX_A, '').replace(_SUFFIX, '');
        }
        if (text.startsWith(_PREFIX_OBSOLETE) && text.endsWith(_SUFFIX)) {
            return text.replace(_PREFIX_OBSOLETE, '').replace(_SUFFIX, '');
        }
        return text;
    }
    addMarkers(text) {
        if (!text.contains(_PREFIX_OBSOLETE) && !text.contains(_PREFIX_A) && !text.contains(_SUFFIX)) {
            return _PREFIX_A.concat(text, _SUFFIX);
        }
        return text;
    }
}
class SelectionAnalysis {
}

module.exports = MeldEncrypt;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy9EZWNyeXB0TW9kYWwudHMiLCIuLi9zcmMvUGFzc3dvcmRNb2RhbC50cyIsIi4uL3NyYy9DcnlwdG9IZWxwZXIudHMiLCIuLi9zcmMvTWVsZEVuY3J5cHRTZXR0aW5nc1RhYi50cyIsIi4uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgQXBwLCBNb2RhbCB9IGZyb20gJ29ic2lkaWFuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlY3J5cHRNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuXHR0ZXh0OiBzdHJpbmc7XHJcblx0ZGVjcnlwdEluUGxhY2U6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHRpdGxlOiBzdHJpbmcsIHRleHQ6IHN0cmluZyA9ICcnKSB7XHJcblx0XHRzdXBlcihhcHApO1xyXG5cdFx0dGhpcy50ZXh0ID0gdGV4dDtcclxuXHRcdHRoaXMudGl0bGVFbC5pbm5lclRleHQgPSB0aXRsZTtcclxuXHR9XHJcblxyXG5cdG9uT3BlbigpIHtcclxuXHRcdGxldCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuXHJcblx0XHRjb25zdCB0ZXh0RWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KCkuY3JlYXRlRWwoJ3RleHRhcmVhJywgeyB0ZXh0OiB0aGlzLnRleHQgfSk7XHJcblx0XHR0ZXh0RWwuc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcblx0XHR0ZXh0RWwuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xyXG5cdFx0dGV4dEVsLnJvd3MgPSAxMDtcclxuXHRcdHRleHRFbC5yZWFkT25seSA9IHRydWU7XHJcblx0XHQvL3RleHRFbC5mb2N1cygpOyAvLyBEb2Vzbid0IHNlZW0gdG8gd29yayBoZXJlLi4uXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHsgdGV4dEVsLmZvY3VzKCkgfSwxMDApOyAvLy4uLiBidXQgdGhpcyBkb2VzXHJcblxyXG5cclxuXHRcdGNvbnN0IGJ0bkNvbnRhaW5lckVsID0gY29udGVudEVsLmNyZWF0ZURpdignJyk7XHJcblxyXG5cdFx0Y29uc3QgZGVjcnlwdEluUGxhY2VCdG5FbCA9IGJ0bkNvbnRhaW5lckVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdEZWNyeXB0IGluLXBsYWNlJyB9KTtcclxuXHRcdGRlY3J5cHRJblBsYWNlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdHRoaXMuZGVjcnlwdEluUGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLmNsb3NlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRjb25zdCBjYW5jZWxCdG5FbCA9IGJ0bkNvbnRhaW5lckVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdDbG9zZScgfSk7XHJcblx0XHRjYW5jZWxCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0dGhpcy5jbG9zZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcbn0iLCJpbXBvcnQgeyBBcHAsIE1vZGFsLCBQbGF0Zm9ybSB9IGZyb20gJ29ic2lkaWFuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhc3N3b3JkTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XHJcblx0cGFzc3dvcmQ6IHN0cmluZyA9IG51bGw7XHJcblx0ZGVmYXVsdFBhc3N3b3JkOiBzdHJpbmcgPSBudWxsO1xyXG5cdGNvbmZpcm1QYXNzd29yZDogYm9vbGVhbjtcclxuXHJcblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIGNvbmZpcm1QYXNzd29yZDogYm9vbGVhbiwgZGVmYXVsdFBhc3N3b3JkOiBzdHJpbmcgPSBudWxsKSB7XHJcblx0XHRzdXBlcihhcHApO1xyXG5cdFx0dGhpcy5kZWZhdWx0UGFzc3dvcmQgPSBkZWZhdWx0UGFzc3dvcmQ7XHJcblx0XHR0aGlzLmNvbmZpcm1QYXNzd29yZCA9IGNvbmZpcm1QYXNzd29yZDtcclxuXHR9XHJcblxyXG5cdG9uT3BlbigpIHtcclxuXHRcdGxldCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuXHJcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcclxuXHJcblx0XHRjb250ZW50RWwuYWRkQ2xhc3MoICdtZWxkLWUtcGFzc3dvcmQnICk7XHJcblx0XHRpZiAoUGxhdGZvcm0uaXNNb2JpbGUpe1xyXG5cdFx0XHRjb250ZW50RWwuYWRkQ2xhc3MoICdtZWxkLWUtcGxhdGZvcm0tbW9iaWxlJyApO1xyXG5cdFx0fWVsc2UgaWYgKFBsYXRmb3JtLmlzRGVza3RvcCl7XHJcblx0XHRcdGNvbnRlbnRFbC5hZGRDbGFzcyggJ21lbGQtZS1wbGF0Zm9ybS1kZXNrdG9wJyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qIE1haW4gcGFzc3dvcmQgaW5wdXQgcm93ICovXHJcblx0XHRjb25zdCBpbnB1dFB3Q29udGFpbmVyRWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KCB7IGNsczonbWVsZC1lLXJvdycgfSApO1xyXG5cdFx0aW5wdXRQd0NvbnRhaW5lckVsLmNyZWF0ZVNwYW4oeyBjbHM6J21lbGQtZS1pY29uJywgdGV4dDogJ/CflJEnIH0pO1xyXG5cdFx0XHJcblx0XHRjb25zdCBwd0lucHV0RWwgPSBpbnB1dFB3Q29udGFpbmVyRWwuY3JlYXRlRWwoJ2lucHV0JywgeyB0eXBlOiAncGFzc3dvcmQnLCB2YWx1ZTogdGhpcy5kZWZhdWx0UGFzc3dvcmQgPz8gJycgfSk7XHJcblxyXG5cdFx0cHdJbnB1dEVsLnBsYWNlaG9sZGVyID0gJ0VudGVyIHlvdXIgcGFzc3dvcmQnO1xyXG5cdFx0cHdJbnB1dEVsLmZvY3VzKCk7XHJcblxyXG5cdFx0aWYgKFBsYXRmb3JtLmlzTW9iaWxlKXtcclxuXHRcdFx0Ly8gQWRkICdOZXh0JyBidXR0b24gZm9yIG1vYmlsZVxyXG5cdFx0XHRjb25zdCBpbnB1dElucHV0TmV4dEJ0bkVsID0gaW5wdXRQd0NvbnRhaW5lckVsLmNyZWF0ZUVsKCdidXR0b24nLCB7XHJcblx0XHRcdFx0dGV4dDogJ+KGkicsXHJcblx0XHRcdFx0Y2xzOidtZWxkLWUtYnV0dG9uLW5leHQnXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRpbnB1dElucHV0TmV4dEJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2KSA9PiB7XHJcblx0XHRcdFx0aW5wdXRQYXNzd29yZEhhbmRsZXIoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyogRW5kIE1haW4gcGFzc3dvcmQgaW5wdXQgcm93ICovXHJcblxyXG5cdFx0LyogQ29uZmlybSBwYXNzd29yZCBpbnB1dCByb3cgKi9cclxuXHJcblx0XHRjb25zdCBjb25maXJtUHdDb250YWluZXJFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoIHsgY2xzOidtZWxkLWUtcm93JyB9ICk7XHJcblx0XHRjb25maXJtUHdDb250YWluZXJFbC5jcmVhdGVTcGFuKCB7IGNsczonbWVsZC1lLWljb24nLCB0ZXh0OiAn8J+UkScgfSApO1xyXG5cdFx0XHJcblx0XHRjb25zdCBwd0NvbmZpcm1JbnB1dEVsID0gY29uZmlybVB3Q29udGFpbmVyRWwuY3JlYXRlRWwoICdpbnB1dCcsIHtcclxuXHRcdFx0dHlwZTogJ3Bhc3N3b3JkJyxcclxuXHRcdFx0dmFsdWU6IHRoaXMuZGVmYXVsdFBhc3N3b3JkID8/ICcnXHJcblx0XHR9KTtcclxuXHRcdHB3Q29uZmlybUlucHV0RWwucGxhY2Vob2xkZXIgPSAnQ29uZmlybSB5b3VyIHBhc3N3b3JkJztcclxuXHJcblx0XHRjb25zdCBtZXNzYWdlRWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOidtZWxkLWUtbWVzc2FnZScgfSk7XHJcblx0XHRtZXNzYWdlRWwuaGlkZSgpO1xyXG5cdFx0XHJcblx0XHRcclxuXHRcdGlmIChQbGF0Zm9ybS5pc01vYmlsZSl7XHJcblx0XHRcdC8vIEFkZCAnTmV4dCcgYnV0dG9uIGZvciBtb2JpbGVcclxuXHRcdFx0Y29uc3QgY29uZmlybUlucHV0TmV4dEJ0bkVsID0gY29uZmlybVB3Q29udGFpbmVyRWwuY3JlYXRlRWwoJ2J1dHRvbicsIHtcclxuXHRcdFx0XHR0ZXh0OiAn4oaSJyxcclxuXHRcdFx0XHRjbHM6J21lbGQtZS1idXR0b24tbmV4dCdcclxuXHRcdFx0fSk7XHJcblx0XHRcdGNvbmZpcm1JbnB1dE5leHRCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldikgPT4ge1xyXG5cdFx0XHRcdGNvbmZpcm1QYXNzd29yZEhhbmRsZXIoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHQvKiBFbmQgQ29uZmlybSBwYXNzd29yZCBpbnB1dCByb3cgKi9cclxuXHJcblx0XHRjb25zdCBjb25maXJtUHdCdXR0b25FbCA9IGNvbnRlbnRFbC5jcmVhdGVFbCggJ2J1dHRvbicsIHtcclxuXHRcdFx0dGV4dDonQ29uZmlybScsXHJcblx0XHRcdGNsczonbWVsZC1lLWJ1dHRvbi1jb25maXJtJ1xyXG5cdFx0fSk7XHJcblx0XHRjb25maXJtUHdCdXR0b25FbC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCAoZXYpID0+e1xyXG5cdFx0XHRpZiAodGhpcy5jb25maXJtUGFzc3dvcmQpe1xyXG5cdFx0XHRcdGlmICggcHdJbnB1dEVsLnZhbHVlID09IHB3Q29uZmlybUlucHV0RWwudmFsdWUgKXtcclxuXHRcdFx0XHRcdHRoaXMucGFzc3dvcmQgPSBwd0NvbmZpcm1JbnB1dEVsLnZhbHVlO1xyXG5cdFx0XHRcdFx0dGhpcy5jbG9zZSgpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0Ly8gcGFzc3dvcmRzIGRvbid0IG1hdGNoXHJcblx0XHRcdFx0XHRtZXNzYWdlRWwuc2V0VGV4dCgnUGFzc3dvcmRzIGRvblxcJ3QgbWF0Y2gnKTtcclxuXHRcdFx0XHRcdG1lc3NhZ2VFbC5zaG93KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLnBhc3N3b3JkID0gcHdJbnB1dEVsLnZhbHVlO1xyXG5cdFx0XHRcdHRoaXMuY2xvc2UoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHJcblxyXG5cdFx0Y29uc3QgaW5wdXRQYXNzd29yZEhhbmRsZXIgPSAoKSA9PntcclxuXHRcdFx0aWYgKHRoaXMuY29uZmlybVBhc3N3b3JkKSB7XHJcblx0XHRcdFx0Ly8gY29uZmltIHBhc3N3b3JkXHJcblx0XHRcdFx0cHdDb25maXJtSW5wdXRFbC5mb2N1cygpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMucGFzc3dvcmQgPSBwd0lucHV0RWwudmFsdWU7XHJcblx0XHRcdFx0dGhpcy5jbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY29uZmlybVBhc3N3b3JkSGFuZGxlciA9ICgpID0+IHtcclxuXHRcdFx0aWYgKHB3SW5wdXRFbC52YWx1ZSA9PSBwd0NvbmZpcm1JbnB1dEVsLnZhbHVlKXtcclxuXHRcdFx0XHR0aGlzLnBhc3N3b3JkID0gcHdDb25maXJtSW5wdXRFbC52YWx1ZTtcclxuXHRcdFx0XHR0aGlzLmNsb3NlKCk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdC8vIHBhc3N3b3JkcyBkb24ndCBtYXRjaFxyXG5cdFx0XHRcdG1lc3NhZ2VFbC5zZXRUZXh0KCdQYXNzd29yZHMgZG9uXFwndCBtYXRjaCcpO1xyXG5cdFx0XHRcdG1lc3NhZ2VFbC5zaG93KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0cHdDb25maXJtSW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldikgPT4ge1xyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0KCBldi5jb2RlID09PSAnRW50ZXInIHx8IGV2LmNvZGUgPT09ICdOdW1wYWRFbnRlcicgKVxyXG5cdFx0XHRcdCYmIHB3Q29uZmlybUlucHV0RWwudmFsdWUubGVuZ3RoID4gMFxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdGNvbmZpcm1QYXNzd29yZEhhbmRsZXIoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHJcblx0XHRpZiAoIXRoaXMuY29uZmlybVBhc3N3b3JkKSB7XHJcblx0XHRcdGNvbmZpcm1Qd0NvbnRhaW5lckVsLmhpZGUoKTtcclxuXHRcdH1cclxuXHJcblx0XHRwd0lucHV0RWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZXYpID0+IHtcclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdCggZXYuY29kZSA9PT0gJ0VudGVyJyB8fCBldi5jb2RlID09PSAnTnVtcGFkRW50ZXInIClcclxuXHRcdFx0XHQmJiBwd0lucHV0RWwudmFsdWUubGVuZ3RoID4gMFxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdGlucHV0UGFzc3dvcmRIYW5kbGVyKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG59IiwiY29uc3QgdmVjdG9yU2l6ZVx0PSAxNjtcclxuY29uc3QgdXRmOEVuY29kZXJcdD0gbmV3IFRleHRFbmNvZGVyKCk7XHJcbmNvbnN0IHV0ZjhEZWNvZGVyXHQ9IG5ldyBUZXh0RGVjb2RlcigpO1xyXG5jb25zdCBpdGVyYXRpb25zXHQ9IDEwMDA7XHJcbmNvbnN0IHNhbHRcdFx0XHQ9IHV0ZjhFbmNvZGVyLmVuY29kZSgnWEhXbkRBVDZlaE1WWTJ6RCcpO1xyXG5cclxuZXhwb3J0IGNsYXNzIENyeXB0b0hlbHBlclYyIHtcclxuXHJcblx0cHJpdmF0ZSBhc3luYyBkZXJpdmVLZXkocGFzc3dvcmQ6c3RyaW5nKSA6UHJvbWlzZTxDcnlwdG9LZXk+IHtcclxuXHRcdGNvbnN0IGJ1ZmZlciAgICAgPSB1dGY4RW5jb2Rlci5lbmNvZGUocGFzc3dvcmQpO1xyXG5cdFx0Y29uc3Qga2V5ICAgICAgICA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KCdyYXcnLCBidWZmZXIsIHtuYW1lOiAnUEJLREYyJ30sIGZhbHNlLCBbJ2Rlcml2ZUtleSddKTtcclxuXHRcdGNvbnN0IHByaXZhdGVLZXkgPSBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdQQktERjInLFxyXG5cdFx0XHRcdGhhc2g6IHtuYW1lOiAnU0hBLTI1Nid9LFxyXG5cdFx0XHRcdGl0ZXJhdGlvbnMsXHJcblx0XHRcdFx0c2FsdFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRrZXksXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnQUVTLUdDTScsXHJcblx0XHRcdFx0bGVuZ3RoOiAyNTZcclxuXHRcdFx0fSxcclxuXHRcdFx0ZmFsc2UsXHJcblx0XHRcdFsnZW5jcnlwdCcsICdkZWNyeXB0J11cclxuXHRcdCk7XHJcblx0XHRcclxuXHRcdHJldHVybiBwcml2YXRlS2V5O1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFzeW5jIGVuY3J5cHRUb0Jhc2U2NCh0ZXh0OiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG5cclxuXHRcdGNvbnN0IGtleSA9IGF3YWl0IHRoaXMuZGVyaXZlS2V5KHBhc3N3b3JkKTtcclxuXHRcdFxyXG5cdFx0Y29uc3QgdGV4dEJ5dGVzVG9FbmNyeXB0ID0gdXRmOEVuY29kZXIuZW5jb2RlKHRleHQpO1xyXG5cdFx0Y29uc3QgdmVjdG9yID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSh2ZWN0b3JTaXplKSk7XHJcblx0XHRcclxuXHRcdC8vIGVuY3J5cHQgaW50byBieXRlc1xyXG5cdFx0Y29uc3QgZW5jcnlwdGVkQnl0ZXMgPSBuZXcgVWludDhBcnJheShcclxuXHRcdFx0YXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxyXG5cdFx0XHRcdHtuYW1lOiAnQUVTLUdDTScsIGl2OiB2ZWN0b3J9LFxyXG5cdFx0XHRcdGtleSxcclxuXHRcdFx0XHR0ZXh0Qnl0ZXNUb0VuY3J5cHRcclxuXHRcdFx0KVxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0Y29uc3QgZmluYWxCeXRlcyA9IG5ldyBVaW50OEFycmF5KCB2ZWN0b3IuYnl0ZUxlbmd0aCArIGVuY3J5cHRlZEJ5dGVzLmJ5dGVMZW5ndGggKTtcclxuXHRcdGZpbmFsQnl0ZXMuc2V0KCB2ZWN0b3IsIDAgKTtcclxuXHRcdGZpbmFsQnl0ZXMuc2V0KCBlbmNyeXB0ZWRCeXRlcywgdmVjdG9yLmJ5dGVMZW5ndGggKTtcclxuXHJcblx0XHQvL2NvbnZlcnQgYXJyYXkgdG8gYmFzZTY0XHJcblx0XHRjb25zdCBiYXNlNjRUZXh0ID0gYnRvYSggU3RyaW5nLmZyb21DaGFyQ29kZSguLi5maW5hbEJ5dGVzKSApO1xyXG5cclxuXHRcdHJldHVybiBiYXNlNjRUZXh0O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzdHJpbmdUb0FycmF5KHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XHJcblx0XHR2YXIgcmVzdWx0ID0gW107XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRyZXN1bHQucHVzaChzdHIuY2hhckNvZGVBdChpKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbmV3IFVpbnQ4QXJyYXkocmVzdWx0KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhc3luYyBkZWNyeXB0RnJvbUJhc2U2NChiYXNlNjRFbmNvZGVkOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG5cdFx0dHJ5IHtcclxuXHJcblx0XHRcdGxldCBieXRlc1RvRGVjb2RlID0gdGhpcy5zdHJpbmdUb0FycmF5KGF0b2IoYmFzZTY0RW5jb2RlZCkpO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gZXh0cmFjdCBpdlxyXG5cdFx0XHRjb25zdCB2ZWN0b3IgPSBieXRlc1RvRGVjb2RlLnNsaWNlKDAsdmVjdG9yU2l6ZSk7XHJcblxyXG5cdFx0XHQvLyBleHRyYWN0IGVuY3J5cHRlZCB0ZXh0XHJcblx0XHRcdGNvbnN0IGVuY3J5cHRlZFRleHRCeXRlcyA9IGJ5dGVzVG9EZWNvZGUuc2xpY2UodmVjdG9yU2l6ZSk7XHJcblxyXG5cdFx0XHRjb25zdCBrZXkgPSBhd2FpdCB0aGlzLmRlcml2ZUtleShwYXNzd29yZCk7XHJcblxyXG5cdFx0XHQvLyBkZWNyeXB0IGludG8gYnl0ZXNcclxuXHRcdFx0bGV0IGRlY3J5cHRlZEJ5dGVzID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxyXG5cdFx0XHRcdHtuYW1lOiAnQUVTLUdDTScsIGl2OiB2ZWN0b3J9LFxyXG5cdFx0XHRcdGtleSxcclxuXHRcdFx0XHRlbmNyeXB0ZWRUZXh0Qnl0ZXNcclxuXHRcdFx0KTtcclxuXHJcblx0XHRcdC8vIGNvbnZlcnQgYnl0ZXMgdG8gdGV4dFxyXG5cdFx0XHRsZXQgZGVjcnlwdGVkVGV4dCA9IHV0ZjhEZWNvZGVyLmRlY29kZShkZWNyeXB0ZWRCeXRlcyk7XHJcblx0XHRcdHJldHVybiBkZWNyeXB0ZWRUZXh0O1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHQvL2NvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn1cclxuXHJcbmNvbnN0IGFsZ29yaXRobU9ic29sZXRlID0ge1xyXG5cdG5hbWU6ICdBRVMtR0NNJyxcclxuXHRpdjogbmV3IFVpbnQ4QXJyYXkoWzE5NiwgMTkwLCAyNDAsIDE5MCwgMTg4LCA3OCwgNDEsIDEzMiwgMTUsIDIyMCwgODQsIDIxMV0pLFxyXG5cdHRhZ0xlbmd0aDogMTI4XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDcnlwdG9IZWxwZXJPYnNvbGV0ZSB7XHJcblxyXG5cdHByaXZhdGUgYXN5bmMgYnVpbGRLZXkocGFzc3dvcmQ6IHN0cmluZykge1xyXG5cdFx0bGV0IHV0ZjhFbmNvZGUgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuXHRcdGxldCBwYXNzd29yZEJ5dGVzID0gdXRmOEVuY29kZS5lbmNvZGUocGFzc3dvcmQpO1xyXG5cclxuXHRcdGxldCBwYXNzd29yZERpZ2VzdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGlnZXN0KHsgbmFtZTogJ1NIQS0yNTYnIH0sIHBhc3N3b3JkQnl0ZXMpO1xyXG5cclxuXHRcdGxldCBrZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcclxuXHRcdFx0J3JhdycsXHJcblx0XHRcdHBhc3N3b3JkRGlnZXN0LFxyXG5cdFx0XHRhbGdvcml0aG1PYnNvbGV0ZSxcclxuXHRcdFx0ZmFsc2UsXHJcblx0XHRcdFsnZW5jcnlwdCcsICdkZWNyeXB0J11cclxuXHRcdCk7XHJcblxyXG5cdFx0cmV0dXJuIGtleTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhc3luYyBlbmNyeXB0VG9CYXNlNjQodGV4dDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuXHRcdGxldCBrZXkgPSBhd2FpdCB0aGlzLmJ1aWxkS2V5KHBhc3N3b3JkKTtcclxuXHJcblx0XHRsZXQgdXRmOEVuY29kZSA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG5cdFx0bGV0IGJ5dGVzVG9FbmNyeXB0ID0gdXRmOEVuY29kZS5lbmNvZGUodGV4dCk7XHJcblxyXG5cdFx0Ly8gZW5jcnlwdCBpbnRvIGJ5dGVzXHJcblx0XHRsZXQgZW5jcnlwdGVkQnl0ZXMgPSBuZXcgVWludDhBcnJheShhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXHJcblx0XHRcdGFsZ29yaXRobU9ic29sZXRlLCBrZXksIGJ5dGVzVG9FbmNyeXB0XHJcblx0XHQpKTtcclxuXHJcblx0XHQvL2NvbnZlcnQgYXJyYXkgdG8gYmFzZTY0XHJcblx0XHRsZXQgYmFzZTY0VGV4dCA9IGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZSguLi5lbmNyeXB0ZWRCeXRlcykpO1xyXG5cclxuXHRcdHJldHVybiBiYXNlNjRUZXh0O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzdHJpbmdUb0FycmF5KHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XHJcblx0XHR2YXIgcmVzdWx0ID0gW107XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRyZXN1bHQucHVzaChzdHIuY2hhckNvZGVBdChpKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbmV3IFVpbnQ4QXJyYXkocmVzdWx0KTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhc3luYyBkZWNyeXB0RnJvbUJhc2U2NChiYXNlNjRFbmNvZGVkOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0Ly8gY29udmVydCBiYXNlIDY0IHRvIGFycmF5XHJcblx0XHRcdGxldCBieXRlc1RvRGVjcnlwdCA9IHRoaXMuc3RyaW5nVG9BcnJheShhdG9iKGJhc2U2NEVuY29kZWQpKTtcclxuXHJcblx0XHRcdGxldCBrZXkgPSBhd2FpdCB0aGlzLmJ1aWxkS2V5KHBhc3N3b3JkKTtcclxuXHJcblx0XHRcdC8vIGRlY3J5cHQgaW50byBieXRlc1xyXG5cdFx0XHRsZXQgZGVjcnlwdGVkQnl0ZXMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoYWxnb3JpdGhtT2Jzb2xldGUsIGtleSwgYnl0ZXNUb0RlY3J5cHQpO1xyXG5cclxuXHRcdFx0Ly8gY29udmVydCBieXRlcyB0byB0ZXh0XHJcblx0XHRcdGxldCB1dGY4RGVjb2RlID0gbmV3IFRleHREZWNvZGVyKCk7XHJcblx0XHRcdGxldCBkZWNyeXB0ZWRUZXh0ID0gdXRmOERlY29kZS5kZWNvZGUoZGVjcnlwdGVkQnl0ZXMpO1xyXG5cdFx0XHRyZXR1cm4gZGVjcnlwdGVkVGV4dDtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufVxyXG4iLCJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IE1lbGRFbmNyeXB0IGZyb20gXCIuL21haW5cIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbGRFbmNyeXB0U2V0dGluZ3NUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcclxuXHRwbHVnaW46IE1lbGRFbmNyeXB0O1xyXG5cclxuXHRwd1RpbWVvdXRTZXR0aW5nOlNldHRpbmc7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IE1lbGRFbmNyeXB0KSB7XHJcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XHJcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuXHR9XHJcblxyXG5cdGRpc3BsYXkoKTogdm9pZCB7XHJcblx0XHRsZXQgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuXHJcblx0XHRjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cdFx0XHJcblx0XHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7dGV4dDogJ1NldHRpbmdzIGZvciBNZWxkIEVuY3J5cHQnfSk7XHJcblxyXG5cclxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG5cdFx0XHQuc2V0TmFtZSgnRXhwYW5kIHNlbGVjdGlvbiB0byB3aG9sZSBsaW5lPycpXHJcblx0XHRcdC5zZXREZXNjKCdQYXJ0aWFsIHNlbGVjdGlvbnMgd2lsbCBnZXQgZXhwYW5kZWQgdG8gdGhlIHdob2xlIGxpbmUuJylcclxuXHRcdFx0LmFkZFRvZ2dsZSggdG9nZ2xlID0+e1xyXG5cdFx0XHRcdHRvZ2dsZVxyXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmV4cGFuZFRvV2hvbGVMaW5lcylcclxuXHRcdFx0XHRcdC5vbkNoYW5nZSggYXN5bmMgdmFsdWUgPT57XHJcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLmV4cGFuZFRvV2hvbGVMaW5lcyA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdFx0Ly90aGlzLnVwZGF0ZVNldHRpbmdzVWkoKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdH0pXHJcblx0XHQ7XHJcblxyXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcblx0XHRcdC5zZXROYW1lKCdDb25maXJtIHBhc3N3b3JkPycpXHJcblx0XHRcdC5zZXREZXNjKCdDb25maXJtIHBhc3N3b3JkIHdoZW4gZW5jcnlwdGluZy4nKVxyXG5cdFx0XHQuYWRkVG9nZ2xlKCB0b2dnbGUgPT57XHJcblx0XHRcdFx0dG9nZ2xlXHJcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybVBhc3N3b3JkKVxyXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKCBhc3luYyB2YWx1ZSA9PntcclxuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybVBhc3N3b3JkID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZVNldHRpbmdzVWkoKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdH0pXHJcblx0XHQ7XHJcblxyXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcblx0XHRcdC5zZXROYW1lKCdSZW1lbWJlciBwYXNzd29yZD8nKVxyXG5cdFx0XHQuc2V0RGVzYygnUmVtZW1iZXIgdGhlIGxhc3QgdXNlZCBwYXNzd29yZCBmb3IgdGhpcyBzZXNzaW9uLicpXHJcblx0XHRcdC5hZGRUb2dnbGUoIHRvZ2dsZSA9PntcclxuXHRcdFx0XHR0b2dnbGVcclxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkKVxyXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKCBhc3luYyB2YWx1ZSA9PntcclxuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uc2V0dGluZ3MucmVtZW1iZXJQYXNzd29yZCA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdFx0dGhpcy51cGRhdGVTZXR0aW5nc1VpKCk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cdFx0O1xyXG5cclxuXHRcdHRoaXMucHdUaW1lb3V0U2V0dGluZyA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG5cdFx0XHQuc2V0TmFtZSggdGhpcy5idWlsZFBhc3N3b3JkVGltZW91dFNldHRpbmdOYW1lKCkgKVxyXG5cdFx0XHQuc2V0RGVzYygnVGhlIG51bWJlciBvZiBtaW51dGVzIHRvIHJlbWVtYmVyIHRoZSBsYXN0IHVzZWQgcGFzc3dvcmQuJylcclxuXHRcdFx0LmFkZFNsaWRlciggc2xpZGVyID0+IHtcclxuXHRcdFx0XHRzbGlkZXJcclxuXHRcdFx0XHRcdC5zZXRMaW1pdHMoMCwgMTIwLCA1KVxyXG5cdFx0XHRcdFx0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbWVtYmVyUGFzc3dvcmRUaW1lb3V0KVxyXG5cdFx0XHRcdFx0Lm9uQ2hhbmdlKCBhc3luYyB2YWx1ZSA9PiB7XHJcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbWVtYmVyUGFzc3dvcmRUaW1lb3V0ID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnVwZGF0ZVNldHRpbmdzVWkoKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9KVxyXG5cdFx0O1xyXG5cclxuXHRcdHRoaXMudXBkYXRlU2V0dGluZ3NVaSgpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlU2V0dGluZ3NVaSgpOnZvaWR7XHJcblx0XHR0aGlzLnB3VGltZW91dFNldHRpbmcuc2V0TmFtZSh0aGlzLmJ1aWxkUGFzc3dvcmRUaW1lb3V0U2V0dGluZ05hbWUoKSk7XHJcblxyXG5cclxuXHRcdGlmICggdGhpcy5wbHVnaW4uc2V0dGluZ3MucmVtZW1iZXJQYXNzd29yZCApe1xyXG5cdFx0XHR0aGlzLnB3VGltZW91dFNldHRpbmcuc2V0dGluZ0VsLnNob3coKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLnB3VGltZW91dFNldHRpbmcuc2V0dGluZ0VsLmhpZGUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGJ1aWxkUGFzc3dvcmRUaW1lb3V0U2V0dGluZ05hbWUoKTpzdHJpbmd7XHJcblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbWVtYmVyUGFzc3dvcmRUaW1lb3V0O1xyXG5cdFx0bGV0IHRpbWVvdXRTdHJpbmcgPSBgJHt2YWx1ZX0gbWludXRlc2A7XHJcblx0XHRpZih2YWx1ZSA9PSAwKXtcclxuXHRcdFx0dGltZW91dFN0cmluZyA9ICdOZXZlciBmb3JnZXQnO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGBSZW1lbWJlciBQYXNzd29yZCBUaW1lb3V0ICgke3RpbWVvdXRTdHJpbmd9KWA7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgTm90aWNlLCBQbHVnaW4sIE1hcmtkb3duVmlldywgRWRpdG9yIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgRGVjcnlwdE1vZGFsIGZyb20gJy4vRGVjcnlwdE1vZGFsJztcclxuaW1wb3J0IFBhc3N3b3JkTW9kYWwgZnJvbSAnLi9QYXNzd29yZE1vZGFsJztcclxuaW1wb3J0IHsgQ3J5cHRvSGVscGVyVjIsIENyeXB0b0hlbHBlck9ic29sZXRlfSBmcm9tICcuL0NyeXB0b0hlbHBlcic7XHJcbmltcG9ydCBNZWxkRW5jcnlwdFNldHRpbmdzVGFiIGZyb20gJy4vTWVsZEVuY3J5cHRTZXR0aW5nc1RhYic7XHJcblxyXG5jb25zdCBfUFJFRklYX09CU09MRVRFOiBzdHJpbmcgPSAnJSXwn5SQICc7XHJcbmNvbnN0IF9QUkVGSVhfQTogc3RyaW5nID0gJyUl8J+UkM6xICc7XHJcbmNvbnN0IF9TVUZGSVg6IHN0cmluZyA9ICcg8J+UkCUlJztcclxuXHJcbmludGVyZmFjZSBNZWxkRW5jcnlwdFBsdWdpblNldHRpbmdzIHtcclxuXHRleHBhbmRUb1dob2xlTGluZXM6IGJvb2xlYW4sXHJcblx0Y29uZmlybVBhc3N3b3JkOiBib29sZWFuO1xyXG5cdHJlbWVtYmVyUGFzc3dvcmQ6IGJvb2xlYW47XHJcblx0cmVtZW1iZXJQYXNzd29yZFRpbWVvdXQ6IG51bWJlcjtcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogTWVsZEVuY3J5cHRQbHVnaW5TZXR0aW5ncyA9IHtcclxuXHRleHBhbmRUb1dob2xlTGluZXM6IHRydWUsXHJcblx0Y29uZmlybVBhc3N3b3JkOiB0cnVlLFxyXG5cdHJlbWVtYmVyUGFzc3dvcmQ6IHRydWUsXHJcblx0cmVtZW1iZXJQYXNzd29yZFRpbWVvdXQ6IDMwXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lbGRFbmNyeXB0IGV4dGVuZHMgUGx1Z2luIHtcclxuXHJcblx0c2V0dGluZ3M6IE1lbGRFbmNyeXB0UGx1Z2luU2V0dGluZ3M7XHJcblx0cGFzc3dvcmRMYXN0VXNlZEV4cGlyeTogbnVtYmVyXHJcblx0cGFzc3dvcmRMYXN0VXNlZDogc3RyaW5nO1xyXG5cclxuXHRhc3luYyBvbmxvYWQoKSB7XHJcblxyXG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcclxuXHJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IE1lbGRFbmNyeXB0U2V0dGluZ3NUYWIodGhpcy5hcHAsIHRoaXMpKTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ21lbGQtZW5jcnlwdCcsXHJcblx0XHRcdG5hbWU6ICdFbmNyeXB0L0RlY3J5cHQnLFxyXG5cdFx0XHRlZGl0b3JDaGVja0NhbGxiYWNrOiAoY2hlY2tpbmcsIGVkaXRvciwgdmlldykgPT4gdGhpcy5wcm9jZXNzRW5jcnlwdERlY3J5cHRDb21tYW5kKGNoZWNraW5nLCBlZGl0b3IsIHZpZXcsIGZhbHNlKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdtZWxkLWVuY3J5cHQtaW4tcGxhY2UnLFxyXG5cdFx0XHRuYW1lOiAnRW5jcnlwdC9EZWNyeXB0IEluLXBsYWNlJyxcclxuXHRcdFx0ZWRpdG9yQ2hlY2tDYWxsYmFjazogKGNoZWNraW5nLCBlZGl0b3IsIHZpZXcpID0+IHRoaXMucHJvY2Vzc0VuY3J5cHREZWNyeXB0Q29tbWFuZChjaGVja2luZywgZWRpdG9yLCB2aWV3LCB0cnVlKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdtZWxkLWVuY3J5cHQtbm90ZScsXHJcblx0XHRcdG5hbWU6ICdFbmNyeXB0L0RlY3J5cHQgV2hvbGUgTm90ZScsXHJcblx0XHRcdGVkaXRvckNoZWNrQ2FsbGJhY2s6IChjaGVja2luZywgZWRpdG9yLCB2aWV3KSA9PiB0aGlzLnByb2Nlc3NFbmNyeXB0RGVjcnlwdFdob2xlTm90ZUNvbW1hbmQoY2hlY2tpbmcsIGVkaXRvciwgdmlldylcclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuXHR9XHJcblxyXG5cdGlzU2V0dGluZ3NNb2RhbE9wZW4oKSA6IGJvb2xlYW57XHJcblx0XHRyZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1vZC1zZXR0aW5ncycpICE9PSBudWxsO1xyXG5cdH0gXHJcblxyXG5cdHByb2Nlc3NFbmNyeXB0RGVjcnlwdFdob2xlTm90ZUNvbW1hbmQoY2hlY2tpbmc6IGJvb2xlYW4sIGVkaXRvcjogRWRpdG9yLCB2aWV3OiBNYXJrZG93blZpZXcpOiBib29sZWFuIHtcclxuXHJcblx0XHRpZiAoIGNoZWNraW5nICYmIHRoaXMuaXNTZXR0aW5nc01vZGFsT3BlbigpICl7XHJcblx0XHRcdC8vIFNldHRpbmdzIGlzIG9wZW4sIGVuc3VyZXMgdGhpcyBjb21tYW5kIGNhbiBzaG93IHVwIGluIG90aGVyXHJcblx0XHRcdC8vIHBsdWdpbnMgd2hpY2ggbGlzdCBjb21tYW5kcyBlLmcuIGN1c3RvbWl6YWJsZS1zaWRlYmFyXHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHN0YXJ0UG9zID0gZWRpdG9yLm9mZnNldFRvUG9zKDApO1xyXG5cdFx0Y29uc3QgZW5kUG9zID0geyBsaW5lOiBlZGl0b3IubGFzdExpbmUoKSwgY2g6IGVkaXRvci5nZXRMaW5lKGVkaXRvci5sYXN0TGluZSgpKS5sZW5ndGggfTtcclxuXHJcblx0XHRjb25zdCBzZWxlY3Rpb25UZXh0ID0gZWRpdG9yLmdldFJhbmdlKHN0YXJ0UG9zLCBlbmRQb3MpLnRyaW0oKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5wcm9jZXNzU2VsZWN0aW9uKFxyXG5cdFx0XHRjaGVja2luZyxcclxuXHRcdFx0ZWRpdG9yLFxyXG5cdFx0XHRzZWxlY3Rpb25UZXh0LFxyXG5cdFx0XHRzdGFydFBvcyxcclxuXHRcdFx0ZW5kUG9zLFxyXG5cdFx0XHR0cnVlXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0cHJvY2Vzc0VuY3J5cHREZWNyeXB0Q29tbWFuZChjaGVja2luZzogYm9vbGVhbiwgZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldywgZGVjcnlwdEluUGxhY2U6IGJvb2xlYW4pOiBib29sZWFuIHtcclxuXHRcdGlmICggY2hlY2tpbmcgJiYgdGhpcy5pc1NldHRpbmdzTW9kYWxPcGVuKCkgKXtcclxuXHRcdFx0Ly8gU2V0dGluZ3MgaXMgb3BlbiwgZW5zdXJlcyB0aGlzIGNvbW1hbmQgY2FuIHNob3cgdXAgaW4gb3RoZXJcclxuXHRcdFx0Ly8gcGx1Z2lucyB3aGljaCBsaXN0IGNvbW1hbmRzIGUuZy4gY3VzdG9taXphYmxlLXNpZGViYXJcclxuXHRcdFx0Y29uc29sZS5sb2coJ1NldHRpbmdzIHNjcmVlbiBpcyBvcGVuJyk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBzdGFydFBvcyA9IGVkaXRvci5nZXRDdXJzb3IoJ2Zyb20nKTtcclxuXHRcdGxldCBlbmRQb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yKCd0bycpO1xyXG5cclxuXHRcdGlmICh0aGlzLnNldHRpbmdzLmV4cGFuZFRvV2hvbGVMaW5lcyl7XHJcblx0XHRcdGNvbnN0IHN0YXJ0TGluZSA9IHN0YXJ0UG9zLmxpbmU7XHJcblx0XHRcdHN0YXJ0UG9zID0geyBsaW5lOiBzdGFydExpbmUsIGNoOiAwIH07IC8vIHdhbnQgdGhlIHN0YXJ0IG9mIHRoZSBmaXJzdCBsaW5lXHJcblxyXG5cdFx0XHRjb25zdCBlbmRMaW5lID0gZW5kUG9zLmxpbmU7XHJcblx0XHRcdGNvbnN0IGVuZExpbmVUZXh0ID0gZWRpdG9yLmdldExpbmUoZW5kTGluZSk7XHJcblx0XHRcdGVuZFBvcyA9IHsgbGluZTogZW5kTGluZSwgY2g6IGVuZExpbmVUZXh0Lmxlbmd0aCB9OyAvLyB3YW50IHRoZSBlbmQgb2YgbGFzdCBsaW5lXHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3Qgc2VsZWN0aW9uVGV4dCA9IGVkaXRvci5nZXRSYW5nZShzdGFydFBvcywgZW5kUG9zKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5wcm9jZXNzU2VsZWN0aW9uKFxyXG5cdFx0XHRjaGVja2luZyxcclxuXHRcdFx0ZWRpdG9yLFxyXG5cdFx0XHRzZWxlY3Rpb25UZXh0LFxyXG5cdFx0XHRzdGFydFBvcyxcclxuXHRcdFx0ZW5kUG9zLFxyXG5cdFx0XHRkZWNyeXB0SW5QbGFjZVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYW5hbHlzZVNlbGVjdGlvbiggc2VsZWN0aW9uVGV4dDogc3RyaW5nICk6U2VsZWN0aW9uQW5hbHlzaXN7XHJcblx0XHRcclxuXHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBTZWxlY3Rpb25BbmFseXNpcygpO1xyXG5cclxuXHRcdHJlc3VsdC5pc0VtcHR5ID0gc2VsZWN0aW9uVGV4dC5sZW5ndGggPT09IDA7XHJcblxyXG5cdFx0cmVzdWx0Lmhhc09ic29sZXRlRW5jcnlwdGVkUHJlZml4ID0gc2VsZWN0aW9uVGV4dC5zdGFydHNXaXRoKF9QUkVGSVhfT0JTT0xFVEUpO1xyXG5cdFx0cmVzdWx0Lmhhc0VuY3J5cHRlZFByZWZpeCA9IHJlc3VsdC5oYXNPYnNvbGV0ZUVuY3J5cHRlZFByZWZpeCB8fCBzZWxlY3Rpb25UZXh0LnN0YXJ0c1dpdGgoX1BSRUZJWF9BKTtcclxuXHJcblx0XHRyZXN1bHQuaGFzRGVjcnlwdFN1ZmZpeCA9IHNlbGVjdGlvblRleHQuZW5kc1dpdGgoX1NVRkZJWCk7XHJcblxyXG5cdFx0cmVzdWx0LmNvbnRhaW5zRW5jcnlwdGVkTWFya2VycyA9XHJcblx0XHRcdHNlbGVjdGlvblRleHQuY29udGFpbnMoX1BSRUZJWF9PQlNPTEVURSlcclxuXHRcdFx0fHwgc2VsZWN0aW9uVGV4dC5jb250YWlucyhfUFJFRklYX0EpXHJcblx0XHRcdHx8IHNlbGVjdGlvblRleHQuY29udGFpbnMoX1NVRkZJWClcclxuXHRcdDtcclxuXHJcblx0XHRyZXN1bHQuY2FuRGVjcnlwdCA9IHJlc3VsdC5oYXNFbmNyeXB0ZWRQcmVmaXggJiYgcmVzdWx0Lmhhc0RlY3J5cHRTdWZmaXg7XHJcblx0XHRyZXN1bHQuY2FuRW5jcnlwdCA9ICFyZXN1bHQuaGFzRW5jcnlwdGVkUHJlZml4ICYmICFyZXN1bHQuY29udGFpbnNFbmNyeXB0ZWRNYXJrZXJzO1xyXG5cdFx0XHJcblx0XHQvL2NvbnNvbGUuZGVidWcocmVzdWx0KTtcclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBwcm9jZXNzU2VsZWN0aW9uKFxyXG5cdFx0Y2hlY2tpbmc6IGJvb2xlYW4sXHJcblx0XHRlZGl0b3I6IEVkaXRvcixcclxuXHRcdHNlbGVjdGlvblRleHQ6IHN0cmluZyxcclxuXHRcdGZpbmFsU2VsZWN0aW9uU3RhcnQ6IENvZGVNaXJyb3IuUG9zaXRpb24sXHJcblx0XHRmaW5hbFNlbGVjdGlvbkVuZDogQ29kZU1pcnJvci5Qb3NpdGlvbixcclxuXHRcdGRlY3J5cHRJblBsYWNlOiBib29sZWFuXHJcblx0KXtcclxuXHJcblx0XHRjb25zdCBzZWxlY3Rpb25BbmFseXNpcyA9IHRoaXMuYW5hbHlzZVNlbGVjdGlvbihzZWxlY3Rpb25UZXh0KTtcclxuXHJcblx0XHRpZiAoc2VsZWN0aW9uQW5hbHlzaXMuaXNFbXB0eSkge1xyXG5cdFx0XHRpZiAoIWNoZWNraW5nKXtcclxuXHRcdFx0XHRuZXcgTm90aWNlKCdOb3RoaW5nIHRvIEVuY3J5cHQuJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghc2VsZWN0aW9uQW5hbHlzaXMuY2FuRGVjcnlwdCAmJiAhc2VsZWN0aW9uQW5hbHlzaXMuY2FuRW5jcnlwdCkge1xyXG5cdFx0XHRpZiAoIWNoZWNraW5nKXtcclxuXHRcdFx0XHRuZXcgTm90aWNlKCdVbmFibGUgdG8gRW5jcnlwdCBvciBEZWNyeXB0IHRoYXQuJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChjaGVja2luZykge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBGZXRjaCBwYXNzd29yZCBmcm9tIHVzZXJcclxuXHJcblx0XHQvLyBkZXRlcm1pbmUgZGVmYXVsdCBwYXNzd29yZFxyXG5cdFx0Y29uc3QgaXNSZW1lbWJlclBhc3N3b3JkRXhwaXJlZCA9XHJcblx0XHRcdCF0aGlzLnNldHRpbmdzLnJlbWVtYmVyUGFzc3dvcmRcclxuXHRcdFx0fHwgKFxyXG5cdFx0XHRcdHRoaXMucGFzc3dvcmRMYXN0VXNlZEV4cGlyeSAhPSBudWxsXHJcblx0XHRcdFx0JiYgRGF0ZS5ub3coKSA+IHRoaXMucGFzc3dvcmRMYXN0VXNlZEV4cGlyeVxyXG5cdFx0XHQpXHJcblx0XHQ7XHJcblxyXG5cdFx0Y29uc3QgY29uZmlybVBhc3N3b3JkID0gc2VsZWN0aW9uQW5hbHlzaXMuY2FuRW5jcnlwdCAmJiB0aGlzLnNldHRpbmdzLmNvbmZpcm1QYXNzd29yZDtcclxuXHJcblx0XHRpZiAoIGlzUmVtZW1iZXJQYXNzd29yZEV4cGlyZWQgfHwgY29uZmlybVBhc3N3b3JkICkge1xyXG5cdFx0XHQvLyBmb3JnZXQgcGFzc3dvcmRcclxuXHRcdFx0dGhpcy5wYXNzd29yZExhc3RVc2VkID0gJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgcHdNb2RhbCA9IG5ldyBQYXNzd29yZE1vZGFsKHRoaXMuYXBwLCBjb25maXJtUGFzc3dvcmQsIHRoaXMucGFzc3dvcmRMYXN0VXNlZCk7XHJcblx0XHRwd01vZGFsLm9uQ2xvc2UgPSAoKSA9PiB7XHJcblx0XHRcdGNvbnN0IHB3ID0gcHdNb2RhbC5wYXNzd29yZCA/PyAnJ1xyXG5cdFx0XHRpZiAocHcubGVuZ3RoID09IDApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHJlbWVtYmVyIHBhc3N3b3JkP1xyXG5cdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkKSB7XHJcblx0XHRcdFx0dGhpcy5wYXNzd29yZExhc3RVc2VkID0gcHc7XHJcblx0XHRcdFx0dGhpcy5wYXNzd29yZExhc3RVc2VkRXhwaXJ5ID1cclxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MucmVtZW1iZXJQYXNzd29yZFRpbWVvdXQgPT0gMFxyXG5cdFx0XHRcdFx0XHQ/IG51bGxcclxuXHRcdFx0XHRcdFx0OiBEYXRlLm5vdygpICsgdGhpcy5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkVGltZW91dCAqIDEwMDAgKiA2MC8vIG5ldyBleHBpcnlcclxuXHRcdFx0XHRcdDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHNlbGVjdGlvbkFuYWx5c2lzLmNhbkVuY3J5cHQpIHtcclxuXHRcdFx0XHR0aGlzLmVuY3J5cHRTZWxlY3Rpb24oXHJcblx0XHRcdFx0XHRlZGl0b3IsXHJcblx0XHRcdFx0XHRzZWxlY3Rpb25UZXh0LFxyXG5cdFx0XHRcdFx0cHcsXHJcblx0XHRcdFx0XHRmaW5hbFNlbGVjdGlvblN0YXJ0LFxyXG5cdFx0XHRcdFx0ZmluYWxTZWxlY3Rpb25FbmRcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHRpZiAoIXNlbGVjdGlvbkFuYWx5c2lzLmhhc09ic29sZXRlRW5jcnlwdGVkUHJlZml4KXtcclxuXHRcdFx0XHRcdHRoaXMuZGVjcnlwdFNlbGVjdGlvbl9hKFxyXG5cdFx0XHRcdFx0XHRlZGl0b3IsXHJcblx0XHRcdFx0XHRcdHNlbGVjdGlvblRleHQsXHJcblx0XHRcdFx0XHRcdHB3LFxyXG5cdFx0XHRcdFx0XHRmaW5hbFNlbGVjdGlvblN0YXJ0LFxyXG5cdFx0XHRcdFx0XHRmaW5hbFNlbGVjdGlvbkVuZCxcclxuXHRcdFx0XHRcdFx0ZGVjcnlwdEluUGxhY2VcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHR0aGlzLmRlY3J5cHRTZWxlY3Rpb25PYnNvbGV0ZShcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLFxyXG5cdFx0XHRcdFx0XHRzZWxlY3Rpb25UZXh0LFxyXG5cdFx0XHRcdFx0XHRwdyxcclxuXHRcdFx0XHRcdFx0ZmluYWxTZWxlY3Rpb25TdGFydCxcclxuXHRcdFx0XHRcdFx0ZmluYWxTZWxlY3Rpb25FbmQsXHJcblx0XHRcdFx0XHRcdGRlY3J5cHRJblBsYWNlXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cHdNb2RhbC5vcGVuKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFzeW5jIGVuY3J5cHRTZWxlY3Rpb24oXHJcblx0XHRlZGl0b3I6IEVkaXRvcixcclxuXHRcdHNlbGVjdGlvblRleHQ6IHN0cmluZyxcclxuXHRcdHBhc3N3b3JkOiBzdHJpbmcsXHJcblx0XHRmaW5hbFNlbGVjdGlvblN0YXJ0OiBDb2RlTWlycm9yLlBvc2l0aW9uLFxyXG5cdFx0ZmluYWxTZWxlY3Rpb25FbmQ6IENvZGVNaXJyb3IuUG9zaXRpb24sXHJcblx0KSB7XHJcblx0XHQvL2VuY3J5cHRcclxuXHRcdGNvbnN0IGNyeXB0byA9IG5ldyBDcnlwdG9IZWxwZXJWMigpO1xyXG5cdFx0Y29uc3QgYmFzZTY0RW5jcnlwdGVkVGV4dCA9IHRoaXMuYWRkTWFya2Vycyhhd2FpdCBjcnlwdG8uZW5jcnlwdFRvQmFzZTY0KHNlbGVjdGlvblRleHQsIHBhc3N3b3JkKSk7XHJcblx0XHRlZGl0b3Iuc2V0U2VsZWN0aW9uKGZpbmFsU2VsZWN0aW9uU3RhcnQsIGZpbmFsU2VsZWN0aW9uRW5kKTtcclxuXHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGJhc2U2NEVuY3J5cHRlZFRleHQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhc3luYyBkZWNyeXB0U2VsZWN0aW9uX2EoXHJcblx0XHRlZGl0b3I6IEVkaXRvcixcclxuXHRcdHNlbGVjdGlvblRleHQ6IHN0cmluZyxcclxuXHRcdHBhc3N3b3JkOiBzdHJpbmcsXHJcblx0XHRzZWxlY3Rpb25TdGFydDogQ29kZU1pcnJvci5Qb3NpdGlvbixcclxuXHRcdHNlbGVjdGlvbkVuZDogQ29kZU1pcnJvci5Qb3NpdGlvbixcclxuXHRcdGRlY3J5cHRJblBsYWNlOiBib29sZWFuXHJcblx0KSB7XHJcblx0XHQvL2NvbnNvbGUubG9nKCdkZWNyeXB0U2VsZWN0aW9uX2EnKTtcclxuXHRcdC8vIGRlY3J5cHRcclxuXHRcdGNvbnN0IGJhc2U2NENpcGhlclRleHQgPSB0aGlzLnJlbW92ZU1hcmtlcnMoc2VsZWN0aW9uVGV4dCk7XHJcblxyXG5cdFx0Y29uc3QgY3J5cHRvID0gbmV3IENyeXB0b0hlbHBlclYyKCk7XHJcblx0XHRjb25zdCBkZWNyeXB0ZWRUZXh0ID0gYXdhaXQgY3J5cHRvLmRlY3J5cHRGcm9tQmFzZTY0KGJhc2U2NENpcGhlclRleHQsIHBhc3N3b3JkKTtcclxuXHRcdGlmIChkZWNyeXB0ZWRUZXh0ID09PSBudWxsKSB7XHJcblx0XHRcdG5ldyBOb3RpY2UoJ+KdjCBEZWNyeXB0aW9uIGZhaWxlZCEnKTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiAoZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRlZGl0b3Iuc2V0U2VsZWN0aW9uKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpO1xyXG5cdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGRlY3J5cHRlZFRleHQpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnN0IGRlY3J5cHRNb2RhbCA9IG5ldyBEZWNyeXB0TW9kYWwodGhpcy5hcHAsICfwn5STJywgZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0ZGVjcnlwdE1vZGFsLm9uQ2xvc2UgPSAoKSA9PiB7XHJcblx0XHRcdFx0XHRlZGl0b3IuZm9jdXMoKTtcclxuXHRcdFx0XHRcdGlmIChkZWNyeXB0TW9kYWwuZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnNldFNlbGVjdGlvbihzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRlY3J5cHRNb2RhbC5vcGVuKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYXN5bmMgZGVjcnlwdFNlbGVjdGlvbk9ic29sZXRlKFxyXG5cdFx0ZWRpdG9yOiBFZGl0b3IsXHJcblx0XHRzZWxlY3Rpb25UZXh0OiBzdHJpbmcsXHJcblx0XHRwYXNzd29yZDogc3RyaW5nLFxyXG5cdFx0c2VsZWN0aW9uU3RhcnQ6IENvZGVNaXJyb3IuUG9zaXRpb24sXHJcblx0XHRzZWxlY3Rpb25FbmQ6IENvZGVNaXJyb3IuUG9zaXRpb24sXHJcblx0XHRkZWNyeXB0SW5QbGFjZTogYm9vbGVhblxyXG5cdCkge1xyXG5cdFx0Ly9jb25zb2xlLmxvZygnZGVjcnlwdFNlbGVjdGlvbk9ic29sZXRlJyk7XHJcblx0XHQvLyBkZWNyeXB0XHJcblx0XHRjb25zdCBiYXNlNjRDaXBoZXJUZXh0ID0gdGhpcy5yZW1vdmVNYXJrZXJzKHNlbGVjdGlvblRleHQpO1xyXG5cdFx0Y29uc3QgY3J5cHRvID0gbmV3IENyeXB0b0hlbHBlck9ic29sZXRlKCk7XHJcblx0XHRjb25zdCBkZWNyeXB0ZWRUZXh0ID0gYXdhaXQgY3J5cHRvLmRlY3J5cHRGcm9tQmFzZTY0KGJhc2U2NENpcGhlclRleHQsIHBhc3N3b3JkKTtcclxuXHRcdGlmIChkZWNyeXB0ZWRUZXh0ID09PSBudWxsKSB7XHJcblx0XHRcdG5ldyBOb3RpY2UoJ+KdjCBEZWNyeXB0aW9uIGZhaWxlZCEnKTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiAoZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRlZGl0b3Iuc2V0U2VsZWN0aW9uKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpO1xyXG5cdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGRlY3J5cHRlZFRleHQpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnN0IGRlY3J5cHRNb2RhbCA9IG5ldyBEZWNyeXB0TW9kYWwodGhpcy5hcHAsICfwn5STJywgZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0ZGVjcnlwdE1vZGFsLm9uQ2xvc2UgPSAoKSA9PiB7XHJcblx0XHRcdFx0XHRlZGl0b3IuZm9jdXMoKTtcclxuXHRcdFx0XHRcdGlmIChkZWNyeXB0TW9kYWwuZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnNldFNlbGVjdGlvbihzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRlY3J5cHRNb2RhbC5vcGVuKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVtb3ZlTWFya2Vycyh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0aWYgKHRleHQuc3RhcnRzV2l0aChfUFJFRklYX0EpICYmIHRleHQuZW5kc1dpdGgoX1NVRkZJWCkpIHtcclxuXHRcdFx0cmV0dXJuIHRleHQucmVwbGFjZShfUFJFRklYX0EsICcnKS5yZXBsYWNlKF9TVUZGSVgsICcnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0ZXh0LnN0YXJ0c1dpdGgoX1BSRUZJWF9PQlNPTEVURSkgJiYgdGV4dC5lbmRzV2l0aChfU1VGRklYKSkge1xyXG5cdFx0XHRyZXR1cm4gdGV4dC5yZXBsYWNlKF9QUkVGSVhfT0JTT0xFVEUsICcnKS5yZXBsYWNlKF9TVUZGSVgsICcnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhZGRNYXJrZXJzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRpZiAoIXRleHQuY29udGFpbnMoX1BSRUZJWF9PQlNPTEVURSkgJiYgIXRleHQuY29udGFpbnMoX1BSRUZJWF9BKSAmJiAhdGV4dC5jb250YWlucyhfU1VGRklYKSkge1xyXG5cdFx0XHRyZXR1cm4gX1BSRUZJWF9BLmNvbmNhdCh0ZXh0LCBfU1VGRklYKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbmNsYXNzIFNlbGVjdGlvbkFuYWx5c2lze1xyXG5cdGlzRW1wdHk6IGJvb2xlYW47XHJcblx0aGFzT2Jzb2xldGVFbmNyeXB0ZWRQcmVmaXg6IGJvb2xlYW47XHJcblx0aGFzRW5jcnlwdGVkUHJlZml4OiBib29sZWFuO1xyXG5cdGhhc0RlY3J5cHRTdWZmaXg6IGJvb2xlYW47XHJcblx0Y2FuRGVjcnlwdDogYm9vbGVhbjtcclxuXHRjYW5FbmNyeXB0OiBib29sZWFuO1xyXG5cdGNvbnRhaW5zRW5jcnlwdGVkTWFya2VyczogYm9vbGVhbjtcclxufVxyXG4iXSwibmFtZXMiOlsiTW9kYWwiLCJQbGF0Zm9ybSIsIlBsdWdpblNldHRpbmdUYWIiLCJTZXR0aW5nIiwiUGx1Z2luIiwiTm90aWNlIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXVEQTtBQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDdEcsUUFBUSxTQUFTLElBQUksQ0FB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
