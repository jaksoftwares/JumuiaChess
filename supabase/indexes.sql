-- ============================================================
-- Performance Indexes for JumuiaChess
-- Run this in Supabase SQL Editor (Settings → SQL Editor)
-- Safe to run multiple times — all use IF NOT EXISTS
-- ============================================================

-- blog_posts: most common query is published=true ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
  ON blog_posts (published, published_at DESC)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at
  ON blog_posts (created_at DESC);

-- tournaments: most common query is ORDER BY event_date ASC
CREATE INDEX IF NOT EXISTS idx_tournaments_event_date
  ON tournaments (event_date ASC);

CREATE INDEX IF NOT EXISTS idx_tournaments_status
  ON tournaments (status);

-- registrations: admin filters by tournament_id and payment_status
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id
  ON registrations (tournament_id);

CREATE INDEX IF NOT EXISTS idx_registrations_payment_status
  ON registrations (payment_status);

CREATE INDEX IF NOT EXISTS idx_registrations_created_at
  ON registrations (created_at DESC);

-- shop_orders: admin views sorted by created_at, filters by payment_status
CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at
  ON shop_orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_orders_payment_status
  ON shop_orders (payment_status);

-- M-Pesa callback lookups use checkout_request_id
CREATE INDEX IF NOT EXISTS idx_registrations_checkout_request_id
  ON registrations (checkout_request_id)
  WHERE checkout_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_shop_orders_checkout_request_id
  ON shop_orders (checkout_request_id)
  WHERE checkout_request_id IS NOT NULL;

-- gallery_images: filter by category
CREATE INDEX IF NOT EXISTS idx_gallery_images_category
  ON gallery_images (category);

CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at
  ON gallery_images (created_at DESC);

-- team_members: ORDER BY sort_order, created_at
CREATE INDEX IF NOT EXISTS idx_team_members_sort_order
  ON team_members (sort_order ASC, created_at ASC);

-- products: filter by in_stock
CREATE INDEX IF NOT EXISTS idx_products_in_stock
  ON products (in_stock)
  WHERE in_stock = true;
