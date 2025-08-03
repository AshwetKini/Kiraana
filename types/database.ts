export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string;
          phone: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address: string;
          phone: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          address?: string;
          phone?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          category: string;
          unit: string;
          selling_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          category: string;
          unit: string;
          selling_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          category?: string;
          unit?: string;
          selling_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          quantity: number;
          cost_price: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          product_id: string;
          quantity: number;
          cost_price: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          product_id?: string;
          quantity?: number;
          cost_price?: number;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string;
          total_amount: number;
          payment_status: 'paid' | 'pending' | 'partial';
          paid_amount: number;
          sale_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id: string;
          total_amount: number;
          payment_status?: 'paid' | 'pending' | 'partial';
          paid_amount?: number;
          sale_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string;
          total_amount?: number;
          payment_status?: 'paid' | 'pending' | 'partial';
          paid_amount?: number;
          sale_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          store_id: string;
          supplier_id: string;
          total_amount: number;
          payment_status: 'paid' | 'pending' | 'partial';
          paid_amount: number;
          purchase_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          supplier_id: string;
          total_amount: number;
          payment_status?: 'paid' | 'pending' | 'partial';
          paid_amount?: number;
          purchase_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          supplier_id?: string;
          total_amount?: number;
          payment_status?: 'paid' | 'pending' | 'partial';
          paid_amount?: number;
          purchase_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          days: number;
          is_active: boolean;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          days: number;
          is_active?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          days?: number;
          is_active?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          trial_start: string;
          trial_end: string;
          subscription_end: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trial_start: string;
          trial_end: string;
          subscription_end?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trial_start?: string;
          trial_end?: string;
          subscription_end?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}