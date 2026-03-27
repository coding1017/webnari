export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          price: number; // cents
          badge: string | null;
          in_stock: boolean;
          description: string;
          is_collection: boolean;
          sort_order: number;
          rating: number;
          review_count: number;
          stripe_price_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_images"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
      };
      variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          color: string;
          price: number; // cents
          in_stock: boolean;
          sort_order: number;
        };
        Insert: Database["public"]["Tables"]["variants"]["Row"];
        Update: Partial<Database["public"]["Tables"]["variants"]["Insert"]>;
      };
      variant_images: {
        Row: {
          id: string;
          variant_id: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["variant_images"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["variant_images"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          text: string;
          rating: number;
          date: string;
          approved: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          stripe_session_id: string;
          stripe_payment_intent: string | null;
          status: string;
          customer_email: string;
          customer_name: string;
          shipping_address: Record<string, unknown>;
          subtotal: number;
          shipping: number;
          total: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          product_name: string;
          variant_name: string | null;
          price: number;
          quantity: number;
          image_url: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: { email: string };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Row"]>;
      };
      wishlist_items: {
        Row: {
          id: string;
          session_id: string;
          product_id: string;
          variant_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wishlist_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Insert"]>;
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          category: string;
          tags: string[];
          read_time: string;
          image_url: string;
          published: boolean;
          date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };
      glossary_terms: {
        Row: {
          id: string;
          term: string;
          slug: string;
          definition: string;
          category: string;
        };
        Insert: Omit<Database["public"]["Tables"]["glossary_terms"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["glossary_terms"]["Insert"]>;
      };
    };
  };
};
