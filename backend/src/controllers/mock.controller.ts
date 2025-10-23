import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store.js';
import { broadcastUpdate } from '../websocket.js';
import { listRecentOrders } from '../services/shopify.service.js';
import type { FulfilledOrder, PrintJob } from '../types/index.js';

// Mock Shopify webhook payload
function createMockFulfillment() {
  const orderId = Math.floor(Math.random() * 1000000);
  const carriers = ['DPD_LT', 'OMNIVA'] as const;
  const carrier = carriers[Math.floor(Math.random() * carriers.length)];
  
  const dpd_lockers = ['DPD_PICKUP_123', 'DPD_PICKUP_456', 'DPD_PICKUP_789'];
  const omniva_lockers = ['94401', '94402', '94403', '94404'];
  
  return {
    id: orderId,
    order_id: orderId,
    status: 'success',
    tracking_company: carrier === 'DPD_LT' ? 'DPD' : 'Omniva',
    tracking_number: carrier === 'DPD_LT' 
      ? `058080${Math.floor(10000000 + Math.random() * 90000000)}`
      : `CC${Math.floor(100000000 + Math.random() * 900000000)}EE`,
    line_items: [
      {
        id: Math.floor(Math.random() * 1000000),
        title: `Product ${Math.floor(Math.random() * 100)}`,
        quantity: Math.floor(1 + Math.random() * 3),
      }
    ],
    tracking_urls: [],
    note_attributes: [
      {
        name: carrier === 'DPD_LT' ? 'DPD parcel locker' : 'omniva_parcel_terminal',
        value: carrier === 'DPD_LT' 
          ? dpd_lockers[Math.floor(Math.random() * dpd_lockers.length)]
          : omniva_lockers[Math.floor(Math.random() * omniva_lockers.length)]
      }
    ]
  };
}

// Simulate the fulfillment webhook handler
export async function mockFulfillment(req: Request, res: Response) {
  try {
    const fulfillment = createMockFulfillment();
    console.log('📦 Mock fulfillment created:', fulfillment);

    // Detect carrier from tracking company
    const carrier = fulfillment.tracking_company === 'DPD' ? 'DPD_LT' : 'OMNIVA';
    
    // Extract locker ID
    const lockerAttr = fulfillment.note_attributes.find(
      attr => attr.name === 'DPD parcel locker' || attr.name === 'omniva_parcel_terminal'
    );
    const lockerId = lockerAttr?.value;

    // Create order
    const order: FulfilledOrder = {
      id: uuidv4(),
      shopifyOrderId: `gid://shopify/Order/${fulfillment.order_id}`,
      carrier,
      trackingNumber: fulfillment.tracking_number,
      lockerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    store.addOrder(order);
    broadcastUpdate('order_update', order);
    console.log('✅ Order added to store');

    // Simulate label creation (after 2 seconds)
    setTimeout(() => {
      // Use a local placeholder label so the UI can always open a valid PDF during tests
      const base = process.env.APP_BASE_URL || 'http://localhost:3000';
      const labelUrl = `${base}/labels/placeholder.pdf`;
      const updatedOrder = {
        ...order,
        labelUrl,
        labelPath: `/labels/${order.id}.pdf`,
        status: 'label_created' as const,
      };
      
      store.updateOrder(order.id, { 
        labelUrl, 
        labelPath: updatedOrder.labelPath,
        status: 'label_created' 
      });
      broadcastUpdate('order_update', updatedOrder);
      console.log('🏷️  Label created for order (placeholder):', order.id);

      // Simulate print job (after another 2 seconds)
      setTimeout(() => {
        const printerStatus = store.getPrinterStatus();
        
        // Create print job as "queued" if printer offline, "printing" if online
        const printJob = {
          id: uuidv4(),
          orderId: order.id,
          printerId: 'zebra-zd421',
          status: (printerStatus && printerStatus.status === 'online') ? 'printing' as const : 'queued' as const,
          labelPath: updatedOrder.labelPath,
          createdAt: new Date().toISOString(),
        };

        store.addPrintJob(printJob);
        broadcastUpdate('print_update', printJob);
        
        if (printJob.status === 'queued') {
          console.log('⏳ Print job queued (printer offline):', printJob.id);
          // Job stays queued until printer comes online
          return;
        }

        console.log('🖨️  Print job started:', printJob.id);

        // Complete print (after 3 seconds) - only if printing
        setTimeout(() => {
          const completedJob = {
            ...printJob,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
          };

          const jobs = store.getAllPrintJobs();
          const jobIndex = jobs.findIndex(j => j.id === printJob.id);
          if (jobIndex >= 0) {
            jobs[jobIndex] = completedJob;
          }

          store.updateOrder(order.id, { status: 'printed' });
          broadcastUpdate('print_update', completedJob);
          broadcastUpdate('order_update', { ...updatedOrder, status: 'printed' });
          console.log('✅ Print completed:', printJob.id);
        }, 3000);
      }, 2000);
    }, 2000);

    res.json({
      success: true,
      message: 'Mock fulfillment processed',
      order,
    });
  } catch (error: any) {
    console.error('Mock fulfillment error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Seed initial test data
export async function seedTestData(req: Request, res: Response) {
  try {
    // Clear existing data
    store.clear();
    console.log('🗑️  Store cleared');
    
    // Notify all clients to refresh their data
    broadcastUpdate('data_cleared', { message: 'Test data cleared, reloading...' });

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
      const status = statuses[index % statuses.length];
      
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
        labelUrl: status !== 'pending'
          ? `${process.env.APP_BASE_URL || 'http://localhost:3000'}/labels/placeholder.pdf`
          : undefined,
        labelPath: status !== 'pending'
          ? `/labels/${carrier.toLowerCase()}-${index}.pdf`
          : undefined,
        status,
        createdAt: new Date(Date.now() - (3600000 - index * 1800000)).toISOString(),
      };
    });

    // Create sample print jobs - ALL COMPLETED to avoid infinite "printing" toast
    const testPrintJobs = testOrders
      .filter(order => order.status !== 'pending')
      .map((order, index) => ({
        id: uuidv4(),
        orderId: order.id,
        printerId: 'zebra-zd421',
        status: 'completed' as const,
        labelPath: order.labelPath,
        createdAt: new Date(Date.now() - (3500000 - index * 1800000)).toISOString(),
        completedAt: new Date(Date.now() - (3400000 - index * 1800000)).toISOString(),
      }));

    // Add test orders
    testOrders.forEach((order) => {
      store.addOrder(order);
    });

    // Add test print jobs
    testPrintJobs.forEach((job) => {
      store.addPrintJob(job);
    });

    // Update printer status
    const printerStatus = {
      printerId: 'zebra-zd421',
      name: 'Zebra ZD421 Label Printer',
      status: 'online' as const,
      lastCheck: new Date().toISOString(),
    };
    store.updatePrinterStatus(printerStatus);

    // Broadcast all updates
    setTimeout(() => {
      testOrders.forEach((order) => broadcastUpdate('order_update', order));
      testPrintJobs.forEach((job) => broadcastUpdate('print_update', job));
      broadcastUpdate('printer_status', printerStatus);
    }, 100);

    console.log('✅ Test data seeded:', {
      orders: testOrders.length,
      printJobs: testPrintJobs.length,
    });

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
  } catch (error: any) {
    console.error('Failed to seed test data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed test data',
    });
  }
}

// Auto-generate orders at interval
let autoGenerateInterval: NodeJS.Timeout | null = null;

export async function startAutoGenerate(req: Request, res: Response) {
  if (autoGenerateInterval) {
    return res.json({
      success: false,
      message: 'Auto-generate already running',
    });
  }

  const intervalSeconds = parseInt(req.query.interval as string) || 30;

  autoGenerateInterval = setInterval(async () => {
    console.log('🤖 Auto-generating mock fulfillment...');
    const mockReq = { body: {} } as Request;
    const mockRes = {
      json: () => {},
      status: () => ({ json: () => {} }),
    } as any;
    await mockFulfillment(mockReq, mockRes);
  }, intervalSeconds * 1000);

  res.json({
    success: true,
    message: `Auto-generate started (every ${intervalSeconds}s)`,
  });
}

export async function stopAutoGenerate(req: Request, res: Response) {
  if (autoGenerateInterval) {
    clearInterval(autoGenerateInterval);
    autoGenerateInterval = null;
    res.json({
      success: true,
      message: 'Auto-generate stopped',
    });
  } else {
    res.json({
      success: false,
      message: 'Auto-generate not running',
    });
  }
}

// Toggle printer status (online/offline/error)
export async function togglePrinterStatus(req: Request, res: Response) {
  const { status } = req.body;

  if (!status || !['online', 'offline', 'error'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: online, offline, or error',
    });
  }

  const currentStatus = store.getPrinterStatus();
  const previousStatus = currentStatus?.status;

  const printerStatus = {
    printerId: currentStatus?.printerId || 'zebra-zd421',
    name: currentStatus?.name || 'Zebra ZD421 Label Printer',
    status: status as 'online' | 'offline' | 'error',
    lastCheck: new Date().toISOString(),
  };

  store.updatePrinterStatus(printerStatus);
  broadcastUpdate('printer_status', printerStatus);

  // If printer just came online, process queued jobs
  if (status === 'online' && previousStatus !== 'online') {
    console.log('🖨️ Printer came online, processing queued jobs...');
    processQueuedJobs();
  }

  res.json({
    success: true,
    message: `Printer status updated to: ${status}`,
    printerStatus,
  });
}

// Process queued print jobs (when printer comes online)
export function processQueuedJobs() {
  const printerStatus = store.getPrinterStatus();
  
  // Only process if printer is online
  if (!printerStatus || printerStatus.status !== 'online') {
    return;
  }

  const jobs = store.getAllPrintJobs();
  const queuedJobs = jobs.filter(j => j.status === 'queued');

  queuedJobs.forEach(job => {
    console.log('🔄 Processing queued job:', job.id);
    
    // Update to printing
    const updatedJob = { ...job, status: 'printing' as const };
    const jobIndex = jobs.findIndex(j => j.id === job.id);
    if (jobIndex >= 0) {
      jobs[jobIndex] = updatedJob;
    }
    broadcastUpdate('print_update', updatedJob);

    // Complete after 3 seconds
    setTimeout(() => {
      const completedJob = {
        ...updatedJob,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };

      const currentJobs = store.getAllPrintJobs();
      const currentIndex = currentJobs.findIndex(j => j.id === job.id);
      if (currentIndex >= 0) {
        currentJobs[currentIndex] = completedJob;
      }

      store.updateOrder(job.orderId, { status: 'printed' });
      const order = store.getOrder(job.orderId);
      
      broadcastUpdate('print_update', completedJob);
      if (order) {
        broadcastUpdate('order_update', { ...order, status: 'printed' });
      }
      console.log('✅ Queued job completed:', job.id);
    }, 3000);
  });
}

// Retry a specific print job
export async function retryPrintJob(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    const jobs = store.getAllPrintJobs();
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Print job not found',
      });
    }

    if (job.status !== 'queued' && job.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Job is not in a retryable state',
      });
    }

    const printerStatus = store.getPrinterStatus();
    if (!printerStatus || printerStatus.status !== 'online') {
      return res.status(400).json({
        success: false,
        error: 'Printer is not online',
      });
    }

    // Update to printing
    const updatedJob = { 
      ...job, 
      status: 'printing' as const,
      error: undefined 
    };
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex >= 0) {
      jobs[jobIndex] = updatedJob;
    }
    broadcastUpdate('print_update', updatedJob);
    console.log('🔄 Manually retrying print job:', jobId);

    // Complete after 3 seconds
    setTimeout(() => {
      const completedJob = {
        ...updatedJob,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };

      const currentJobs = store.getAllPrintJobs();
      const currentIndex = currentJobs.findIndex(j => j.id === jobId);
      if (currentIndex >= 0) {
        currentJobs[currentIndex] = completedJob;
      }

      store.updateOrder(job.orderId, { status: 'printed' });
      const order = store.getOrder(job.orderId);
      
      broadcastUpdate('print_update', completedJob);
      if (order) {
        broadcastUpdate('order_update', { ...order, status: 'printed' });
      }
      console.log('✅ Retry completed:', jobId);
    }, 3000);

    res.json({
      success: true,
      message: 'Print job retry initiated',
      job: updatedJob,
    });
  } catch (error: any) {
    console.error('Retry print job error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Mock external API endpoints
export async function mockMakeCommerceLabel(req: Request, res: Response) {
  res.json({
    success: true,
    labelUrl: 'https://static.maksekeskus.ee/lbl/mock-label.pdf',
  });
}

export async function mockPrintNodeJob(req: Request, res: Response) {
  const { printerId, title, contentType, content, source, qty } = req.body;

  // Extract order ID from the request (could be in printerId or need to find matching order)
  // For now, we'll try to find an order with a matching label URL
  const orders = store.getAllOrders();
  const matchingOrder = orders.find(order => 
    order.labelUrl === content || order.labelPath === content
  );

  if (!matchingOrder) {
    return res.status(404).json({
      success: false,
      message: 'Order not found for this label',
    });
  }

  // Check printer status
  const printerStatus = store.getPrinterStatus();
  const isOnline = printerStatus && printerStatus.status === 'online';

  // Create print job
  const printJob: PrintJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderId: matchingOrder.id,
    printerId: printerStatus?.printerId || 'zebra-zd421',
    status: isOnline ? 'printing' : 'queued',
    createdAt: new Date().toISOString(),
    completedAt: undefined,
  };

  store.addPrintJob(printJob);
  broadcastUpdate('print_update', printJob);

  // If printer is online, simulate printing and completion
  if (isOnline) {
    setTimeout(() => {
      const completedJob = {
        ...printJob,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      };
      
      const currentJobs = store.getAllPrintJobs();
      const jobIndex = currentJobs.findIndex(j => j.id === printJob.id);
      if (jobIndex >= 0) {
        currentJobs[jobIndex] = completedJob;
      }

      store.updateOrder(matchingOrder.id, { status: 'printed' });
      const order = store.getOrder(matchingOrder.id);
      
      broadcastUpdate('print_update', completedJob);
      if (order) {
        broadcastUpdate('order_update', order);
      }
    }, 3000); // 3 second delay to simulate printing
  }

  res.json({
    success: true,
    jobId: printJob.id,
    status: printJob.status,
  });
}
