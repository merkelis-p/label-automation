import { store } from '../store.js';
import { getOrder, listRecentOrders } from '../services/shopify.service.js';
import { printLabel } from '../services/printnode.service.js';
import { broadcastUpdate } from '../websocket.js';
import { config } from '../config/index.js';
import axios from 'axios';
export async function getOrders(_req, res) {
    const orders = store.getAllOrders();
    res.json(orders);
}
export async function getOrderDetails(req, res) {
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
    }
    catch (error) {
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
export async function getPrintJobs(_req, res) {
    const jobs = store.getAllPrintJobs();
    res.json(jobs);
}
export async function getPrinterStatus(_req, res) {
    const status = store.getPrinterStatus();
    res.json(status);
}
/**
 * Proxy PDF downloads to avoid CORS issues with external URLs
 * GET /api/proxy-pdf?url=https://...
 */
export async function proxyPdf(req, res) {
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
    }
    catch (error) {
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
export async function clearAllData(req, res) {
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
    }
    catch (error) {
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
export async function fetchRealOrders(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
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
    }
    catch (error) {
        console.error('Failed to fetch real orders:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch real orders',
            message: error.message
        });
    }
}
/**
 * Print label from URL - downloads PDF and sends to PrintNode
 * POST /api/print-label
 * Body: { labelUrl: string, orderId: string, trackingNumber: string }
 */
export async function printLabelFromUrl(req, res) {
    try {
        const { labelUrl, orderId, trackingNumber } = req.body;
        if (!labelUrl || !orderId) {
            res.status(400).json({
                error: 'Missing required fields: labelUrl and orderId are required'
            });
            return;
        }
        console.log(`🖨️  Printing label for order ${orderId} from ${labelUrl}`);
        // Download the PDF
        const pdfResponse = await axios.get(labelUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
        });
        const pdfBuffer = Buffer.from(pdfResponse.data);
        // Send to PrintNode
        const printNodeJobId = await printLabel(pdfBuffer, `Label_${orderId}.pdf`);
        // Create print job record
        const printJob = {
            id: Date.now().toString(),
            printerId: config.printnode.printerId,
            orderId,
            status: 'queued',
            createdAt: new Date().toISOString(),
        };
        store.addPrintJob(printJob);
        // Broadcast update to all clients
        broadcastUpdate('print_job_created', printJob);
        console.log(`✅ Print job created: ${printNodeJobId} for order ${orderId}`);
        res.json({
            success: true,
            printJob,
            printNodeJobId,
            message: 'Label sent to printer successfully'
        });
    }
    catch (error) {
        console.error('Failed to print label:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to print label',
            message: error.message
        });
    }
}
//# sourceMappingURL=api.controller.js.map