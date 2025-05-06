import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'resume', 'resume.pdf');
  const fileBuffer = await fs.promises.readFile(filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Abdul Rahman (abdxdev) - Resume.pdf"',  // controls the filename in the download dialog
    },
  });
}