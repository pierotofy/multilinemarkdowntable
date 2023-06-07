// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed


function convertTable(highlighted){
	const rows = highlighted.split("\n");
	let colNames = [];
	let dataRows = [];

	for (let i = 0; i < rows.length; i++){
		const row = rows[i].trim();

		if (!row) continue;
		const cols = row.split("|").map(s => s.trim());
		
		if (!cols || cols.length === 1) continue;
		if (!colNames.length && cols.length > 1 && cols[1][0] !== "-" && cols[1][0] !== undefined) colNames = cols.slice(1, -1);
		else if (cols.length > 1){
			if (cols[1][0] === "-" || cols[1][0] === undefined) continue;
			dataRows.push(cols.slice(1, -1));
		}
	}

	// Calculate widths
	const numCols = colNames.length;

	let widths = new Array(numCols);

	for (let i = 0; i < numCols; i++) widths[i] = 0;
	for (let i = 0; i < numCols; i++){
		widths[i] = Math.max(widths[i], colNames[i].length);
		dataRows.forEach(d => {
			widths[i] = Math.max(widths[i], d[i].length);
		});
	}

	const totalWidth = widths.reduce((a, b) => a + b, 0) + (numCols - 1);
	const newline = "\n";
	let out = ["-".repeat(totalWidth)];
	out.push(colNames.map((c, i) => c.padEnd(widths[i] + 1, ' ')).join(""));
	out.push(colNames.map((c, i) => "-".repeat(widths[i])).join(" "))

	for (let i = 0; i < dataRows.length; i++){
		let d = dataRows[i];
		out.push(d.map((f, i) => f.padEnd(widths[i], ' ')).join(" ")); // TODO length
		out.push("");
	}

	return out.join(newline);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "multilinemarkdowntable" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('multilinemarkdowntable.converttable', function () {
		
		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		if (selection && !selection.isEmpty) {
			const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
			const highlighted = editor.document.getText(selectionRange);

			// vscode.window.showInformationMessage(highlighted);
			editor.edit(builder => {
				builder.replace(selection, convertTable(highlighted));
			});
		}


		// Display a message box to the user
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
