const fs = require("fs");
const TableGenerator = require("./jw-table-generator");
const generator = new TableGenerator();


// Read and parse the template JSON file
let templateData;
try {
    templateData = JSON.parse(fs.readFileSync("demo_template.json", "utf8"));
} catch (error) {
    console.log("Error reading or parsing template.json: " + error.message);
    return;
}

var customLibrary = {
    "foo": ["bar", "baz", "qux"]
}
var table = generator.generate(templateData, customLibrary);
console.table(table);