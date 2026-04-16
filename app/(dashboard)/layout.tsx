'use client';
import { Sidebar } from '@/components/shared/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, minHeight: '100vh', padding: '40px 48px' }}>
        {children}
      </main>
    </div>
  );
}
