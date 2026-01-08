import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { TryOnCTA } from '@/components/home/TryOnCTA';
import { Categories } from '@/components/home/Categories';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedProducts />
      <TryOnCTA />
      <Categories />
    </Layout>
  );
};

export default Index;
