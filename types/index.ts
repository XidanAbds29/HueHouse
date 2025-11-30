export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  images?: string[]; // Optional for backward compatibility
  description: string;
  stock_status: 'in_stock' | 'out_of_stock';
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  total_amount: number;
  status: 'pending' | 'processed' | 'deleted';
  items_json: any; // Storing cart items as JSON
  courier_status: 'pending' | 'booked' | 'failed';
  tracking_id?: string;
}
