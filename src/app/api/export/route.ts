import { writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import generateExcel from "@/app/scripts/generateExcel";

export async function POST(req: Request): Promise<Response> {
  let filePath = '';
  let excelPath = '';

  try {
    const { transactions, year } = await req.json();

    // Validate input
    if (!transactions || !Array.isArray(transactions) || !year) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Sanitize year to prevent path traversal
    const sanitizedYear = year.toString().replace(/[^0-9]/g, '');
    filePath = path.join(process.cwd(), `public/transactions_${sanitizedYear}.json`);
    excelPath = path.join(process.cwd(), `public/transactions_${sanitizedYear}.xlsx`);

    // Write transactions to JSON file
    await writeFile(filePath, JSON.stringify(transactions));

    // Generate the Excel file
    await generateExcel(filePath, excelPath);

    // Read the generated Excel file
    const excelBuffer = await readFile(excelPath);

    // Return the Excel file as a response
    const response = new NextResponse(excelBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename=transactions_${sanitizedYear}.xlsx`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    return response;
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Unexpected server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  } finally {
    // Clean up files after a delay
    if (filePath) {
      setTimeout(() => {
        unlink(filePath).catch(console.error);
      }, 1000);
    }

    if (excelPath) {
      setTimeout(() => {
        unlink(excelPath).catch(console.error);
      }, 1000);
    }
  }
}