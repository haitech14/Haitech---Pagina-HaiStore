import { HomeEquipmentCategoryExplorer } from '@/components/home/home-equipment-category-explorer';



export function HomeEquipmentQuickNavSection() {
  return (
    <section
      aria-labelledby="home-equipment-quick-nav-title"
      className="home-landing-sans bg-white"
    >
      <div className="container pb-4 pt-4 sm:pb-5 sm:pt-5">
        <h2
          id="home-equipment-quick-nav-title"
          className="home-section-title mb-5 text-center text-xl font-bold tracking-tight text-[#111111] sm:text-2xl"
        >
          Explora nuestras categorías de equipos
        </h2>

        <HomeEquipmentCategoryExplorer />
      </div>
    </section>
  );
}

