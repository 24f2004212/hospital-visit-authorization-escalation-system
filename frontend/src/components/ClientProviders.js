'use client';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

function AppShell({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading CareSync...</p>
      </div>
    );
  }

  // Auth pages (no sidebar)
  if (isAuthPage || !user) {
    return <>{children}</>;
  }

  // App pages (with sidebar)
  return (
    <DataProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          {children}
        </main>
      </div>
    </DataProvider>
  );
}

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
