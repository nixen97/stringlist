import { listenerCount } from 'process';
import * as vscode from 'vscode';

class Lines {
    _lines: string[];
    _processedLines : string[] | undefined;
    _startLine: number | undefined;
    _endLine: number | undefined;

    constructor(lines: string[], startLine: number | undefined, endLine: number | undefined) {
        this._lines = lines;
        this._startLine = startLine;
        this._endLine = endLine;
    }

    getLines() : string[] {
        return this._lines;
    }

    getStart() : number {
        return this._startLine ?? 0;
    }

    getEnd() : number {
        return (this._endLine ?? this._lines.length) - 1;
    }

    process(processFunc : (value : string) => string,
            postProcessFunc : (arr : string[]) => string[]) : void {
        this._processedLines = postProcessFunc(
            this._lines.map(processFunc)
        );
    }

    getProcessedLines() : string[] | undefined {
        return this._processedLines;
    }

    getProcessedString() : string {
        return this._processedLines?.join("\n") ?? "";
    }
}

export function stringList() {
    let activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showInformationMessage('No active editor!');
        return;
    }

    let lines = getLines(activeEditor);
    lines.process(processLine, removeTrailingSeperator);

    performEdit(activeEditor, lines);
}

function getLines(editor : vscode.TextEditor) : Lines {
    let selection = editor.selection;
    let start : number | undefined = selection.start.line;
    let end : number | undefined = selection.end.line;

    let lines = editor.document.getText().split('\n');

    if (selection.isEmpty)  {
        start = end = undefined;
    } else {
        if (selection.end.character > 0) {
            end++;
        }
    }

    lines = lines
        .slice(start, end)
        .map(s => s.trim());

    return new Lines(lines, start, end);
}

function processLine(s : string) : string {
    if (isEmpty(s)) {
        return s;
    }

    s = escapeQuotes(s);
    s = quoteString(s);
    s = addSeperator(s);
    return s;
}

function escapeQuotes(s : string) : string {
    return s.replace("'", "''");
}

function quoteString(s : string) : string {
    return "'" + s + "'";
}

function addSeperator(s : string) : string {
    return s + ",";
}

function removeTrailingSeperator(arr : string[]) : string[] {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (!isEmpty(arr[i])) {
            arr[i] = arr[i].slice(undefined, arr[i].length - 1);
            break;
        }
    }
    return arr;
}

function performEdit(editor : vscode.TextEditor, lines : Lines) : void {
    const document = editor.document;

    editor.edit(editBuilder => {
        let range = new vscode.Range(
            document.lineAt(lines.getStart()).range.start,
            document.lineAt(lines.getEnd()).range.end
        );

        editBuilder.replace(range, lines.getProcessedString());
    });
}

function isEmpty(s : string) : boolean {
    return 0 === s
    .trim()
    .length;
}
