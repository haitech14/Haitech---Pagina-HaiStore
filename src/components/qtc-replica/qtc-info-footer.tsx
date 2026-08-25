import { QTC, QTC_FOOTER_COLUMNS } from '@/data/qtc-replica';
import { cn } from '@/lib/utils';

/**
 * Bloque informativo inferior (dos columnas).
 */
export function QtcInfoFooter({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-white', className)} aria-label="Acerca de QTC">
      <div
        className="mx-auto grid grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2 md:gap-16 xl:px-6"
        style={{ maxWidth: QTC.maxWidth }}
      >
        {QTC_FOOTER_COLUMNS.map((col) => (
          <div key={col.id}>
            <h2 className="text-[18px] font-bold leading-snug text-black sm:text-[20px]">
              {col.title}
            </h2>
            <p
              className="mt-4 text-[14px] leading-relaxed sm:text-[15px]"
              style={{ color: QTC.textMuted }}
            >
              {col.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
