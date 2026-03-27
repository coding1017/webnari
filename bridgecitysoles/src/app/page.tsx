import { HeroSection } from '@/components/home/HeroSection';
import { BrandsSection } from '@/components/home/BrandsSection';
import { NewDropsSection } from '@/components/home/NewDropsSection';
import { CategoryCards } from '@/components/home/CategoryCards';
import { StoreInfoSection } from '@/components/home/StoreInfoSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandsSection />
      <NewDropsSection />
      <CategoryCards />
      <StoreInfoSection />
    </>
  );
}
