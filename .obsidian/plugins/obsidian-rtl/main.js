'use strict';

var obsidian = require('obsidian');

class Settings {
    constructor() {
        this.fileDirections = {};
        this.defaultDirection = 'ltr';
        this.rememberPerFile = true;
    }
    toJson() {
        return JSON.stringify(this);
    }
    fromJson(content) {
        var obj = JSON.parse(content);
        this.fileDirections = obj['fileDirections'];
        this.defaultDirection = obj['defaultDirection'];
        this.rememberPerFile = obj['rememberPerFile'];
    }
}
class RtlPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.settings = new Settings();
        this.SETTINGS_PATH = '.obsidian/rtl.json';
        // This stores the value in CodeMirror's autoCloseBrackets option before overriding it, so it can be restored when
        // we're back to LTR
        this.autoCloseBracketsValue = false;
    }
    onload() {
        console.log('loading RTL plugin');
        this.addCommand({
            id: 'switch-text-direction',
            name: 'Switch Text Direction (LTR<>RTL)',
            callback: () => { this.toggleDocumentDirection(); }
        });
        this.addSettingTab(new RtlSettingsTab(this.app, this));
        this.loadSettings();
        this.registerEvent(this.app.workspace.on('file-open', (file) => {
            if (file && file.path) {
                this.currentFile = file;
                this.adjustDirectionToCurrentFile();
            }
        }));
        this.registerEvent(this.app.vault.on('delete', (file) => {
            if (file && file.path && file.path in this.settings.fileDirections) {
                delete this.settings.fileDirections[file.path];
                this.saveSettings();
            }
        }));
        this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
            if (file && file.path && oldPath in this.settings.fileDirections) {
                this.settings.fileDirections[file.path] = this.settings.fileDirections[oldPath];
                delete this.settings.fileDirections[oldPath];
                this.saveSettings();
            }
        }));
        this.registerDomEvent(document, 'keydown', (ev) => {
            // Patch Home/End issue on RTL: https://github.com/esm7/obsidian-rtl/issues/6
            if (ev.key == 'End' || ev.key == 'Home') {
                let cmEditor = this.getEditor();
                if (cmEditor.getOption("direction") == 'rtl') {
                    // In theory we can execute the following regardless of the editor direction, it should always work,
                    // but it's redundant and the principle in this plugin is to not interfere with Obsidian when the 
                    // direction is LTR
                    if (ev.key == 'End') {
                        cmEditor.execCommand('goLineEnd');
                    }
                    else if (ev.key == 'Home') {
                        cmEditor.execCommand('goLineStartSmart');
                    }
                }
            }
        });
    }
    onunload() {
        console.log('unloading RTL plugin');
    }
    adjustDirectionToCurrentFile() {
        if (this.currentFile && this.currentFile.path) {
            if (this.settings.rememberPerFile && this.currentFile.path in this.settings.fileDirections) {
                // If the user wants to remember the direction per file, and we have a direction set for this file -- use it
                var requiredDirection = this.settings.fileDirections[this.currentFile.path];
            }
            else {
                // Use the default direction
                var requiredDirection = this.settings.defaultDirection;
            }
            this.setDocumentDirection(requiredDirection);
        }
    }
    saveSettings() {
        var settings = this.settings.toJson();
        this.app.vault.adapter.write(this.SETTINGS_PATH, settings);
    }
    loadSettings() {
        this.app.vault.adapter.read(this.SETTINGS_PATH).
            then((content) => this.settings.fromJson(content)).
            catch(error => { console.log("RTL settings file not found"); });
    }
    getEditor() {
        var view = this.app.workspace.activeLeaf.view;
        if (view.getViewType() == 'markdown') {
            var markdownView = view;
            var cmEditor = markdownView.sourceMode.cmEditor;
            return cmEditor;
        }
        return null;
    }
    setDocumentDirection(newDirection) {
        var cmEditor = this.getEditor();
        if (cmEditor && cmEditor.getOption("direction") != newDirection) {
            this.patchAutoCloseBrackets(cmEditor, newDirection);
            cmEditor.setOption("direction", newDirection);
            cmEditor.setOption("rtlMoveVisually", true);
        }
        var view = this.app.workspace.activeLeaf.view;
        if (view && view.previewMode && view.previewMode.containerEl)
            view.previewMode.containerEl.dir = newDirection;
        // Fix the list indentation style
        let listStyle = document.createElement('style');
        document.head.appendChild(listStyle);
        listStyle.sheet.insertRule(".CodeMirror-rtl pre { text-indent: 0px !important; }");
        var leafContainer = this.app.workspace.activeLeaf.containerEl;
        let header = leafContainer.getElementsByClassName('view-header-title-container');
        // let headerStyle = document.createElement('style');
        // header[0].appendChild(headerStyle);
        header[0].style.direction = newDirection;
        this.setExportDirection(newDirection);
    }
    setExportDirection(newDirection) {
        let styles = document.head.getElementsByTagName('style');
        for (let style of styles) {
            if (style.getText().includes('@media print')) {
                style.setText(`@media print { body { direction: ${newDirection}; } }`);
            }
        }
    }
    patchAutoCloseBrackets(cmEditor, newDirection) {
        // Auto-close brackets doesn't work in RTL: https://github.com/esm7/obsidian-rtl/issues/7
        // Until the actual fix is released (as part of CodeMirror), we store the value of autoCloseBrackets when
        // switching to RTL, overriding it to 'false' and restoring it when back to LTR.
        if (newDirection == 'rtl') {
            this.autoCloseBracketsValue = cmEditor.getOption('autoCloseBrackets');
            cmEditor.setOption('autoCloseBrackets', false);
        }
        else {
            cmEditor.setOption('autoCloseBrackets', this.autoCloseBracketsValue);
        }
    }
    toggleDocumentDirection() {
        var cmEditor = this.getEditor();
        if (cmEditor) {
            var newDirection = cmEditor.getOption("direction") == "ltr" ? "rtl" : "ltr";
            this.setDocumentDirection(newDirection);
            if (this.settings.rememberPerFile && this.currentFile && this.currentFile.path) {
                this.settings.fileDirections[this.currentFile.path] = newDirection;
                this.saveSettings();
            }
        }
    }
}
class RtlSettingsTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.settings = plugin.settings;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'RTL Settings' });
        new obsidian.Setting(containerEl)
            .setName('Remember text direction per file')
            .setDesc('Store and remember the text direction used for each file individually.')
            .addToggle(toggle => toggle.setValue(this.settings.rememberPerFile)
            .onChange((value) => {
            this.settings.rememberPerFile = value;
            this.plugin.saveSettings();
            this.plugin.adjustDirectionToCurrentFile();
        }));
        new obsidian.Setting(containerEl)
            .setName('Default text direction')
            .setDesc('What should be the default text direction in Obsidian?')
            .addDropdown(dropdown => dropdown.addOption('ltr', 'LTR')
            .addOption('rtl', 'RTL')
            .setValue(this.settings.defaultDirection)
            .onChange((value) => {
            this.settings.defaultDirection = value;
            this.plugin.saveSettings();
            this.plugin.adjustDirectionToCurrentFile();
        }));
    }
}

module.exports = RtlPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIE1vZGFsLCBNYXJrZG93blZpZXcsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgVEZpbGUsIFRBYnN0cmFjdEZpbGUsIFNldHRpbmcgfSBmcm9tICdvYnNpZGlhbic7XHJcblxyXG5jbGFzcyBTZXR0aW5ncyB7XHJcblx0cHVibGljIGZpbGVEaXJlY3Rpb25zOiB7IFtwYXRoOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xyXG5cdHB1YmxpYyBkZWZhdWx0RGlyZWN0aW9uOiBzdHJpbmcgPSAnbHRyJztcclxuXHRwdWJsaWMgcmVtZW1iZXJQZXJGaWxlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcblx0dG9Kc29uKCkge1xyXG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xyXG5cdH1cclxuXHJcblx0ZnJvbUpzb24oY29udGVudDogc3RyaW5nKSB7XHJcblx0XHR2YXIgb2JqID0gSlNPTi5wYXJzZShjb250ZW50KTtcclxuXHRcdHRoaXMuZmlsZURpcmVjdGlvbnMgPSBvYmpbJ2ZpbGVEaXJlY3Rpb25zJ107XHJcblx0XHR0aGlzLmRlZmF1bHREaXJlY3Rpb24gPSBvYmpbJ2RlZmF1bHREaXJlY3Rpb24nXTtcclxuXHRcdHRoaXMucmVtZW1iZXJQZXJGaWxlID0gb2JqWydyZW1lbWJlclBlckZpbGUnXTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ0bFBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcblxyXG5cdHB1YmxpYyBzZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xyXG5cdHByaXZhdGUgY3VycmVudEZpbGU6IFRGaWxlO1xyXG5cdHB1YmxpYyBTRVRUSU5HU19QQVRIID0gJy5vYnNpZGlhbi9ydGwuanNvbidcclxuXHQvLyBUaGlzIHN0b3JlcyB0aGUgdmFsdWUgaW4gQ29kZU1pcnJvcidzIGF1dG9DbG9zZUJyYWNrZXRzIG9wdGlvbiBiZWZvcmUgb3ZlcnJpZGluZyBpdCwgc28gaXQgY2FuIGJlIHJlc3RvcmVkIHdoZW5cclxuXHQvLyB3ZSdyZSBiYWNrIHRvIExUUlxyXG5cdHByaXZhdGUgYXV0b0Nsb3NlQnJhY2tldHNWYWx1ZTogYW55ID0gZmFsc2U7XHJcblxyXG5cdG9ubG9hZCgpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdsb2FkaW5nIFJUTCBwbHVnaW4nKTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ3N3aXRjaC10ZXh0LWRpcmVjdGlvbicsXHJcblx0XHRcdG5hbWU6ICdTd2l0Y2ggVGV4dCBEaXJlY3Rpb24gKExUUjw+UlRMKScsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB7IHRoaXMudG9nZ2xlRG9jdW1lbnREaXJlY3Rpb24oKTsgfVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBSdGxTZXR0aW5nc1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cclxuXHRcdHRoaXMubG9hZFNldHRpbmdzKCk7XHJcblxyXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLndvcmtzcGFjZS5vbignZmlsZS1vcGVuJywgKGZpbGU6IFRGaWxlKSA9PiB7XHJcblx0XHRcdGlmIChmaWxlICYmIGZpbGUucGF0aCkge1xyXG5cdFx0XHRcdHRoaXMuY3VycmVudEZpbGUgPSBmaWxlO1xyXG5cdFx0XHRcdHRoaXMuYWRqdXN0RGlyZWN0aW9uVG9DdXJyZW50RmlsZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KSk7XHJcblxyXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLnZhdWx0Lm9uKCdkZWxldGUnLCAoZmlsZTogVEFic3RyYWN0RmlsZSkgPT4ge1xyXG5cdFx0XHRpZiAoZmlsZSAmJiBmaWxlLnBhdGggJiYgZmlsZS5wYXRoIGluIHRoaXMuc2V0dGluZ3MuZmlsZURpcmVjdGlvbnMpIHtcclxuXHRcdFx0XHRkZWxldGUgdGhpcy5zZXR0aW5ncy5maWxlRGlyZWN0aW9uc1tmaWxlLnBhdGhdO1xyXG5cdFx0XHRcdHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pKTtcclxuXHJcblx0XHR0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAudmF1bHQub24oJ3JlbmFtZScsIChmaWxlOiBUQWJzdHJhY3RGaWxlLCBvbGRQYXRoOiBzdHJpbmcpID0+IHtcclxuXHRcdFx0aWYgKGZpbGUgJiYgZmlsZS5wYXRoICYmIG9sZFBhdGggaW4gdGhpcy5zZXR0aW5ncy5maWxlRGlyZWN0aW9ucykge1xyXG5cdFx0XHRcdHRoaXMuc2V0dGluZ3MuZmlsZURpcmVjdGlvbnNbZmlsZS5wYXRoXSA9IHRoaXMuc2V0dGluZ3MuZmlsZURpcmVjdGlvbnNbb2xkUGF0aF07XHJcblx0XHRcdFx0ZGVsZXRlIHRoaXMuc2V0dGluZ3MuZmlsZURpcmVjdGlvbnNbb2xkUGF0aF07XHJcblx0XHRcdFx0dGhpcy5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSkpO1xyXG5cclxuXHRcdHRoaXMucmVnaXN0ZXJEb21FdmVudChkb2N1bWVudCwgJ2tleWRvd24nLCAoZXY6IEtleWJvYXJkRXZlbnQpID0+IHtcclxuXHRcdFx0Ly8gUGF0Y2ggSG9tZS9FbmQgaXNzdWUgb24gUlRMOiBodHRwczovL2dpdGh1Yi5jb20vZXNtNy9vYnNpZGlhbi1ydGwvaXNzdWVzLzZcclxuXHRcdFx0aWYgKGV2LmtleSA9PSAnRW5kJyB8fCBldi5rZXkgPT0gJ0hvbWUnKSB7XHJcblx0XHRcdFx0bGV0IGNtRWRpdG9yID0gdGhpcy5nZXRFZGl0b3IoKTtcclxuXHRcdFx0XHRpZiAoY21FZGl0b3IuZ2V0T3B0aW9uKFwiZGlyZWN0aW9uXCIpID09ICdydGwnKSB7XHJcblx0XHRcdFx0XHQvLyBJbiB0aGVvcnkgd2UgY2FuIGV4ZWN1dGUgdGhlIGZvbGxvd2luZyByZWdhcmRsZXNzIG9mIHRoZSBlZGl0b3IgZGlyZWN0aW9uLCBpdCBzaG91bGQgYWx3YXlzIHdvcmssXHJcblx0XHRcdFx0XHQvLyBidXQgaXQncyByZWR1bmRhbnQgYW5kIHRoZSBwcmluY2lwbGUgaW4gdGhpcyBwbHVnaW4gaXMgdG8gbm90IGludGVyZmVyZSB3aXRoIE9ic2lkaWFuIHdoZW4gdGhlIFxyXG5cdFx0XHRcdFx0Ly8gZGlyZWN0aW9uIGlzIExUUlxyXG5cdFx0XHRcdFx0aWYgKGV2LmtleSA9PSAnRW5kJykge1xyXG5cdFx0XHRcdFx0XHRjbUVkaXRvci5leGVjQ29tbWFuZCgnZ29MaW5lRW5kJyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGV2LmtleSA9PSAnSG9tZScpIHtcclxuXHRcdFx0XHRcdFx0Y21FZGl0b3IuZXhlY0NvbW1hbmQoJ2dvTGluZVN0YXJ0U21hcnQnKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0b251bmxvYWQoKSB7XHJcblx0XHRjb25zb2xlLmxvZygndW5sb2FkaW5nIFJUTCBwbHVnaW4nKTtcclxuXHR9XHJcblxyXG5cdGFkanVzdERpcmVjdGlvblRvQ3VycmVudEZpbGUoKSB7XHJcblx0XHRpZiAodGhpcy5jdXJyZW50RmlsZSAmJiB0aGlzLmN1cnJlbnRGaWxlLnBhdGgpIHtcclxuXHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MucmVtZW1iZXJQZXJGaWxlICYmIHRoaXMuY3VycmVudEZpbGUucGF0aCBpbiB0aGlzLnNldHRpbmdzLmZpbGVEaXJlY3Rpb25zKSB7XHJcblx0XHRcdFx0Ly8gSWYgdGhlIHVzZXIgd2FudHMgdG8gcmVtZW1iZXIgdGhlIGRpcmVjdGlvbiBwZXIgZmlsZSwgYW5kIHdlIGhhdmUgYSBkaXJlY3Rpb24gc2V0IGZvciB0aGlzIGZpbGUgLS0gdXNlIGl0XHJcblx0XHRcdFx0dmFyIHJlcXVpcmVkRGlyZWN0aW9uID0gdGhpcy5zZXR0aW5ncy5maWxlRGlyZWN0aW9uc1t0aGlzLmN1cnJlbnRGaWxlLnBhdGhdO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIFVzZSB0aGUgZGVmYXVsdCBkaXJlY3Rpb25cclxuXHRcdFx0XHR2YXIgcmVxdWlyZWREaXJlY3Rpb24gPSB0aGlzLnNldHRpbmdzLmRlZmF1bHREaXJlY3Rpb247XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5zZXREb2N1bWVudERpcmVjdGlvbihyZXF1aXJlZERpcmVjdGlvbik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzYXZlU2V0dGluZ3MoKSB7XHJcblx0XHR2YXIgc2V0dGluZ3MgPSB0aGlzLnNldHRpbmdzLnRvSnNvbigpO1xyXG5cdFx0dGhpcy5hcHAudmF1bHQuYWRhcHRlci53cml0ZSh0aGlzLlNFVFRJTkdTX1BBVEgsIHNldHRpbmdzKTtcclxuXHR9XHJcblxyXG5cdGxvYWRTZXR0aW5ncygpIHtcclxuXHRcdHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucmVhZCh0aGlzLlNFVFRJTkdTX1BBVEgpLlxyXG5cdFx0XHR0aGVuKChjb250ZW50KSA9PiB0aGlzLnNldHRpbmdzLmZyb21Kc29uKGNvbnRlbnQpKS5cclxuXHRcdFx0Y2F0Y2goZXJyb3IgPT4geyBjb25zb2xlLmxvZyhcIlJUTCBzZXR0aW5ncyBmaWxlIG5vdCBmb3VuZFwiKTsgfSk7XHJcblx0fVxyXG5cclxuXHRnZXRFZGl0b3IoKSB7XHJcblx0XHR2YXIgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5hY3RpdmVMZWFmLnZpZXc7XHJcblx0XHRpZiAodmlldy5nZXRWaWV3VHlwZSgpID09ICdtYXJrZG93bicpIHtcclxuXHRcdFx0dmFyIG1hcmtkb3duVmlldyA9IHZpZXcgYXMgTWFya2Rvd25WaWV3O1xyXG5cdFx0XHR2YXIgY21FZGl0b3IgPSBtYXJrZG93blZpZXcuc291cmNlTW9kZS5jbUVkaXRvcjtcclxuXHRcdFx0cmV0dXJuIGNtRWRpdG9yO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cclxuXHRzZXREb2N1bWVudERpcmVjdGlvbihuZXdEaXJlY3Rpb246IHN0cmluZykge1xyXG5cdFx0dmFyIGNtRWRpdG9yID0gdGhpcy5nZXRFZGl0b3IoKTtcclxuXHRcdGlmIChjbUVkaXRvciAmJiBjbUVkaXRvci5nZXRPcHRpb24oXCJkaXJlY3Rpb25cIikgIT0gbmV3RGlyZWN0aW9uKSB7XHJcblx0XHRcdHRoaXMucGF0Y2hBdXRvQ2xvc2VCcmFja2V0cyhjbUVkaXRvciwgbmV3RGlyZWN0aW9uKTtcclxuXHRcdFx0Y21FZGl0b3Iuc2V0T3B0aW9uKFwiZGlyZWN0aW9uXCIsIG5ld0RpcmVjdGlvbik7XHJcblx0XHRcdGNtRWRpdG9yLnNldE9wdGlvbihcInJ0bE1vdmVWaXN1YWxseVwiLCB0cnVlKTtcclxuXHRcdH1cclxuXHRcdHZhciB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmFjdGl2ZUxlYWYudmlldztcclxuXHRcdGlmICh2aWV3ICYmIHZpZXcucHJldmlld01vZGUgJiYgdmlldy5wcmV2aWV3TW9kZS5jb250YWluZXJFbClcclxuXHRcdFx0dmlldy5wcmV2aWV3TW9kZS5jb250YWluZXJFbC5kaXIgPSBuZXdEaXJlY3Rpb247XHJcblxyXG5cdFx0Ly8gRml4IHRoZSBsaXN0IGluZGVudGF0aW9uIHN0eWxlXHJcblx0XHRsZXQgbGlzdFN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuXHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGlzdFN0eWxlKTtcclxuXHRcdGxpc3RTdHlsZS5zaGVldC5pbnNlcnRSdWxlKFwiLkNvZGVNaXJyb3ItcnRsIHByZSB7IHRleHQtaW5kZW50OiAwcHggIWltcG9ydGFudDsgfVwiKTtcclxuXHJcblx0XHR2YXIgbGVhZkNvbnRhaW5lciA9ICh0aGlzLmFwcC53b3Jrc3BhY2UuYWN0aXZlTGVhZiBhcyBhbnkpLmNvbnRhaW5lckVsIGFzIERvY3VtZW50O1xyXG5cdFx0bGV0IGhlYWRlciA9IGxlYWZDb250YWluZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndmlldy1oZWFkZXItdGl0bGUtY29udGFpbmVyJyk7XHJcblx0XHQvLyBsZXQgaGVhZGVyU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG5cdFx0Ly8gaGVhZGVyWzBdLmFwcGVuZENoaWxkKGhlYWRlclN0eWxlKTtcclxuXHRcdChoZWFkZXJbMF0gYXMgYW55KS5zdHlsZS5kaXJlY3Rpb24gPSBuZXdEaXJlY3Rpb247XHJcblxyXG5cdFx0dGhpcy5zZXRFeHBvcnREaXJlY3Rpb24obmV3RGlyZWN0aW9uKTtcclxuXHR9XHJcblxyXG5cdHNldEV4cG9ydERpcmVjdGlvbihuZXdEaXJlY3Rpb246IHN0cmluZykge1xyXG5cdFx0bGV0IHN0eWxlcyA9IGRvY3VtZW50LmhlYWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N0eWxlJyk7XHJcblx0XHRmb3IgKGxldCBzdHlsZSBvZiBzdHlsZXMpIHtcclxuXHRcdFx0aWYgKHN0eWxlLmdldFRleHQoKS5pbmNsdWRlcygnQG1lZGlhIHByaW50JykpIHtcclxuXHRcdFx0XHRzdHlsZS5zZXRUZXh0KGBAbWVkaWEgcHJpbnQgeyBib2R5IHsgZGlyZWN0aW9uOiAke25ld0RpcmVjdGlvbn07IH0gfWApXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHBhdGNoQXV0b0Nsb3NlQnJhY2tldHMoY21FZGl0b3I6IGFueSwgbmV3RGlyZWN0aW9uOiBzdHJpbmcpIHtcclxuXHRcdC8vIEF1dG8tY2xvc2UgYnJhY2tldHMgZG9lc24ndCB3b3JrIGluIFJUTDogaHR0cHM6Ly9naXRodWIuY29tL2VzbTcvb2JzaWRpYW4tcnRsL2lzc3Vlcy83XHJcblx0XHQvLyBVbnRpbCB0aGUgYWN0dWFsIGZpeCBpcyByZWxlYXNlZCAoYXMgcGFydCBvZiBDb2RlTWlycm9yKSwgd2Ugc3RvcmUgdGhlIHZhbHVlIG9mIGF1dG9DbG9zZUJyYWNrZXRzIHdoZW5cclxuXHRcdC8vIHN3aXRjaGluZyB0byBSVEwsIG92ZXJyaWRpbmcgaXQgdG8gJ2ZhbHNlJyBhbmQgcmVzdG9yaW5nIGl0IHdoZW4gYmFjayB0byBMVFIuXHJcblx0XHRpZiAobmV3RGlyZWN0aW9uID09ICdydGwnKSB7XHJcblx0XHRcdHRoaXMuYXV0b0Nsb3NlQnJhY2tldHNWYWx1ZSA9IGNtRWRpdG9yLmdldE9wdGlvbignYXV0b0Nsb3NlQnJhY2tldHMnKTtcclxuXHRcdFx0Y21FZGl0b3Iuc2V0T3B0aW9uKCdhdXRvQ2xvc2VCcmFja2V0cycsIGZhbHNlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNtRWRpdG9yLnNldE9wdGlvbignYXV0b0Nsb3NlQnJhY2tldHMnLCB0aGlzLmF1dG9DbG9zZUJyYWNrZXRzVmFsdWUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dG9nZ2xlRG9jdW1lbnREaXJlY3Rpb24oKSB7XHJcblx0XHR2YXIgY21FZGl0b3IgPSB0aGlzLmdldEVkaXRvcigpO1xyXG5cdFx0aWYgKGNtRWRpdG9yKSB7XHJcblx0XHRcdHZhciBuZXdEaXJlY3Rpb24gPSBjbUVkaXRvci5nZXRPcHRpb24oXCJkaXJlY3Rpb25cIikgPT0gXCJsdHJcIiA/IFwicnRsXCIgOiBcImx0clwiXHJcblx0XHRcdHRoaXMuc2V0RG9jdW1lbnREaXJlY3Rpb24obmV3RGlyZWN0aW9uKTtcclxuXHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MucmVtZW1iZXJQZXJGaWxlICYmIHRoaXMuY3VycmVudEZpbGUgJiYgdGhpcy5jdXJyZW50RmlsZS5wYXRoKSB7XHJcblx0XHRcdFx0dGhpcy5zZXR0aW5ncy5maWxlRGlyZWN0aW9uc1t0aGlzLmN1cnJlbnRGaWxlLnBhdGhdID0gbmV3RGlyZWN0aW9uO1xyXG5cdFx0XHRcdHRoaXMuc2F2ZVNldHRpbmdzKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIFJ0bFNldHRpbmdzVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcblx0c2V0dGluZ3M6IFNldHRpbmdzO1xyXG5cdHBsdWdpbjogUnRsUGx1Z2luO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBSdGxQbHVnaW4pIHtcclxuXHRcdHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHBsdWdpbi5zZXR0aW5ncztcclxuXHR9XHJcblxyXG5cdGRpc3BsYXkoKTogdm9pZCB7XHJcblx0XHRsZXQge2NvbnRhaW5lckVsfSA9IHRoaXM7XHJcblxyXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHJcblx0XHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7dGV4dDogJ1JUTCBTZXR0aW5ncyd9KTtcclxuXHJcblx0XHRuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoJ1JlbWVtYmVyIHRleHQgZGlyZWN0aW9uIHBlciBmaWxlJylcclxuXHRcdFx0LnNldERlc2MoJ1N0b3JlIGFuZCByZW1lbWJlciB0aGUgdGV4dCBkaXJlY3Rpb24gdXNlZCBmb3IgZWFjaCBmaWxlIGluZGl2aWR1YWxseS4nKVxyXG5cdFx0XHQuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGUuc2V0VmFsdWUodGhpcy5zZXR0aW5ncy5yZW1lbWJlclBlckZpbGUpXHJcblx0XHRcdFx0XHQgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XHJcblx0XHRcdFx0XHRcdCAgIHRoaXMuc2V0dGluZ3MucmVtZW1iZXJQZXJGaWxlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdCAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG5cdFx0XHRcdFx0XHQgICB0aGlzLnBsdWdpbi5hZGp1c3REaXJlY3Rpb25Ub0N1cnJlbnRGaWxlKCk7XHJcblx0XHRcdFx0XHQgICB9KSk7XHJcblxyXG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcblx0XHRcdC5zZXROYW1lKCdEZWZhdWx0IHRleHQgZGlyZWN0aW9uJylcclxuXHRcdFx0LnNldERlc2MoJ1doYXQgc2hvdWxkIGJlIHRoZSBkZWZhdWx0IHRleHQgZGlyZWN0aW9uIGluIE9ic2lkaWFuPycpXHJcblx0XHRcdC5hZGREcm9wZG93bihkcm9wZG93biA9PiBkcm9wZG93bi5hZGRPcHRpb24oJ2x0cicsICdMVFInKVxyXG5cdFx0XHRcdFx0XHQgLmFkZE9wdGlvbigncnRsJywgJ1JUTCcpXHJcblx0XHRcdFx0XHRcdCAuc2V0VmFsdWUodGhpcy5zZXR0aW5ncy5kZWZhdWx0RGlyZWN0aW9uKVxyXG5cdFx0XHRcdFx0XHQgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdCB0aGlzLnNldHRpbmdzLmRlZmF1bHREaXJlY3Rpb24gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0XHQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcblx0XHRcdFx0XHRcdFx0IHRoaXMucGx1Z2luLmFkanVzdERpcmVjdGlvblRvQ3VycmVudEZpbGUoKTtcclxuXHRcdFx0XHRcdFx0IH0pKTtcclxuXHR9XHJcbn1cclxuIl0sIm5hbWVzIjpbIlBsdWdpbiIsIlBsdWdpblNldHRpbmdUYWIiLCJTZXR0aW5nIl0sIm1hcHBpbmdzIjoiOzs7O0FBRUEsTUFBTSxRQUFRO0lBQWQ7UUFDUSxtQkFBYyxHQUErQixFQUFFLENBQUM7UUFDaEQscUJBQWdCLEdBQVcsS0FBSyxDQUFDO1FBQ2pDLG9CQUFlLEdBQVksSUFBSSxDQUFDO0tBWXZDO0lBVkEsTUFBTTtRQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM1QjtJQUVELFFBQVEsQ0FBQyxPQUFlO1FBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxH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
