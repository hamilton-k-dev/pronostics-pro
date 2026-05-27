'use client';

import { ReactNode } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth-context';
import AdminHeader from '@/components/AdminHeader';

function AdminInnerLayout({ children }: { children: ReactNode }) {
  const { admin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="w-8 h-8 flex items-center justify-center text-indigo-600 animate-spin">
          <i className="ri-loader-4-line text-xl" />
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminHeader />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminInnerLayout>{children}</AdminInnerLayout>
    </AdminAuthProvider>
  );
}
