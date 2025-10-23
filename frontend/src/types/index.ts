export interface FulfilledOrder {
  id: string;
  shopifyOrderId: string;
  carrier: 'DPD_LT' | 'OMNIVA';
  trackingNumber: string;
  lockerId?: string;
  labelUrl?: string;
  labelPath?: string;
  status: 'pending' | 'label_created' | 'printed' | 'error';
  createdAt: string;
  error?: string;
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

export interface ShopifyOrderDetails {
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
    phone?: string;
  };
  shipping_lines?: Array<{
    title?: string;
    price?: string;
  }>;
  note_attributes?: Array<{
    name: string;
    value: string;
  }>;
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

export interface PrinterStatus {
  printerId: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastCheck: string;
}

export interface WebSocketMessage {
  type: 'order_update' | 'print_update' | 'printer_status' | 'data_cleared';
  data: FulfilledOrder | PrintJob | PrinterStatus | { message: string };
}
