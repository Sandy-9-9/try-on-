import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  featured: boolean;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'featured', label: 'Featured' },
  { id: 'new-arrival', label: 'New Arrival' },
];

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').limit(8),
        supabase.from('categories').select('*'),
      ]);

      if (!productsRes.error && productsRes.data) {
        setProducts(productsRes.data);
      }
      if (!categoriesRes.error && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'featured') return product.featured;
    if (activeFilter === 'best-sellers') return product.featured;
    if (activeFilter === 'new-arrival') return true;
    
    // Filter by category name
    const category = categories.find((c) => c.id === product.category_id);
    if (activeFilter === 'men' && category?.name.toLowerCase().includes('men')) return true;
    if (activeFilter === 'women' && category?.name.toLowerCase().includes('women')) return true;
    
    return false;
  });

  const handleTryOn = (productId: string, imageUrl: string) => {
    navigate(`/try-on?product=${productId}&image=${encodeURIComponent(imageUrl)}`);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-white text-foreground border border-border hover:border-pink-500 hover:text-pink-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 group">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Sale Badge */}
                  {product.original_price && product.original_price > product.price && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded">
                      sale
                    </span>
                  )}
                  {/* Blue bottom line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500" />
                </div>

                {/* Product Info */}
                <div className="p-4 text-center">
                  {/* Star Rating */}
                  <div className="flex justify-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Product Name */}
                  <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <p className="text-lg font-semibold text-foreground mb-4">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                      onClick={() => {/* Add to cart logic */}}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-cyan-500 text-cyan-500 hover:bg-cyan-50"
                      onClick={() => handleTryOn(product.id, product.image_url)}
                    >
                      Try-On
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link to="/shop">
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 px-8">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
