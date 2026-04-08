import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Squarespace Template Finder',
  description: 'Paste any website URL to detect platform, Squarespace version, and find the best rebuild template.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
