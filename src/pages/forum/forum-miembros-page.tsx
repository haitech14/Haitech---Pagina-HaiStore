import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

import { FORUM_TITLE_SUFFIX } from '@/data/site-meta';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useForumMembers } from '@/hooks/use-forum';

export function ForumMiembrosPage() {
  const { data: members = [], isLoading } = useForumMembers();

  useEffect(() => {
    document.title = `Miembros | ${FORUM_TITLE_SUFFIX}`;
  }, []);

  return (
    <div className="container px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link to="/foro" className="text-[hsl(var(--forum-muted))] hover:text-[hsl(var(--forum-accent))]">
          ← Foro
        </Link>
      </nav>
      <h1 className="text-2xl font-bold">Miembros</h1>
      <p className="mt-2 text-sm text-[hsl(var(--forum-muted))]">
        Colaboradores más activos de la comunidad HaiStore.
      </p>
      <ul className="mt-6 space-y-3" role="list">
        {isLoading ? (
          <li className="text-sm text-[hsl(var(--forum-muted))]" role="status">
            Cargando miembros…
          </li>
        ) : (
          members.map((member, index) => (
            <li
              key={member.id}
              className="flex items-center gap-3 rounded-xl border border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))] p-4"
            >
              <span className="w-6 text-sm font-bold text-[hsl(var(--forum-accent))]">{index + 1}</span>
              <Avatar className="size-10">
                <AvatarFallback className="bg-[hsl(var(--forum-accent)/0.15)] text-sm font-semibold text-[hsl(var(--forum-accent))]">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{member.name}</p>
                <p className="text-xs text-[hsl(var(--forum-muted))]">
                  {member.forumTitle ?? 'Miembro'} · Nivel {member.forumLevel}
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-400">
                <Crown className="size-4" aria-hidden="true" />
                {member.forumPoints}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
