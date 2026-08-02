export type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  sale_price: number;
  stock: number;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type CartItem = Product & { quantity: number };
