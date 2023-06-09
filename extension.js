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
	out.push(colNames.map((c, i) => "-".repeat(widths[i])).join(" "));

	for (let i = 0; i < dataRows.length; i++){
		let d = dataRows[i];
		out.push(d.map((f, i) => f.padEnd(widths[i], ' ')).join(" ")); // TODO length
		out.push("");
	}
	out.push("-".repeat(totalWidth));
	out.push("");

	return out.join(newline);
}

function formatTable(highlighted, textWidths){

    const widthsPerc = textWidths.split(",").map(t => t.trim()).filter(t => t.length > 0).map(parseFloat);
    let wSum = widthsPerc.reduce((acc, w) => acc + w, 0);
    if (wSum < 100) widthsPerc[widthsPerc.length - 1] += (100 - wSum);

    const rows = highlighted.split("\n");
    let dataRows = [];

    for (let i = 0; i < rows.length; i++){
        const row = rows[i].trim();

        if (!row) continue;
        dataRows.push(row);
    }


    let i = 0;
    for (; i < dataRows.length; i++){
        if (dataRows[i].indexOf("---") === 0) break;
    }

    if (dataRows.length < 3 || dataRows[i].indexOf("---") !== 0 && dataRows[i+2].indexOf("---") !== 0) return;

    let colLens = dataRows[i+2].split(/\s+/).map(c => c.trim().length);
    if (colLens.length === 0) return;

    //console.log("colLens", colLens);

    let cols = [];
    let start = 0;
    for (let j = 0; j < colLens.length; j++){
        let col = dataRows[i+1].slice(start, start + colLens[j]).trim();
        cols.push(col);
        start += colLens[j] + 1;
    }

    let dataCols = [];
    for (let j = 3; j < dataRows.length; j++){
        let start = 0;
        let data = [];
        for (let k = 0; k < colLens.length; k++){
            let d = dataRows[j].slice(start, start + colLens[k]).trim();

            //console.log("::", d)
            if (d === "") continue;
            if (d.indexOf("---") === 0) break;
            data.push(d);
            start += colLens[k] + 1;
        }

        if (data.length > 0) dataCols.push(data);
    }
    
    //console.log("widthsPerc", widthsPerc)
    if (colLens.length !== widthsPerc.length) return;

    let totalWidth = dataRows.reduce((acc, d) => Math.max(acc, d.length), 0) - (colLens.length - 1);
    
    let minPerc = Infinity;
    let minPercIdx = -1;
    widthsPerc.forEach((w, idx) => {
        if (w < minPerc){
            minPercIdx = idx;
            minPerc = w;
        }else if (w === minPerc && colLens[idx] > colLens[minPercIdx]){
            minPercIdx = idx;
            minPerc = w;
        }
    });

    let factor = colLens[minPercIdx] / minPerc;
    let widths = widthsPerc.map((w, idx) => Math.max(colLens[idx], Math.ceil(w * factor)));
    //console.log("widths", widths);
    //console.log("minPerc", minPerc);
    //console.log(colLens[minPercIdx], minPerc, factor);
    
    let maxWidth = 0;
    let maxWidthIdx = -1;
    widths.forEach((w, i) => {
        if (w > maxWidth){
            maxWidth = w;
            maxWidthIdx = i;
        }
    });

    factor *= widths[maxWidthIdx] / widthsPerc[maxWidthIdx];
    widths = widthsPerc.map((w, idx) => Math.max(colLens[idx], Math.ceil(w * factor)));
    //console.log(widths);
    totalWidth = widths.reduce((acc, w) => acc + w, 0) + (widths.length - 1);

    let out = [];
    let newline = "\n";

    out.push("-".repeat(totalWidth));
    out.push(cols.map((c, i) => c.padEnd(widths[i], ' ')).join(" "));
    out.push(widths.map((w, i) => '-'.repeat(w)).join(" "));
    for (let j = 0; j < dataCols.length; j++){
        let row = dataCols[j].map((d, i) => d.padEnd(widths[i], ' ')).join(" ");
        out.push(row);
        out.push("");
    }
    out.push("-".repeat(totalWidth));


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
	});

	context.subscriptions.push(disposable);

	let disposable2 = vscode.commands.registerCommand('multilinemarkdowntable.formattable', async function () {
		
		const editor = vscode.window.activeTextEditor;
		const selection = editor.selection;
		if (selection && !selection.isEmpty) {
			const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
			const highlighted = editor.document.getText(selectionRange);

			// vscode.window.showInformationMessage(highlighted);
			const textWidths = await vscode.window.showInputBox({
				placeHolder: "20,20,60",
				prompt: "Type width percentages (comma separated) for each column",
				value: ""
			});
			if (textWidths !== undefined){
				const formatted = formatTable(highlighted, textWidths);
				if (formatted !== undefined){
					editor.edit(builder => {
						builder.replace(selection, formatted);
					});
				}
			}
		}
		
	});

	context.subscriptions.push(disposable2); 
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
