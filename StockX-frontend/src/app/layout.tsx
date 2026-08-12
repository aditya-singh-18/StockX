import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StockX — Mini ERP + CRM Operations Portal',
  description: 'Operations portal for wholesale distribution, inventory, and sales challan fulfillment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAFA] text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
