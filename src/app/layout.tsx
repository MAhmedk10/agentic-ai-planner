// src/app/layout.tsx
import './globals.css';
import { Providers } from '@/app/provider'

export const metadata = {
  title: 'Personal AI Planner',
  description: 'AI that helps you plan smartly',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
