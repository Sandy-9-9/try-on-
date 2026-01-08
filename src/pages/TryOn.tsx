import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Sparkles, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

const TryOn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('id, name, price, image_url').limit(6);
      if (data) setProducts(data);
    }

    async function fetchSelectedProduct() {
      const productId = searchParams.get('product');
      if (productId) {
        const { data } = await supabase.from('products').select('id, name, price, image_url').eq('id', productId).maybeSingle();
        if (data) setSelectedProduct(data);
      }
    }

    fetchProducts();
    fetchSelectedProduct();
  }, [searchParams]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!userImage || !selectedProduct) return;
    
    setIsProcessing(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
  };

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
            Virtual Try-On
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your photo and see how our collection looks on you with AI-powered visualization.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground">
              1. Upload Your Photo
            </h2>
            
            <div 
              className="relative aspect-[3/4] bg-secondary/50 rounded-2xl border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {userImage ? (
                <>
                  <img src={userImage} alt="Your photo" className="w-full h-full object-cover" />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-4 right-4 rounded-full"
                    onClick={(e) => { e.stopPropagation(); setUserImage(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-2">Upload your photo</p>
                  <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </motion.div>

          {/* Product Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground">
              2. Select a Product
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/50 rounded-xl p-4"
              >
                <p className="font-medium text-foreground">{selectedProduct.name}</p>
                <p className="text-primary font-display text-lg">${selectedProduct.price.toFixed(2)}</p>
              </motion.div>
            )}

            {/* Try On Button */}
            <Button
              size="lg"
              className="w-full shadow-elegant"
              disabled={!userImage || !selectedProduct || isProcessing}
              onClick={handleTryOn}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try On Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            {!user && (
              <p className="text-sm text-center text-muted-foreground">
                <button onClick={() => navigate('/auth')} className="text-primary hover:underline">
                  Sign in
                </button>{' '}
                to save your try-on sessions
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TryOn;
