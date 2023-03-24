import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, getIcon, Setting, Command, ToggleComponent, MenuItem } from 'obsidian';
interface InsertRTLSettings {
	showStatusBar: boolean;
	showRightClick: boolean;
}

const DEFAULT_SETTINGS: InsertRTLSettings = {
	showStatusBar: true,
	showRightClick: true,
}

export default class InsertInvisibleRTL extends Plugin {
	settings: InsertRTLSettings;
	async onload() {
		await this.loadSettings();

		const InsertInvisibleCharCommand: Command = {
			id: 'invisibleCharacter',
			name: 'Insert invisible Character',
			editorCallback:(editor: Editor, view: MarkdownView) => {
				let noticeContent = document.createDocumentFragment();
				noticeContent.createEl('div', {text: '🔔 Character has been inserted',
				attr: {style: 'font-size: 1.2em;'}});
				// @ts-ignore
				editor.replaceSelection('؜');
				new Notice(noticeContent, 2000);
			}
		};
	
		const onClickStatusBarItem = (evt: MouseEvent) => {
			if (2 === evt.button) {
				new MoreInfoModal(this.app).open();
			} else {
				//@ts-ignore
				this.app.commands.executeCommandById(InsertInvisibleCharCommand.id);
			}
		}
		
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		var statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setAttr("id", "statusButton");
		statusBarItemEl.setAttr("aria-label", "Insert a Invisible RTL Character (click right for more info)");
		statusBarItemEl.setAttr("aria-label-position", "top");
		statusBarItemEl.addClass("mod-clickable");
		statusBarItemEl.onClickEvent((this, onClickStatusBarItem));
		statusBarItemEl.style.display = "block";
		// @ts-ignore
		const languageIcon1: any = (0, getIcon('pilcrow'));
		languageIcon1.style.transform = "rotateY(180deg)";
		statusBarItemEl.appendChild(languageIcon1);
		statusBarItemEl =  statusBarItemEl.createEl("span");
		statusBarItemEl.setText('InsertRTL');
		statusBarItemEl.style.marginLeft = "5px";

		this.addSettingTab(new TabsForSettings(this.app, this));

		this.addCommand(InsertInvisibleCharCommand);
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu) => {
				if (this.settings.showRightClick) {
					menu.addItem((item) => {
						item.setTitle("InsertRTL")
						.setIcon("pilcrow")
						.onClick((evt: MouseEvent) => {
							onClickStatusBarItem(evt);
						});
					});
				}
				
			})
		);
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async changeStatusBar() {
		// get element by id
		var statusBarItemEl = document.getElementById("statusButton");
		// don't forget to check for null
		if (statusBarItemEl === null) {
			return;
		}
		statusBarItemEl.style.display = this.settings.showStatusBar ? "block" : "none";
	}
}

class MoreInfoModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		// make the word AFTER bold and red
		contentEl.innerHTML = 'This Plugin Insert a invisible RTL Character (U+061C) in Unicode' +
		 '<h1 style="color:#ff0000; text-align: center;">AFTER</h1>' + 
		 'the cursor, so that other Plugins or programs can correctly display RTL text even if the First Character is in LTR languages.';
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class TabsForSettings extends PluginSettingTab {
	plugin: InsertInvisibleRTL;

	constructor(app: App, plugin: InsertInvisibleRTL) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Plugin Button Display.'});

		new Setting(containerEl)
		.setName('Show/Hilde from Status Bar')
		.setDesc('turn on to show insert button, or turn off to hide.')
		.addToggle((toggle) => toggle.setValue(this.plugin.settings.showStatusBar)
			.onChange((value) => {
				this.plugin.settings.showStatusBar = !this.plugin.settings.showStatusBar;
				this.plugin.saveSettings();
				this.plugin.changeStatusBar();
			})
		);

		// add new right click menu
		new Setting(containerEl)
		.setName('Show/Hilde from Right Click Menu')
		.setDesc('turn on to show insert button, or turn off to hide.')
		.addToggle((toggle) => toggle.setValue(this.plugin.settings.showRightClick)
			.onChange((value) => {
			this.plugin.settings.showRightClick = !this.plugin.settings.showRightClick;
			this.plugin.saveSettings();
		}));
		
	}
}
