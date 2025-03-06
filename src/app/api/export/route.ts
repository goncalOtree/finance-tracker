import { spawn } from "child_process";
import { writeFile, unlink, access, readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let filePath = '';
  let excelPath = '';

  try {
    const { transactions, year } = await req.json();

    // Validate input
    if (!transactions || !Array.isArray(transactions) || !year) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Sanitize year to prevent path traversal
    const sanitizedYear = year.toString().replace(/[^0-9]/g, '');
    filePath = path.join(process.cwd(), `public/transactions_${sanitizedYear}.json`);
    excelPath = path.join(process.cwd(), `public/transactions_${sanitizedYear}.xlsx`);

    // Write transactions to JSON file
    await writeFile(filePath, JSON.stringify(transactions));

    return new Promise((resolve, reject) => {
      // Detailed logging of file paths and spawn details
      console.log('Spawning Python process with:');
      console.log('Script path:', path.resolve('src/app/scripts/export_excel.py'));
      console.log('Input JSON path:', filePath);

      const pythonProcess = spawn("python3", ["src/app/scripts/export_excel.py", filePath], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Capture stdout
      let stdoutData = '';
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        console.log('Python STDOUT:', data.toString());
      });

      // Capture stderr
      let stderrData = '';
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.error('Python STDERR:', data.toString());
      });

      pythonProcess.on("close", async (code) => {
        console.log('Python process exit code:', code);
        console.log('STDOUT:', stdoutData);
        console.log('STDERR:', stderrData);

        // Log additional file checks
        try {
          const stats = await access(excelPath);
          console.log('Excel file exists, stats:', stats);
        } catch (accessError) {
          console.error('Excel file access error:', accessError);
        }

        if (code !== 0) {
          return reject(
            NextResponse.json({ 
              error: "Export process failed",
              exitCode: code,
              stderr: stderrData
            }, { status: 500 })
          );
        }

        try {
          // Attempt to read the Excel file
          const excelBuffer = await readFile(excelPath);

          const response = new NextResponse(excelBuffer, {
            headers: {
              "Content-Disposition": `attachment; filename=transactions_${sanitizedYear}.xlsx`,
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          });

          resolve(response);
        } catch (fileError) {
          console.error('Excel file read error:', fileError);
          reject(
            NextResponse.json({ 
              error: "Failed to read Excel file",
              details: fileError instanceof Error ? fileError.message : 'Unknown error'
            }, { status: 500 })
          );
        }
      });

      // Handle process spawn errors
      pythonProcess.on('error', (spawnError) => {
        console.error('Process spawn error:', spawnError);
        reject(
          NextResponse.json({ 
            error: "Failed to start export process",
            details: spawnError.message 
          }, { status: 500 })
        );
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: "Unexpected server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    
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