import { HomeEquipmentCategoryExplorer } from '@/components/home/home-equipment-category-explorer';



export function HomeEquipmentQuickNavSection() {
  return (
    <section className="home-landing-sans bg-white">
      <div className="container pb-4 pt-4 sm:pb-5 sm:pt-5">
        <HomeEquipmentCategoryExplorer />
      </div>
    </section>
  );
}

