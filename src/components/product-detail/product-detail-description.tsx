import type { ReactNode } from 'react';

import type { ProductDescriptionContent } from '@/types/product-detail';

interface ProductDetailDescriptionProps {
  content: ProductDescriptionContent;
  /** Evita repetir el resumen ya mostrado en ProductDetailDescriptionPanel. */
  omitPanelSummary?: boolean;
  /** Contenido insertado tras los párrafos y el video (p. ej. barra de iconos). */
  afterBody?: ReactNode;
}

export function ProductDetailDescription({
  content,
  omitPanelSummary = false,
  afterBody,
}: ProductDetailDescriptionProps) {
  const overviewParagraphs =
    content.overviewParagraphs && content.overviewParagraphs.length > 0
      ? content.overviewParagraphs
      : content.paragraphs.slice(0, 2);
  const paragraphs = omitPanelSummary
    ? content.paragraphs.filter((paragraph) => !overviewParagraphs.includes(paragraph))
    : content.paragraphs;
  const hasYoutube = Boolean(content.youtubeVideoId);
  const hasBody = paragraphs.length > 0 || hasYoutube;

  if (!hasBody) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-sm leading-relaxed text-neutral-600 sm:text-[0.9375rem]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {content.youtubeVideoId && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${content.youtubeVideoId}`}
              title={content.youtubeTitle ?? 'Video del producto'}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          {content.youtubeTitle && (
            <p className="border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
              {content.youtubeTitle}
            </p>
          )}
        </div>
      )}

      {afterBody}
    </div>
  );
}
