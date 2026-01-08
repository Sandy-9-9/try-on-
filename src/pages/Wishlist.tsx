import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    image_url: string;
    featured: boolean;
  };
}

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('wishlists')
      .select(`
        id,
        product:products(id, name, price, original_price, image_url, featured)
      `)
      .eq('user_id', user.id);

    if (data) {
      setItems(data as unknown as WishlistItem[]);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              My Wishlist
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
              <Button onClick={() => navigate('/shop')}>
                Explore Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.product.id}
                  name={item.product.name}
                  price={item.product.price}
                  originalPrice={item.product.original_price}
                  imageUrl={item.product.image_url}
                  featured={item.product.featured}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Wishlist;
