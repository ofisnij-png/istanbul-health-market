import './styles.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Istanbul Health Market',
  description: 'Каталог товаров Istanbul Health Market'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
