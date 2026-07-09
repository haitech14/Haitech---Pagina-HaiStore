import {
  Cake,
  Eye,
  GraduationCap,
  Handshake,
  Heart,
  Home,
  MoreVertical,
  Pin,
  Rocket,
  Target,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MuralBlogPost } from '@/types/mural-blog';

const THUMBNAIL_ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  handshake: Handshake,
  graduation: GraduationCap,
  cake: Cake,
  target: Target,
  wrench: Wrench,
  home: Home,
  heart: Heart,
};

function MuralPostThumbnail({ post }: { post: MuralBlogPost }) {
  const thumb = post.thumbnail;

  if (!thumb) {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted sm:size-20">
        <span className="text-lg font-bold text-muted-foreground">{post.author.initials}</span>
      </div>
    );
  }

  if (thumb.type === 'image' && thumb.src) {
    return (
      <div className="size-16 shrink-0 overflow-hidden rounded-lg sm:size-20">
        <img
          src={thumb.src}
          alt=""
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  const Icon = THUMBNAIL_ICONS[thumb.icon ?? ''] ?? Rocket;

  return (
    <div
      className="flex size-16 shrink-0 items-center justify-center rounded-lg sm:size-20"
      style={{ backgroundColor: thumb.bgColor }}
    >
      <Icon
        className="size-7 sm:size-8"
        style={{ color: thumb.iconColor ?? '#64748B' }}
        aria-hidden="true"
      />
    </div>
  );
}

interface MuralPostCardProps {
  post: MuralBlogPost;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function MuralPostCard({ post, isSelected, onSelect }: MuralPostCardProps) {
  return (
    <article
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-colors hover:bg-muted/20 sm:gap-4 sm:p-4',
        isSelected && 'border-[hsl(var(--admin-accent))]/40 bg-[hsl(var(--admin-accent))]/5',
      )}
      onClick={() => onSelect?.(post.id)}
    >
      <MuralPostThumbnail post={post} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-1 flex-1 text-sm font-semibold text-foreground">{post.title}</h3>
          {post.pinned ? (
            <Pin className="size-3.5 shrink-0 text-amber-500" aria-label="Publicación fijada" />
          ) : null}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="inline-flex size-5 items-center justify-center rounded-full text-[0.5625rem] font-bold text-white"
            style={{ backgroundColor: post.author.color }}
            aria-hidden="true"
          >
            {post.author.initials}
          </span>
          <span className="text-xs text-muted-foreground">{post.author.name}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Más opciones"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>

        <div className="text-right">
          <p className="whitespace-nowrap text-[0.6875rem] text-muted-foreground">
            {post.publishedAt}
          </p>
          <div className="mt-1 flex items-center justify-end gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" aria-hidden="true" />
              {post.views}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3" aria-hidden="true" />
              {post.reactions}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
