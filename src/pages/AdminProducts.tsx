import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Upload, Trash2, Edit, X, Save, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string;
  category_id: string | null;
  featured: boolean | null;
  in_stock: boolean | null;
  sizes: string[] | null;
  colors: string[] | null;
}

interface Category {
  id: string;
  name: string;
}

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    category_id: '',
    featured: false,
    in_stock: true,
    sizes: 'S, M, L, XL',
    colors: 'Black, White',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Check admin role and redirect non-admins
  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        if (!authLoading) {
          navigate('/auth');
        }
        return;
      }
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data?.role !== 'admin') {
        navigate('/');
        return;
      }
      
      setIsAdmin(true);
    }
    
    checkAdminRole();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      image_url: '',
      category_id: '',
      featured: false,
      in_stock: true,
      sizes: 'S, M, L, XL',
      colors: 'Black, White',
    });
    setPreviewImage(null);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      image_url: product.image_url,
      category_id: product.category_id || '',
      featured: product.featured || false,
      in_stock: product.in_stock ?? true,
      sizes: product.sizes?.join(', ') || 'S, M, L, XL',
      colors: product.colors?.join(', ') || 'Black, White',
    });
    setPreviewImage(product.image_url);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setPreviewImage(publicUrl);
      toast.success('Image uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.image_url) {
      toast.error('Please fill in name, price, and upload an image');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: formData.image_url,
        category_id: formData.category_id || null,
        featured: formData.featured,
        in_stock: formData.in_stock,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
        toast.success('Product added!');
      }

      resetForm();
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  if (authLoading || !user || isAdmin === null) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </button>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Manage Products</h1>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-display text-xl font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); resetForm(); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Image *</Label>
                  <div
                    className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload image</p>
                      </div>
                    )}
                    {uploading && <p className="text-sm text-primary mt-2">Uploading...</p>}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Name & Description */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>

                {/* Pricing */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="1999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="original_price">Original Price (₹) - for sale</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                      placeholder="2999"
                    />
                  </div>
                </div>

                {/* Sizes & Colors */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sizes">Sizes (comma separated)</Label>
                    <Input
                      id="sizes"
                      value={formData.sizes}
                      onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value }))}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colors">Colors (comma separated)</Label>
                    <Input
                      id="colors"
                      value={formData.colors}
                      onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
                      placeholder="Black, White, Blue"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-8">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    />
                    <Label>Featured Product</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.in_stock}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                    />
                    <Label>In Stock</Label>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving || uploading} className="flex-1">
                    {saving ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-secondary/50 rounded-lg aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No products yet. Add your first product!</p>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-1">{product.name}</h3>
                  <p className="text-primary font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
                  {product.featured && (
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded mt-1 inline-block">Featured</span>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminProducts;
