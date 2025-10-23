export type Carrier = 'DPD_LT' | 'OMNIVA';

export interface FulfilledOrder {
  id: string;
  shopifyOrderId: string;
  carrier: Carrier;
  trackingNumber: string;
  lockerId?: string;
  labelUrl?: string;
  labelPath?: string;
  status: 'pending' | 'label_created' | 'printed' | 'error';
  createdAt: string;
  error?: string;
}

export interface PrinterStatus {
  printerId: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastCheck: string;
}

export interface PrintJob {
  id: string;
  orderId: string;
  printerId: string;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  labelPath?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ShopifyFulfillment {
  id: number;
  order_id: number;
  status: string;
  tracking_company?: string;
  tracking_number?: string;
  tracking_numbers?: string[];
}

export interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  sku?: string;
  variant_title?: string;
  product_id: number;
  variant_id: number;
  name: string;
  fulfillment_status?: string | null;
  image?: {
    src: string;
    alt?: string;
  };
}

export interface ShopifyOrder {
  id: number;
  name: string;
  order_number: number;
  email?: string;
  phone?: string;
  total_price?: string;
  subtotal_price?: string;
  total_tax?: string;
  currency?: string;
  financial_status?: string;
  fulfillment_status?: string | null;
  created_at?: string;
  note?: string;
  note_attributes?: Array<{ name: string; value: string }>;
  line_items?: ShopifyLineItem[];
  customer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    country_code_v2?: string;
    phone?: string;
  };
  shipping_lines?: Array<{
    title?: string;
    price?: string;
  }>;
}

export interface MakeCommerceCredentials {
  carrier: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

export interface MakeCommerceLabelPayload {
  credentials: MakeCommerceCredentials[];
  orders: Array<{
    orderId: string;
    carrier: string;
    shipmentId: string;
    type?: 'APT' | 'COURIER';
    parcelDestinationId?: string;
    destination?: {
      postalCode: string;
      country: string;
      county?: string;
      city: string;
      street: string;
    };
    recipient: {
      name: string;
      phone: string;
      email: string;
    };
    sender: {
      name: string;
      phone: string;
      email: string;
      postalCode: string;
    };
  }>;
  printFormat: string;
}

export interface MakeCommerceLabelResponse {
  labelUrl?: string;
  url?: string;
  urls?: string[];
}
