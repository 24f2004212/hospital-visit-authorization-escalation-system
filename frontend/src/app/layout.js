import './globals.css';
import ClientProviders from '@/components/ClientProviders';

export const metadata = {
  title: 'CareSync — Hospital Visit Authorization System',
  description: 'CareSync: A comprehensive hospital visit authorization and escalation system for hostel management. Submit requests, track visits, and manage student safety.',
  keywords: 'hospital visit, authorization, hostel management, student safety, CareSync',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#060918" />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
