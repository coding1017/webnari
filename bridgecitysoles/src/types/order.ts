export interface OrderItem {
  id: string;
  productName: string;
  size: string;
  condition: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  channel: 'online' | 'in-store';
  createdAt: string;
  updatedAt: string;
}
