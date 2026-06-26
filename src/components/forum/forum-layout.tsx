import { Outlet } from 'react-router-dom';

export function ForumLayout() {
  return (
    <div className="forum-shell min-h-full bg-[hsl(var(--forum-bg))] text-[hsl(var(--forum-fg))]">
      <Outlet />
    </div>
  );
}
