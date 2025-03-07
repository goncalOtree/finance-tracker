import { NextResponse } from 'next/server';
import generateExcelBuffer from "@/app/scripts/generateExcel"; // You'll need to create this

export async function POST(req: Request): Promise<Response> {
  try {
    const { transactions, year } = await req.json();

    // Validate input
    if (!transactions || !Array.isArray(transactions) || !year) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Sanitize year to prevent path traversal
    const sanitizedYear = year.toString().replace(/[^0-9]/g, '');
    
    // Generate Excel buffer directly without writing to disk
    const excelBuffer = await generateExcelBuffer(transactions);

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
  }
}