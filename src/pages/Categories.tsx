import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategories(data);
      setLoading(false);
    }

    fetchCategories();
  }, []);

  // Predefined category options
  const categoryOptions = [
    { label: 'All', value: 'all' },
    { label: 'Dresses', value: 'dresses' },
    { label: 'Tops', value: 'tops' },
    { label: 'Bottoms', value: 'bottoms' },
  ];

  // Merge predefined with database categories
  const allOptions = [
    { label: 'All', id: 'all' },
    ...categories.map(cat => ({ label: cat.name, id: cat.id }))
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Shop by Category
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections across different styles.
          </p>
        </motion.div>

        {/* Category Options */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 w-28 bg-secondary/50 rounded-full animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {allOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={option.id === 'all' ? '/shop' : `/shop?category=${option.id}`}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full border-2 border-primary/20 bg-card text-foreground font-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg"
                >
                  {option.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Browse All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Can't decide? Browse our entire collection
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            View All Products
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
