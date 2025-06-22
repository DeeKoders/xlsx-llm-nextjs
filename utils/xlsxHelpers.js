import xlsx from 'xlsx';

export function excelSerialToDate(serial) {
  if (typeof serial !== 'number') return serial;
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${month}-${year}`;
}

export function isExcelDateSerial(value) {
  return typeof value === 'number' && value > 40000 && value < 50000;
}

export function extractXlsxData(filePath) {
  const workbook = xlsx.readFile(filePath);
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: true });
  const headers = jsonData[0];

  const formattedHeaders = headers.map((header) =>
    isExcelDateSerial(header) ? excelSerialToDate(header) : header
  );

  let nameColumnIndex = headers.findIndex(
    h => h && h.toString().toLowerCase().includes('name')
  );
  if (nameColumnIndex === -1) nameColumnIndex = 1;

  const result = {};

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    const itemName = row[nameColumnIndex];
    if (!itemName || itemName.toString().toLowerCase() === 'total') continue;

    result[itemName] = {};
    for (let j = 0; j < formattedHeaders.length; j++) {
      if (j === 0 || j === nameColumnIndex) continue;
      const header = formattedHeaders[j];
      const value = row[j];
      if (header && value != null) result[itemName][header] = value;
    }
  }

  return result;
}

export function createDataContext(data) {
  let context = 'I have access to financial data with the following structure:\n\n';
  for (const [category, monthlyData] of Object.entries(data)) {
    context += `${category}:\n`;
    for (const [month, value] of Object.entries(monthlyData)) {
      context += `  ${month}: ${value}\n`;
    }
    context += '\n';
  }
  context += 'I can answer questions about this financial data, including calculations, trends, comparisons, and analysis.';
  return context;
}