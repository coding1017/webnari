import { HeroSection } from '@/components/home/HeroSection';
import { BrandsSection } from '@/components/home/BrandsSection';
import { NewDropsSection } from '@/components/home/NewDropsSection';
import { CategoryCards } from '@/components/home/CategoryCards';
import { StoreInfoSection } from '@/components/home/StoreInfoSection';
import { InstagramSection } from '@/components/home/InstagramSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandsSection />
      <NewDropsSection />
      <CategoryCards />
      <InstagramSection />
      <StoreInfoSection />
    </>
  );
}
