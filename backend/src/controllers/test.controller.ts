import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store.js';
import { broadcastUpdate } from '../websocket.js';

export async function seedTestData(req: Request, res: Response) {
  try {
    // Create sample fulfilled orders
    const testOrders = [
      {
        id: uuidv4(),
        shopifyOrderId: 'gid://shopify/Order/5847839899966',
        carrier: 'DPD_LT' as const,
        trackingNumber: '05808011288369',
        lockerId: 'DPD_PICKUP_123',
        status: 'printed' as const,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: uuidv4(),
        shopifyOrderId: 'gid://shopify/Order/5847839912345',
        carrier: 'OMNIVA' as const,
        trackingNumber: 'CC868835393EE',
        lockerId: '94401',
        labelUrl: 'https://static.maksekeskus.ee/lbl/20251020d4el0Z0KpvuiI30BouELhLy4741armPk.pdf',
        status: 'label_created' as const,
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      },
      {
        id: uuidv4(),
        shopifyOrderId: 'gid://shopify/Order/5847839967890',
        carrier: 'DPD_LT' as const,
        trackingNumber: '05808011299999',
        lockerId: 'DPD_PICKUP_456',
        status: 'pending' as const,
        createdAt: new Date(Date.now() - 600000).toISOString(), // 10 min ago
      },
    ];

    // Create sample print jobs
    const testPrintJobs = [
      {
        id: uuidv4(),
        orderId: testOrders[0].id,
        printerId: 'zebra-zd421',
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 3500000).toISOString(),
        completedAt: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: uuidv4(),
        orderId: testOrders[1].id,
        printerId: 'zebra-zd421',
        status: 'printing' as const,
        createdAt: new Date(Date.now() - 300000).toISOString(),
      },
    ];

    // Clear existing data
    store.clear();

    // Add test orders
    testOrders.forEach((order) => {
      store.addOrder(order);
      // Broadcast each order with a small delay
      setTimeout(() => {
        broadcastUpdate('order_update', order);
      }, 100);
    });

    // Add test print jobs
    testPrintJobs.forEach((job, index) => {
      store.addPrintJob(job);
      // Broadcast each print job with a small delay
      setTimeout(() => {
        broadcastUpdate('print_update', job);
      }, 200 + index * 100);
    });

    // Update printer status
    const printerStatus = {
      printerId: 'zebra-zd421',
      name: 'Zebra ZD421 Label Printer',
      status: 'online' as const,
      lastCheck: new Date().toISOString(),
    };
    store.updatePrinterStatus(printerStatus);
    broadcastUpdate('printer_status', printerStatus);

    res.json({
      success: true,
      message: 'Test data seeded successfully',
      data: {
        orders: testOrders.length,
        printJobs: testPrintJobs.length,
      },
    });
  } catch (error) {
    console.error('Failed to seed test data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed test data',
    });
  }
}
