export interface CartItem {
  inventoryId: string;
  productId: string;
  productSlug: string;
  productName: string;
  brandName: string;
  size: string;
  condition: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}
