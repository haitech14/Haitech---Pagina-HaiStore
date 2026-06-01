import type { ReactNode } from 'react';

interface AdminModuleLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminModuleLayout({ title, description, children }: AdminModuleLayoutProps) {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  );
}
