export async function parseDocument(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    return await file.text();
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  const res = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, fileName: file.name, mimeType: file.type }),
  });

  if (!res.ok) {
    throw new Error(`Failed to parse document: ${res.statusText}`);
  }

  const data = await res.json();
  return data.text;
}
