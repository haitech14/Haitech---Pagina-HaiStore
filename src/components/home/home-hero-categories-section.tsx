import { HomeHeroCategoryCarousel } from '@/components/home/home-hero-category-carousel';

const SECTION_TITLE_ID = 'home-categories-title';

export function HomeHeroCategoriesSection() {
  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="home-landing-sans bg-[#F5F5F5]"
    >
      <div className="container pb-6 pt-4 sm:pb-8 sm:pt-6">
        <h2
          id={SECTION_TITLE_ID}
          className="home-section-title mb-5 text-balance text-center text-lg font-bold tracking-tight text-[#111111] sm:mb-6 sm:text-xl lg:mb-7 lg:text-2xl lg:leading-tight"
        >
          Explora nuestras Categorías
        </h2>

        <div className="-mx-2 sm:-mx-3 lg:-mx-4">
          <HomeHeroCategoryCarousel />
        </div>
      </div>
    </section>
  );
}