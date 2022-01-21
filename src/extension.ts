import * as vscode from 'vscode';
import * as SL from './stringList';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('stringlist.stringList', SL.stringList);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
