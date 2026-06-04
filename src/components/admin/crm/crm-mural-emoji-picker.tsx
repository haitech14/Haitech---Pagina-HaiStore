import { Smile } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CRM_MURAL_QUICK_EMOJIS } from '@/lib/crm-mural-emojis';
import { cn } from '@/lib/utils';

interface CrmMuralEmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function CrmMuralEmojiPicker({
  onSelect,
  className,
  align = 'end',
}: CrmMuralEmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn('h-8 gap-1.5 px-2 text-xs text-muted-foreground', className)}
          aria-label="Insertar emoticono"
        >
          <Smile className="size-4" aria-hidden="true" />
          Emoticones
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto max-w-[18rem] p-2">
        <p className="mb-2 px-1 text-[0.65rem] font-medium text-muted-foreground">
          Toca para insertar en el campo activo
        </p>
        <div
          className="grid grid-cols-6 gap-0.5 sm:grid-cols-8"
          role="listbox"
          aria-label="Emoticones rápidos"
        >
          {CRM_MURAL_QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="option"
              className="flex size-9 items-center justify-center rounded-md text-lg leading-none transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onSelect(emoji)}
              aria-label={`Insertar ${emoji}`}
            >
              <span className="text-emoji" aria-hidden="true">
                {emoji}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
