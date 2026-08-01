export interface Tournament {
  id: string;
  name: string;
  poster_url?: string;
  event_date: string;
  venue: string;
  categories: string[];
  entry_fee: number;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface Registration {
  id: string;
  tournament_id: string;
  player_name: string;
  email?: string;
  age: number;
  school?: string;
  category: string;
  phone_number: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  checkout_request_id?: string;
  mpesa_receipt?: string;
  created_at?: string;
  tournaments?: {
    name: string;
  };
}

export interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  description: string;
  in_stock: boolean;
  created_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image_url?: string;
  excerpt: string;
  body: string;
  published: boolean;
  published_at?: string;
  source_url?: string;
  created_at?: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  category: string;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  sort_order?: number;
  created_at?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  created_at?: string;
}

export interface SiteSettings {
  id: number;
  org_email: string;
  org_phone: string;
  mpesa_paybill: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  shop_enabled: boolean;
  our_story_title?: string;
  our_story_heading?: string;
  our_story_paragraph_1?: string;
  our_story_paragraph_2?: string;
  updated_at?: string;
}

export interface ShopOrder {
  id: string;
  customer_name: string;
  phone_number: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  checkout_request_id?: string;
  mpesa_receipt?: string;
  created_at?: string;
}
