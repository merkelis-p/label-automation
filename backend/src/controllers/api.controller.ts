import { Request, Response } from 'express';
import { store } from '../store.js';
import { getOrder, getOrderByGid, listRecentOrders } from '../services/shopify.service.js';
import { broadcastUpdate } from '../websocket.js';

export async function getOrders(_req: Request, res: Response): Promise<void> {
  const orders = store.getAllOrders();
  res.json(orders);
}

export async function getOrderDetails(req: Request, res: Response) {
  try {
    const shopifyOrderId = decodeURIComponent(req.params.shopifyOrderId);
    console.log('Fetching order details for:', shopifyOrderId);
    
    // Extract numeric ID from GID format
    const orderIdMatch = shopifyOrderId.match(/\/Order\/(\d+)/);
    if (!orderIdMatch) {
      console.error('Invalid order ID format:', shopifyOrderId);
      return res.status(400).json({ 
        error: 'Invalid order ID format',
        received: shopifyOrderId,
        expected: 'gid://shopify/Order/{numeric_id}'
      });
    }
    
    const orderId = parseInt(orderIdMatch[1], 10);
    console.log('Extracted order ID:', orderId);
    
    const order = await getOrder(orderId);
    
    res.json(order);
  } catch (error: any) {
    console.error('Failed to fetch order details:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    res.status(500).json({ 
      error: 'Failed to fetch order details',
      message: error.message,
      details: error.response?.data
    });
  }
}

export async function getPrintJobs(
  _req: Request,
  res: Response
): Promise<void> {
  const jobs = store.getAllPrintJobs();
  res.json(jobs);
}

export async function getPrinterStatus(
  _req: Request,
  res: Response
): Promise<void> {
  const status = store.getPrinterStatus();
  res.json(status);
}

/**
 * Proxy PDF downloads to avoid CORS issues with external URLs
 * GET /api/proxy-pdf?url=https://...
 */
export async function proxyPdf(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Missing or invalid URL parameter' });
      return;
    }

    // Validate URL is from MakeCommerce or local
    const allowedDomains = [
      'static.test.maksekeskus.ee',
      'static.maksekeskus.ee',
      'localhost:3000',
    ];
    
    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (!isAllowed) {
      res.status(403).json({ error: 'URL domain not allowed' });
      return;
    }

    // Fetch the PDF
    const axios = (await import('axios')).default;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="label.pdf"');
    res.send(Buffer.from(response.data));
  } catch (error: any) {
    console.error('Failed to proxy PDF:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch PDF',
      message: error.message 
    });
  }
}

/**
 * Clear all orders and print jobs
 * POST /api/clear
 */
export async function clearAllData(req: Request, res: Response): Promise<void> {
  try {
    store.clear();
    
    // Get the reset printer status
    const printerStatus = store.getPrinterStatus();
    
    // Notify all clients to refresh
    broadcastUpdate('data_cleared', { message: 'All data cleared' });
    
    // Broadcast printer status reset (to offline)
    broadcastUpdate('printer_status', printerStatus);
    
    console.log('🗑️  All orders, print jobs, and printer status cleared');
    
    res.json({
      success: true,
      message: 'All orders, print jobs, and printer status cleared successfully'
    });
  } catch (error: any) {
    console.error('Failed to clear data:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to clear data',
      message: error.message
    });
  }
}

/**
 * Fetch real fulfilled orders from Shopify (not test data)
 * GET /api/fetch-real-orders?limit=10
 */
export async function fetchRealOrders(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log(`📦 Fetching ${limit} real fulfilled orders from Shopify...`);
    
    // This would need to be implemented in shopify.service.ts
    // For now, return recent orders
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
        financial_status: order.financial_status,
        fulfillment_status: order.fulfillment_status,
        customer: order.customer ? {
          first_name: order.customer.first_name,
          last_name: order.customer.last_name,
          email: order.customer.email,
        } : null,
        line_items_count: order.line_items?.length || 0,
      }))
    });
  } catch (error: any) {
    console.error('Failed to fetch real orders:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real orders',
      message: error.message
    });
  }
}
