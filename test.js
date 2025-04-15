// test.js
// This program uses the TableGenerator class to generate a table from a template file
// and saves the results to a JSON file with pretty printing.

const fs = require('fs');
const path = require('path');

// Import the TableGenerator class
const TableGenerator = require('./jw-table-generator.js');

// Function to read a JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Function to write a JSON file with pretty printing
function writeJsonFile(filePath, data) {
  try {
    // Format the table data with one row per line
    const jsonString = "[\n" + 
      data.map((row, index) => 
        "  " + JSON.stringify(row) + (index < data.length - 1 ? "," : "")
      ).join("\n") + 
    "\n]";
    
    // Write the JSON string to the file
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`Table data successfully written to ${filePath}`);
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Main function
function main() {
  // Define file paths
  const templateFilePath = path.join(__dirname, 'test_template.JSON');
  const outputFilePath = path.join(__dirname, 'test_output.JSON');
  
  // Check if template file exists
  if (!fs.existsSync(templateFilePath)) {
    console.error(`Template file not found: ${templateFilePath}`);
    console.error('Please create a test_template.JSON file in the same directory as this script.');
    process.exit(1);
  }
  
  // Read the template file
  console.log(`Reading template from ${templateFilePath}...`);
  const template = readJsonFile(templateFilePath);
  
  // Create a new instance of TableGenerator
  const generator = new TableGenerator();
  
  // Generate the table
  console.log('Generating table...');
  const table = generator.generate(template);
  
  // Write the table to the output file
  console.log(`Writing table to ${outputFilePath}...`);
  writeJsonFile(outputFilePath, table);
  
  console.log('Done!');
}

// Run the main function
main(); 