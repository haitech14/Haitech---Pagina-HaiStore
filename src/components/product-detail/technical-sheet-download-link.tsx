import { cn } from '@/lib/utils';

function PdfDownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-12 text-red-600 sm:size-14', className)}
      aria-hidden="true"
    >
      <path
        d="M10 4h20l8 8v40a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M30 4v8h8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="13" y="22" width="16" height="9" rx="1.5" fill="currentColor" />
      <text
        x="21"
        y="28.5"
        fill="white"
        fontSize="5.25"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        textAnchor="middle"
      >
        PDF
      </text>
      <path
        d="M24 38v8M20 42l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TechnicalSheetDownloadLinkProps {
  href: string;
  className?: string;
}

export function TechnicalSheetDownloadLink({ href, className }: TechnicalSheetDownloadLinkProps) {
  return (
    <div className={cn('mt-4 min-w-0', className)}>
      <p className="text-sm font-bold text-[#0f1f3d] sm:text-base">Descargar ficha técnica:</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        download
        aria-label="Descargar ficha técnica en PDF"
        className="mt-2 inline-flex rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        <PdfDownloadIcon />
      </a>
    </div>
  );
}
