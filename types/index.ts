export type UserRole = 'admin' | 'salesperson';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export type CustomerStatus = 'lead' | 'contacted' | 'demo_scheduled' | 'active' | 'inactive';

export interface Customer {
  id: number;
  shop_name: string;
  owner_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  assigned_salesperson_id?: number;
  assigned_salesperson_name?: string;
  status: CustomerStatus;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at?: string;
  active_subscription_plan?: string;
  total_paid?: number;
  total_subscription_amount?: number;
  outstanding_balance?: number;
}

export type DemoStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Demo {
  id: number;
  customer_id: number;
  customer_shop_name: string;
  customer_owner_name: string;
  customer_phone?: string;
  salesperson_id: number;
  salesperson_name: string;
  demo_date: string;
  demo_time: string;
  location: string;
  status: DemoStatus;
  notes?: string;
  outcome?: string;
  follow_up_date?: string;
  created_at: string;
}

export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired' | 'cancelled';

export interface Subscription {
  id: number;
  customer_id: number;
  customer_shop_name: string;
  customer_owner_name: string;
  customer_phone?: string;
  plan_name: string;
  duration_months: number;
  start_date: string;
  expiry_date: string;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  status: SubscriptionStatus;
  reminder_sent: boolean;
  notes?: string;
  created_at: string;
}

export type PaymentMethod = 'upi' | 'cash' | 'bank_transfer' | 'cheque' | 'other';
export type PaymentStatus = 'verified' | 'pending' | 'cancelled';

export interface Payment {
  id: number;
  customer_id: number;
  customer_shop_name: string;
  subscription_id?: number;
  plan_name?: string;
  recorded_by_user_id: number;
  recorded_by_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  status: PaymentStatus;
  created_at: string;
}

export interface DashboardStats {
  today_demos: number;
  total_customers: number;
  active_subscriptions: number;
  monthly_collections: number;
  outstanding_total: number;
  expiring_soon_subscriptions: number;
  recent_customers: Customer[];
  recent_demos: Demo[];
  recent_subscriptions: Subscription[];
  recent_payments: Payment[];
}
