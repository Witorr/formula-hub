import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FormulaHub — Seu Glossário de Fórmulas Ativas',
  description: 'Glossário comparativo de fórmulas entre Excel, DAX, Power Fx, SQL e Python. Encontre equivalências, compare sintaxes e visualize fórmulas em ação.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="bg-zinc-950">
        {children}
      </body>
    </html>
  );
}
