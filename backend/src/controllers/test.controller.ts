import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store.js';
import { broadcastUpdate } from '../websocket.js';
import { listRecentOrders } from '../services/shopify.service.js';

export async function getRecentShopifyOrders(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const orders = await listRecentOrders(limit);
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        id: order.id,
        gid: `gid://shopify/Order/${order.id}`,
        name: order.name,
        created_at: order.created_at,
        total_price: order.total_price,
        customer: order.customer ? {
          first_name: order.customer.first_name,
          last_name: order.customer.last_name,
        } : null,
        line_items_count: order.line_items?.length || 0,
      }))
    });
  } catch (error: any) {
    console.error('Failed to fetch recent orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent orders',
      message: error.message
    });
  }
}

export async function seedTestData(req: Request, res: Response) {
  try {
    // Fetch recent orders from the connected Shopify store
    console.log('🔄 Fetching recent orders from Shopify for test data...');
    const recentOrders = await listRecentOrders(3);
    
    if (recentOrders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No orders found in your Shopify store',
        message: 'Cannot seed test data without existing orders. Please create at least one order in your Shopify store first.',
      });
    }

    console.log(`✅ Found ${recentOrders.length} recent orders from Shopify`);

    // Create sample fulfilled orders using REAL order IDs from the connected Shopify store
    const testOrders = recentOrders.map((shopifyOrder, index) => {
      const carriers = ['OMNIVA', 'DPD_LT'] as const;
      const statuses = ['label_created', 'printed', 'pending'] as const;
      const carrier = carriers[index % carriers.length];
      
      // Use local placeholder for all labels
      const labelUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/labels/placeholder.pdf`;
      
      return {
        id: uuidv4(),
        shopifyOrderId: `gid://shopify/Order/${shopifyOrder.id}`,
        carrier,
        trackingNumber: carrier === 'OMNIVA' 
          ? `CC86883${5390 + index}EE` 
          : `0580801129${9990 + index}`,
        lockerId: carrier === 'OMNIVA' 
          ? `${88860 + index}` 
          : `DPD_PICKUP_${450 + index}`,
        labelUrl,
        status: statuses[index % statuses.length],
        createdAt: new Date(Date.now() - (3600000 - index * 1800000)).toISOString(),
      };
    });

    // Create sample print jobs - ALL COMPLETED (no infinite "printing" toast)
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
        status: 'completed' as const,
        createdAt: new Date(Date.now() - 300000).toISOString(),
        completedAt: new Date(Date.now() - 200000).toISOString(),
      },
    ];

    // Clear existing data
    store.clear();
    
    // Notify all clients to refresh their data
    broadcastUpdate('data_cleared', { message: 'Test data cleared, reloading...' });

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
      message: 'Test data seeded successfully with orders from your Shopify store',
      data: {
        orders: testOrders.length,
        printJobs: testPrintJobs.length,
        shopifyOrders: recentOrders.map(o => ({
          id: o.id,
          name: o.name,
        })),
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
