import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'FormulaHub',
  description: 'Hub comparativo de fórmulas entre Excel, DAX, Power Fx, SQL e Python',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="dark">
      <body suppressHydrationWarning className="bg-zinc-950">{children}</body>
    </html>
  );
}
