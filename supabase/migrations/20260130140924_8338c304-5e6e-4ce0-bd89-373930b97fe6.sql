-- Prevent direct order_items insertion - orders should only be created through secure function
CREATE POLICY "Prevent direct order item insertion"
ON public.order_items FOR INSERT
WITH CHECK (false);

-- Create a secure function for order creation that validates prices from the database
CREATE OR REPLACE FUNCTION public.create_order_from_cart(p_shipping_address text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id uuid;
  calculated_total decimal;
  cart_count integer;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if cart has items
  SELECT COUNT(*) INTO cart_count
  FROM cart_items c
  WHERE c.user_id = auth.uid();
  
  IF cart_count = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Calculate total from cart with current product prices (server-side validation)
  SELECT COALESCE(SUM(c.quantity * p.price), 0)
  INTO calculated_total
  FROM cart_items c
  JOIN products p ON p.id = c.product_id
  WHERE c.user_id = auth.uid();
  
  -- Create order with validated total
  INSERT INTO orders (user_id, total, shipping_address)
  VALUES (auth.uid(), calculated_total, p_shipping_address)
  RETURNING id INTO new_order_id;
  
  -- Copy cart items to order items with validated prices from products table
  INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, size, color)
  SELECT new_order_id, p.id, p.name, p.image_url, c.quantity, p.price, c.size, c.color
  FROM cart_items c
  JOIN products p ON p.id = c.product_id
  WHERE c.user_id = auth.uid();
  
  -- Clear cart after successful order creation
  DELETE FROM cart_items WHERE user_id = auth.uid();
  
  RETURN new_order_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_from_cart(text) TO authenticated;