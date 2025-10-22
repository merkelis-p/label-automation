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
  type: 'order_update' | 'print_update' | 'printer_status';
  data: FulfilledOrder | PrintJob | PrinterStatus;
}
