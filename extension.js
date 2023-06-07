// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

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

				const rows = highlighted.split("\n");
				let colNames = [];
				let dataRows = [];

				for (let i = 0; i < rows.length; i++){
					const row = rows[i].trim();
					if (!row || row[0] !== "|") continue;
					
					const cols = row.split("|").map(s => s.trim());
					if (!cols || (!colNames && cols[0] === "-")) continue;
					
					if (!colNames) colNames = cols;
					else{
						dataRows.push(cols);
					}
				}
				
				let newline = "\n";
				let out = ["-----"]; // TODO: length
				out.push(colNames.join("")); // TODO :length
				out.push(colNames.map(col => "-".repeat(col.length)).join(" "))
				for (let i = 0; i < dataRows.length; i++){
					let d = dataRows[i];
					out.push(d.join(" ")); // TODO length
					out.push("");
				}

				builder.replace(selection, out.join(newline));
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
