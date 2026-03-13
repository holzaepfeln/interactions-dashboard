'use client';

import { useState, useCallback } from 'react';
import { Interaction, AnalysisResult } from '@/lib/types';
import DropZone from '@/components/DropZone';
import DocumentViewer from '@/components/DocumentViewer';
import InteractionPanel from '@/components/InteractionPanel';

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

      setResult({
        interactions: analyzeData.interactions,
        documentText: text,
        fileName: file.name,
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
              <span className="font-mono text-[0.65rem] tracking-wider text-pebble uppercase">
                {result.fileName}
              </span>
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
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Document viewer */}
            <div className="w-1/2 border-r border-hairline bg-warm-white overflow-hidden flex flex-col">
              <div className="px-6 py-3 border-b border-hairline bg-parchment flex items-center justify-between">
                <h2 className="font-serif text-lg font-light text-ink">Document</h2>
                <span className="font-mono text-[0.6rem] tracking-wider text-pebble uppercase">
                  {result.documentText.length.toLocaleString()} characters
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

            {/* Right: Interactions panel */}
            <div className="w-1/2 bg-parchment overflow-hidden flex flex-col">
              <InteractionPanel
                interactions={result.interactions}
                activeInteractionId={activeInteractionId}
                onInteractionClick={handleInteractionClick}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
