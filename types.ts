export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  stock: number;
  expiry_date: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};
