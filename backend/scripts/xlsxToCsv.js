// Converts the "Adidas data" sheet of the excel file into data/adidas_sales.csv
// Usage: node scripts/xlsxToCsv.js "<path to xlsx>"
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const COLUMNS = [
  'Retailer',
  'Retailer ID',
  'Invoice Date',
  'Region',
  'State',
  'City',
  'Product',
  'Price per Unit',
  'Units Sold',
  'Total Sales',
  'Operating Profit',
  'Operating Margin',
  'Sales Method',
];

function escapeCsv(value) {
  let text = '';
  if (value !== null && value !== undefined) {
    text = String(value);
  }
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatDate(value) {
  if (!(value instanceof Date)) {
    return value;
  }
  // add 12 hours so the timezone shift can't move the date to the day before
  const shifted = new Date(value.getTime() + 12 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

const sourceFile = process.argv[2];
if (!sourceFile) {
  console.error('Usage: node scripts/xlsxToCsv.js <file.xlsx>');
  process.exit(1);
}

const workbook = XLSX.readFile(sourceFile, { cellDates: true });
const sheet = workbook.Sheets['Adidas data'] || workbook.Sheets[workbook.SheetNames[1]];
const rows = XLSX.utils.sheet_to_json(sheet, { raw: true });

const lines = [COLUMNS.join(',')];
for (const row of rows) {
  const values = COLUMNS.map((column) => {
    if (column === 'Invoice Date') {
      return escapeCsv(formatDate(row[column]));
    }
    return escapeCsv(row[column]);
  });
  lines.push(values.join(','));
}

const outputFile = path.join(__dirname, '..', 'data', 'adidas_sales.csv');
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, lines.join('\n'));
console.log(`Wrote ${rows.length} rows to ${outputFile}`);
