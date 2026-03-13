import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Interactions Dashboard',
  description: 'Extract and analyze interactions between private security, law enforcement, and activists',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-parchment text-ink min-h-screen">{children}</body>
    </html>
  );
}
