import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedProducts />
    </Layout>
  );
};

export default Index;
