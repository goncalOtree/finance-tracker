const ExcelJS = require('exceljs');

const monthDict = {
  janeiro: "F",
  fevereiro: "G",
  março: "H",
  abril: "I",
  maio: "J",
  junho: "K",
  julho: "L",
  agosto: "M",
  setembro: "N",
  outubro: "O",
  novembro: "P",
  dezembro: "Q",
};

async function generateExcel(transactions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");

  // Define formats
  const bold = { bold: true };
  const green = {color: { argb: 'FF00B050' } };
  const greenBold = { bold: true,color: { argb: 'FF00B050' }};
  const redBold = { bold: true,color: { argb: 'FFC00000' }};

  // Organize data
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  const categories = [
    ...new Set(transactions.map((t) => JSON.stringify([t.category.name, t.category.type]))),
  ].map((s) => JSON.parse(s));
  categories.sort((a, b) => a[1].localeCompare(b[1]));

  const numberCategoriesFixo = categories.filter((c) => c[1] === 'FIXO').length;
  const numberCategoriesVencimento = categories.filter(
    (c) => c[1] === 'VENCIMENTO' && c[0] !== 'Vencimentos',
  ).length;
  const numberCategoriesVariavel = categories.filter((c) => c[1] === 'VARIÁVEL').length;

  // Write headers
  worksheet.getCell(4, 2).value = transactions[0].year;
  worksheet.getCell(4, 2).font = bold;

  let col = 6;
  for (const month of months) {
    worksheet.getCell(5, col).value = month;
    worksheet.getCell(5, col).font = bold;
    col++;
  }

  // Write categories and transactions
  let row = 8;
  for (const catType of ['FIXO', 'VENCIMENTO', 'VARIÁVEL']) {
    for (const category of categories) {
      if (category[1] === catType && category[0] !== 'Vencimentos') {
        worksheet.getCell(row, 2).value = category[0];
        if (catType === 'VENCIMENTO') {
          worksheet.getCell(row, 2).font = green;
        }
        col = 6;
        for (const month of months) {
          const total = transactions
            .filter((t) => t.month === month && t.category.name === category[0])
            .reduce((sum, t) => sum + t.amount, 0);
          worksheet.getCell(row, col).value = total;
          col++;
        }
        row++;
      }
    }

    row++;
  }

  // Write totals
  row += 3;
  worksheet.getCell(row, 3).value = 'Total fixo';
  worksheet.getCell(row, 3).font = redBold;
  worksheet.getCell(row + 1, 3).value = 'Total variável';
  worksheet.getCell(row + 1, 3).font = redBold;
  worksheet.getCell(row + 2, 3).value = 'Total Poupança';
  worksheet.getCell(row + 2, 3).font = green;
  worksheet.getCell(row + 4, 3).value = 'Total geral';
  worksheet.getCell(row + 4, 3).font = redBold;
  worksheet.getCell(row + 6, 3).value = 'Vencimentos';
  worksheet.getCell(row + 6, 3).font = green;
  worksheet.getCell(row + 8, 3).value = 'Poupança';
  worksheet.getCell(row + 8, 3).font = greenBold;

  col = 6;
  for (const month of months) {
    const monthCol = monthDict[month];

    worksheet.getCell(row, col).value = { formula: `SUM(${monthCol}8:${monthCol}${8 + numberCategoriesFixo - 1})` };

    const rowVariavel = 8 + numberCategoriesFixo + numberCategoriesVencimento + 2;
    worksheet.getCell(row + 1, col).value = {
      formula: `SUM(${monthCol}${rowVariavel}:${monthCol}${rowVariavel + numberCategoriesVariavel - 1})`,
    };

    const rowPoupanca = rowVariavel - numberCategoriesVencimento - 1;
    worksheet.getCell(row + 2, col).value = {
      formula: `SUM(${monthCol}${rowPoupanca}:${monthCol}${rowPoupanca + numberCategoriesVencimento - 1})`,
    };

    worksheet.getCell(row + 4, col).value = { formula: `SUM(${monthCol}${row}:${monthCol}${row + 1})` };

    const vencimentos = transactions
      .filter((t) => t.month === month && t.category.name === 'Vencimentos')
      .reduce((sum, t) => sum + t.amount, 0);
    worksheet.getCell(row + 6, col).value = vencimentos;

    worksheet.getCell(row + 8, col).value = { formula: `${monthCol}${row + 6}-${monthCol}${row + 4}` };

    col++;
  }

  // Save the workbook
  return await workbook.xlsx.writeBuffer();
}

module.exports = generateExcel;