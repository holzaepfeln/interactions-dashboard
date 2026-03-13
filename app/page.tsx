'use client';

import { useState, useCallback } from 'react';
import { Interaction, AnalysisResult, getPageNumber } from '@/lib/types';
import DropZone from '@/components/DropZone';
import DocumentViewer from '@/components/DocumentViewer';
import InteractionPanel from '@/components/InteractionPanel';

/** Generate a short document ID from filename */
function generateDocId(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, ''); // strip extension
  // Use first chunk that looks like an ID (e.g. AS1091) or first 12 chars
  const idMatch = base.match(/[A-Z]{1,4}\d{3,6}/);
  if (idMatch) return idMatch[0];
  return base.substring(0, 16).replace(/[^a-zA-Z0-9]/g, '_');
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);

  const handleFileAccepted = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setActiveInteractionId(null);

    try {
      // Step 1: Parse the document
      let text: string;
      let pageBreaks: number[] = [0];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'txt') {
        text = await file.text();
      } else {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const parseRes = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, fileName: file.name, mimeType: file.type }),
        });

        if (!parseRes.ok) {
          throw new Error('Failed to parse document');
        }

        const parseData = await parseRes.json();
        text = parseData.text;
        pageBreaks = parseData.pageBreaks || [0];
      }

      if (!text.trim()) {
        throw new Error('Document appears to be empty');
      }

      // Step 2: Analyze with Claude
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const analyzeData = await analyzeRes.json();

      // Add page numbers based on character offset
      const interactions: Interaction[] = analyzeData.interactions.map(
        (item: Interaction) => ({
          ...item,
          pageNumber: getPageNumber(item.characterOffset, pageBreaks),
        })
      );

      const documentId = generateDocId(file.name);

      setResult({
        interactions,
        documentText: text,
        fileName: file.name,
        documentId,
        pageBreaks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInteractionClick = useCallback((id: string) => {
    setActiveInteractionId((prev) => (prev === id ? null : id));
  }, []);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setActiveInteractionId(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-midnight text-parchment px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-terracotta mb-1">
              Document Analysis
            </p>
            <h1 className="font-serif text-2xl font-light">
              Interactions Dashboard
            </h1>
          </div>
          {result && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-[0.6rem] tracking-wider text-pebble uppercase block">
                  {result.fileName}
                </span>
                <span className="font-mono text-[0.55rem] tracking-wider text-pebble/60 uppercase">
                  ID: {result.documentId}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded text-[0.65rem] font-mono tracking-wider uppercase bg-steel-blue text-white hover:bg-horizon-blue transition-colors"
              >
                New Document
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-terracotta/10 border border-terracotta/20 text-terracotta text-sm font-mono">
            {error}
          </div>
        )}

        {!result ? (
          <div className="flex-1 px-6">
            <DropZone onFileAccepted={handleFileAccepted} isLoading={isLoading} />
          </div>
        ) : (
          <div className="flex-1 flex gap-6 overflow-hidden" style={{ padding: '24px 24px 24px 28px' }}>
            {/* Left: Document viewer card */}
            <div className="w-[55%] flex flex-col rounded-lg border border-hairline bg-warm-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-hairline bg-parchment flex items-center justify-between flex-shrink-0">
                <h2 className="font-serif text-lg font-light text-ink">Document</h2>
                <span className="font-mono text-[0.6rem] tracking-wider text-pebble uppercase">
                  {result.documentText.length.toLocaleString()} characters &middot; {result.pageBreaks.length} pages
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <DocumentViewer
                  text={result.documentText}
                  interactions={result.interactions}
                  activeInteractionId={activeInteractionId}
                />
              </div>
            </div>

            {/* Right: Interactions panel card */}
            <div className="flex-1 flex flex-col rounded-lg border border-hairline bg-warm-white shadow-sm overflow-hidden">
              <InteractionPanel
                interactions={result.interactions}
                activeInteractionId={activeInteractionId}
                onInteractionClick={handleInteractionClick}
                documentId={result.documentId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
