import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { base64, fileName } = await req.json();
    const buffer = Buffer.from(base64, 'base64');
    const ext = fileName.split('.').pop()?.toLowerCase();

    let text = '';
    let pageBreaks: number[] = []; // character offsets where each page starts

    if (ext === 'pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;

      // Estimate page breaks using form feed characters or page markers
      // pdf-parse often inserts \n\n between pages
      // We'll also track by splitting via the numpages count
      const totalPages = data.numpages || 1;
      if (totalPages > 1) {
        // Look for form feed characters first
        const ffPositions: number[] = [0];
        let pos = 0;
        while ((pos = text.indexOf('\f', pos)) !== -1) {
          ffPositions.push(pos + 1);
          pos++;
        }

        if (ffPositions.length >= totalPages) {
          pageBreaks = ffPositions.slice(0, totalPages);
        } else {
          // Fallback: estimate evenly
          const charsPerPage = Math.floor(text.length / totalPages);
          pageBreaks = Array.from({ length: totalPages }, (_, i) => i * charsPerPage);
        }
      } else {
        pageBreaks = [0];
      }
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      pageBreaks = [0]; // DOCX doesn't have reliable page info from raw text
    } else {
      text = buffer.toString('utf-8');
      pageBreaks = [0];
    }

    return NextResponse.json({ text, pageBreaks, totalPages: pageBreaks.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Parse failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
