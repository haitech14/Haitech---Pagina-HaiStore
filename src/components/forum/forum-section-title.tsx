interface ForumSectionTitleProps {
  id: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ForumSectionTitle({ id, children, action }: ForumSectionTitleProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-2 text-lg font-bold text-[hsl(var(--forum-fg))]">
        <span
          className="inline-block h-5 w-1 rounded-full bg-[hsl(var(--forum-accent))]"
          aria-hidden="true"
        />
        {children}
      </h2>
      {action}
    </div>
  );
}
