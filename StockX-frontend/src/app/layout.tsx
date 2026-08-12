import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StockFlow — Mini ERP + CRM Operations Portal',
  description: 'Clean operations portal for customer CRM, inventory tracking, and atomic sales challan fulfillment.',
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
