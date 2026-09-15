import type {
  ProductDescriptionContent,
  ProductDescriptionStoryBlock,
  ProductFeatureCard,
  ProductGalleryItem,
} from '@/types/product-detail';

function galleryImages(gallery: ProductGalleryItem[]): { src: string; alt?: string }[] {
  return gallery.flatMap((item) => (item.type === 'image' ? [{ src: item.src, alt: item.alt }] : []));
}

function galleryYoutube(gallery: ProductGalleryItem[]): { id: string; title?: string } | null {
  const item = gallery.find((entry) => entry.type === 'video');
  return item?.type === 'video' ? { id: item.youtubeId, title: item.title } : null;
}

function galleryVideoFile(gallery: ProductGalleryItem[]): string | null {
  const item = gallery.find((entry) => entry.type === 'video-file');
  return item?.type === 'video-file' ? item.src : null;
}

export function buildStoryBlocksFromGallery(
  images: { src: string; alt?: string }[],
  cards: ProductFeatureCard[],
  productName: string,
): ProductDescriptionStoryBlock[] {
  if (images.length === 0 || cards.length === 0) return [];

  const count = Math.min(cards.length, Math.max(images.length, 2));
  return cards.slice(0, count).map((card, index) => {
    const image = images[index % images.length];
    return {
      id: `gallery-story-${index}`,
      title: card.title,
      body: card.description,
      imagePosition: index % 2 === 0 ? 'end' : 'start',
      imageSrc: image.src,
      imageAlt: image.alt ?? productName,
    };
  });
}

/** Completa video e imágenes de descripción con la galería del producto. */
export function enrichDescriptionContent(
  content: ProductDescriptionContent | null,
  gallery: ProductGalleryItem[],
  productName: string,
): ProductDescriptionContent | null {
  if (!content) return null;

  const next: ProductDescriptionContent = { ...content };
  const youtube = galleryYoutube(gallery);
  const videoFile = galleryVideoFile(gallery);

  if (!next.youtubeVideoId && youtube) {
    next.youtubeVideoId = youtube.id;
    if (youtube.title) next.youtubeTitle = youtube.title;
  }

  if (!next.videoSrc && !next.youtubeVideoId && videoFile) {
    next.videoSrc = videoFile;
  }

  if (!next.storyBlocks?.length && next.featureCards && next.featureCards.length > 0) {
    const blocks = buildStoryBlocksFromGallery(galleryImages(gallery), next.featureCards, productName);
    if (blocks.length > 0) next.storyBlocks = blocks;
  }

  return next;
}
