'use client';

import { useState, useCallback, useRef } from 'react';

interface Props {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.txt', '.docx'];

export default function DropZone({ onFileAccepted, isLoading }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileAccepted(file);
    }
  }, [onFileAccepted]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileAccepted(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          w-full max-w-2xl p-16 rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-300 text-center
          ${isDragging
            ? 'border-steel-blue bg-steel-blue/5 scale-[1.02]'
            : 'border-hairline bg-warm-white hover:border-pebble hover:bg-parchment'
          }
          ${isLoading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleInputChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto border-3 border-steel-blue border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-xl text-ink-soft">Analyzing document...</p>
            <p className="text-sm text-pebble">Extracting interactions between entities</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-parchment flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9E9285" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-2xl font-light text-ink mb-2">
                Drop your article here
              </p>
              <p className="text-sm text-ink-soft">
                or click to browse
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {['PDF', 'DOCX', 'TXT'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded text-[0.6rem] font-mono tracking-[0.2em] uppercase text-pebble bg-parchment border border-hairline"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-terracotta font-mono">{error}</p>
      )}
    </div>
  );
}
