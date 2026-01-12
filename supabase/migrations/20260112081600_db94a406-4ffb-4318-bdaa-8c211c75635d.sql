-- Add Men's and Women's categories
INSERT INTO public.categories (id, name, description, image_url) VALUES 
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Men''s Wear', 'Stylish clothing for men', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Women''s Wear', 'Elegant clothing for women', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400')
ON CONFLICT (id) DO NOTHING;