export interface OpenHtmlDocumentOptions {
  width?: number;
  height?: number;
  /** Llama a print() cuando el documento termina de cargar. */
  autoPrint?: boolean;
}

export function createHtmlBlobUrl(html: string): string {
  return URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
}

export function openHtmlInNewWindow(
  html: string,
  options: OpenHtmlDocumentOptions = {},
): boolean {
  const url = createHtmlBlobUrl(html);
  const width = options.width ?? 720;
  const height = options.height ?? 900;
  const popup = window.open(
    url,
    '_blank',
    `noopener,noreferrer,width=${width},height=${height}`,
  );

  if (!popup) {
    URL.revokeObjectURL(url);
    return false;
  }

  if (options.autoPrint) {
    popup.addEventListener('load', () => {
      popup.focus();
      popup.print();
    });
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  return true;
}
