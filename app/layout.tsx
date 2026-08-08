import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MotionForge — AI Image to Video',
  description: 'Turn a still image into a cinematic video with AI-powered motion controls.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
