import type { ReactNode } from 'react';

interface AdminModuleLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminModuleLayout({ title, description, children }: AdminModuleLayoutProps) {
  return (
    <div className="space-y-3">
      <header>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </header>
      {children}
    </div>
  );
}
