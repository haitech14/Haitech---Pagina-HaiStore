/** Utilidades compartidas para imágenes, vídeos y YouTube en galería de producto. */

export function isYoutubeMediaUrl(url) {
  return typeof url === 'string' && url.startsWith('youtube:');
}

export function isVideoMediaUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return false;
  if (url.startsWith('data:video/')) return true;
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function isImageMediaUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return false;
  if (isYoutubeMediaUrl(url) || isVideoMediaUrl(url)) return false;
  if (url.startsWith('data:') && !url.startsWith('data:image/')) return false;
  return true;
}

export function parseYoutubeVideoId(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('youtube:')) {
    const id = trimmed.slice(8).trim();
    return id.length >= 6 ? id : null;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return id && id.length >= 6 ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && fromQuery.length >= 6) return fromQuery;

      const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) return embedMatch[1];

      const shortsMatch = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];
    }
  } catch {
  }

  return null;
}

export function normalizeYoutubeMediaUrl(input) {
  const id = parseYoutubeVideoId(input);
  return id ? `youtube:${id}` : null;
}

export function youtubeThumbnailUrl(videoId, quality = 'hqdefault') {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

export function youtubeEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
