export function isYoutubeMediaUrl(url: string): boolean;
export function isVideoMediaUrl(url: string): boolean;
export function isImageMediaUrl(url: string): boolean;
export function parseYoutubeVideoId(input: string): string | null;
export function normalizeYoutubeMediaUrl(input: string): string | null;
export function youtubeThumbnailUrl(videoId: string, quality?: string): string;
export function youtubeEmbedUrl(videoId: string): string;
