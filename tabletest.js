// highlighted = `|     |     |     |     |     |
// | --- | --- | --- | --- | --- |
// | Type | Name | Description | Schema | Default |
// | **Path** | **uuid**<br> _required_ | UUID of the task | string |  |
// | **Query** | **token**<br> _optional_ | Token required for authentication (when authentication is required). | string |  |
// | **FormData** | **images**<br> _required_ | Images to process, plus optional files such as a GEO file (geo.txt), image groups file (image_groups.txt), GCP file (*.txt), seed file (seed.zip) or alignment files (align.las, align.laz, align.tif). If included, the GCP file should have .txt extension. If included, the seed archive pre-polulates the task directory with its contents. | file |  |
// `;
highlighted = `|     |     |     |
| --- | --- | --- |
| HTTP Code | Description | Schema |
| **200** | Asset File | file |
| **default** | Error message | Error |`;

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
let newline = "\n";
let out = ["-".repeat(totalWidth)];
out.push(colNames.map((c, i) => c.padEnd(widths[i] + 1, ' ')).join(""));
out.push(colNames.map((c, i) => "-".repeat(widths[i])).join(" "))

for (let i = 0; i < dataRows.length; i++){
    let d = dataRows[i];
    out.push(d.map((f, i) => f.padEnd(widths[i], ' ')).join(" ")); // TODO length
    out.push("");
}

console.log(out.join(newline))