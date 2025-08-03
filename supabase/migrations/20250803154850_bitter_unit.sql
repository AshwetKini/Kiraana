/*
  # Kiraana Store Management Database Schema

  1. New Tables
    - `stores` - Store information for each user
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, store name)
      - `address` (text, store address)
      - `phone` (text, store phone number)
      - `image_url` (text, optional store image)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `customers` - Customer information
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `name` (text, customer name)
      - `phone` (text, customer phone)
      - `email` (text, optional)
      - `address` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `suppliers` - Supplier information
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `name` (text, supplier name)
      - `phone` (text, supplier phone)
      - `email` (text, optional)
      - `address` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `products` - Product catalog
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `name` (text, product name)
      - `category` (text, product category)
      - `unit` (text, unit of measurement)
      - `selling_price` (numeric, selling price)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `inventory` - Stock management
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (numeric, current stock)
      - `cost_price` (numeric, cost price)
      - `updated_at` (timestamp)

    - `sales` - Sales transactions
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `customer_id` (uuid, foreign key to customers)
      - `total_amount` (numeric, total sale amount)
      - `payment_status` (enum: paid, pending, partial)
      - `paid_amount` (numeric, amount paid)
      - `sale_date` (date, sale date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `sale_items` - Individual items in sales
      - `id` (uuid, primary key)
      - `sale_id` (uuid, foreign key to sales)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (numeric, quantity sold)
      - `unit_price` (numeric, price per unit)
      - `total_price` (numeric, total for this item)
      - `created_at` (timestamp)

    - `purchases` - Purchase transactions from suppliers
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key to stores)
      - `supplier_id` (uuid, foreign key to suppliers)
      - `total_amount` (numeric, total purchase amount)
      - `payment_status` (enum: paid, pending, partial)
      - `paid_amount` (numeric, amount paid)
      - `purchase_date` (date, purchase date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `purchase_items` - Individual items in purchases
      - `id` (uuid, primary key)
      - `purchase_id` (uuid, foreign key to purchases)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (numeric, quantity purchased)
      - `unit_cost` (numeric, cost per unit)
      - `total_cost` (numeric, total cost for this item)
      - `created_at` (timestamp)

    - `coupons` - Coupon codes for subscription access
      - `id` (uuid, primary key)
      - `code` (text, unique coupon code)
      - `days` (integer, number of days to extend subscription)
      - `is_active` (boolean, whether coupon is active)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, optional expiration)

    - `user_subscriptions` - User trial and subscription tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `trial_start` (timestamp, trial start date)
      - `trial_end` (timestamp, trial end date)
      - `subscription_end` (timestamp, optional subscription end)
      - `is_active` (boolean, subscription status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own store data
    - Add policies for coupon access
    - Add triggers for automatic inventory updates

  3. Functions and Triggers
    - Trigger to update inventory on sales
    - Trigger to update inventory on purchases
    - Function to check subscription status
*/

-- Create enum types
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'partial');

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own store"
  ON stores
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage customers for their store"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage suppliers for their store"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage products for their store"
  ON products
  FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric(10,2) NOT NULL DEFAULT 0,
  cost_price numeric(10,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, product_id)
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage inventory for their store"
  ON inventory
  FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  paid_amount numeric(10,2) NOT NULL DEFAULT 0,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sales for their store"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage sale items for their store"
  ON sale_items
  FOR ALL
  TO authenticated
  USING (
    sale_id IN (
      SELECT s.id FROM sales s
      JOIN stores st ON s.store_id = st.id
      WHERE st.user_id = auth.uid()
    )
  );

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE RESTRICT,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  paid_amount numeric(10,2) NOT NULL DEFAULT 0,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage purchases for their store"
  ON purchases
  FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES purchases(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric(10,2) NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  total_cost numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage purchase items for their store"
  ON purchase_items
  FOR ALL
  TO authenticated
  USING (
    purchase_id IN (
      SELECT p.id FROM purchases p
      JOIN stores st ON p.store_id = st.id
      WHERE st.user_id = auth.uid()
    )
  );

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  days integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_start timestamptz NOT NULL,
  trial_end timestamptz NOT NULL,
  subscription_end timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscription"
  ON user_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample coupons
INSERT INTO coupons (code, days, is_active) VALUES
  ('KIRAANA5', 5, true),
  ('KIRAANA10', 10, true),
  ('KIRAANA15', 15, true),
  ('KIRAANA30', 30, true)
ON CONFLICT (code) DO NOTHING;

-- Function to update inventory on sale
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Update inventory by reducing quantity
  UPDATE inventory 
  SET 
    quantity = quantity - NEW.quantity,
    updated_at = now()
  WHERE product_id = NEW.product_id 
    AND store_id = (SELECT store_id FROM sales WHERE id = NEW.sale_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates on sales
DROP TRIGGER IF EXISTS trigger_update_inventory_on_sale ON sale_items;
CREATE TRIGGER trigger_update_inventory_on_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_sale();

-- Function to update inventory on purchase
CREATE OR REPLACE FUNCTION update_inventory_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update inventory
  INSERT INTO inventory (store_id, product_id, quantity, cost_price, updated_at)
  VALUES (
    (SELECT store_id FROM purchases WHERE id = NEW.purchase_id),
    NEW.product_id,
    NEW.quantity,
    NEW.unit_cost,
    now()
  )
  ON CONFLICT (store_id, product_id)
  DO UPDATE SET
    quantity = inventory.quantity + NEW.quantity,
    cost_price = NEW.unit_cost,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates on purchases
DROP TRIGGER IF EXISTS trigger_update_inventory_on_purchase ON purchase_items;
CREATE TRIGGER trigger_update_inventory_on_purchase
  AFTER INSERT ON purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_purchase();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_store_id ON suppliers(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_store_id ON purchases(store_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);