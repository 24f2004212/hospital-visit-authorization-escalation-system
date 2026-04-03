'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && adminOnly) {
      const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user.role);
      if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, adminOnly, router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading CareSync...</p>
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && !['admin', 'warden', 'proctor', 'guard'].includes(user.role)) return null;

  return children;
}
