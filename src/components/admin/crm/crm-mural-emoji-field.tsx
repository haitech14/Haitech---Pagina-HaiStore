import { useRef } from 'react';

import { CrmMuralEmojiPicker } from '@/components/admin/crm/crm-mural-emoji-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { insertEmojiInField } from '@/lib/crm-mural-emojis';
import { cn } from '@/lib/utils';

interface CrmMuralEmojiFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  hint?: string;
}

export function CrmMuralEmojiField({
  id,
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  className,
  hint,
}: CrmMuralEmojiFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const el = multiline ? textareaRef.current : inputRef.current;
    if (el) {
      const { next, cursor } = insertEmojiInField(
        value,
        emoji,
        el.selectionStart ?? value.length,
        el.selectionEnd ?? value.length,
      );
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(cursor, cursor);
      });
      return;
    }
    onChange(value + emoji);
  };

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </Label>
        <CrmMuralEmojiPicker onSelect={insertEmoji} />
      </div>
      {hint ? (
        <p className="mb-1 text-[0.65rem] text-muted-foreground">{hint}</p>
      ) : null}
      {multiline ? (
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'min-h-[8rem] text-sm leading-relaxed text-emoji',
            className,
          )}
        />
      ) : (
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn('text-sm text-emoji', className)}
        />
      )}
    </div>
  );
}
