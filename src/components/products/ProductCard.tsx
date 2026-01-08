import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  featured?: boolean;
}

export function ProductCard({ id, name, price, originalPrice, imageUrl, featured }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
            -{discount}%
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded">
            Featured
          </div>
        )}

        {/* Hover Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center gap-3"
        >
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-elegant"
            onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-primary text-primary")} />
          </Button>
          <Link to={`/product/${id}`}>
            <Button size="icon" variant="secondary" className="rounded-full shadow-elegant">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/try-on?product=${id}`}>
            <Button size="icon" className="rounded-full shadow-elegant">
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-foreground">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
