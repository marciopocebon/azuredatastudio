/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as constants from '../common/constants';

import { BaseProjectTreeItem, MessageTreeItem } from '../models/tree/baseTreeItem';
import { ProjectRootTreeItem } from '../models/tree/projectTreeItem';
import { Project } from '../models/project';

export class SqlDatabaseProjectTreeViewProvider implements vscode.TreeDataProvider<BaseProjectTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<BaseProjectTreeItem | undefined> = new vscode.EventEmitter<BaseProjectTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<BaseProjectTreeItem | undefined> = this._onDidChangeTreeData.event;

	private roots: BaseProjectTreeItem[] = [];

	constructor() {
		this.initialize();
	}

	private initialize() {
		this.roots = [new MessageTreeItem(constants.noOpenProjectMessage)];
	}

	public getTreeItem(element: BaseProjectTreeItem): vscode.TreeItem {
		return element.treeItem;
	}

	public getChildren(element?: BaseProjectTreeItem): BaseProjectTreeItem[] {
		if (element === undefined) {
			return this.roots;
		}

		return element.children;
	}

	public load(projects: Project[]) {
		if (projects.length === 0) {
			vscode.window.showErrorMessage(constants.noSqlProjFiles);
			return;
		}

		let newRoots: BaseProjectTreeItem[] = [];

		for (const proj of projects) {
			newRoots.push(new ProjectRootTreeItem(proj.projectFile));

		}

		this.roots = newRoots;
		this._onDidChangeTreeData.fire();

	}

	public async openProject(projectFiles: vscode.Uri[]) {
		if (projectFiles.length === 0) {
			vscode.window.showErrorMessage(constants.noSqlProjFiles);
			return;
		}

		let newRoots: BaseProjectTreeItem[] = [];
		console.log(`Loading ${projectFiles.length} projects.`);

		for (const proj of projectFiles) {
			console.log('Loading project: ' + proj.fsPath);

			let projectNode = new ProjectRootTreeItem(proj);
			await projectNode.construct();

			newRoots.push(projectNode);
		}

		this.roots = newRoots;
		this._onDidChangeTreeData.fire();
	}
}
