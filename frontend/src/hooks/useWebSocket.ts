import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { FulfilledOrder, PrintJob, PrinterStatus, WebSocketMessage } from '../types';

export function useWebSocket() {
  const [orders, setOrders] = useState<FulfilledOrder[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const hasConnectedOnce = useRef(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [ordersRes, printJobsRes, printerRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/print-jobs'),
        fetch('/api/printer-status'),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
      }

      if (printJobsRes.ok) {
        const data = await printJobsRes.json();
        setPrintJobs(data);
      }

      if (printerRes.ok) {
        const data = await printerRes.json();
        setPrinterStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Only show toast after first connection (not on reconnects during dev)
      if (hasConnectedOnce.current) {
        toast.success('Reconnected to live updates');
      }
      hasConnectedOnce.current = true;
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'order_update':
            setOrders((prev) => {
              const order = message.data as FulfilledOrder;
              const index = prev.findIndex((o) => o.id === order.id);
              
              // Show toast for new orders
              if (index === -1) {
                toast.info(`New order received: ${order.shopifyOrderId.replace('gid://shopify/Order/', '#')}`);
              } else if (prev[index].status !== order.status) {
                // Status changed
                if (order.status === 'label_created') {
                  toast.success(`Label created for order ${order.shopifyOrderId.replace('gid://shopify/Order/', '#')}`);
                } else if (order.status === 'printed') {
                  toast.success(`Label printed for order ${order.shopifyOrderId.replace('gid://shopify/Order/', '#')}`);
                } else if (order.status === 'error') {
                  toast.error(`Error processing order ${order.shopifyOrderId.replace('gid://shopify/Order/', '#')}`);
                }
              }
              
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = order;
                return updated;
              }
              return [order, ...prev];
            });
            break;

          case 'print_update':
            setPrintJobs((prev) => {
              const job = message.data as PrintJob;
              const index = prev.findIndex((j) => j.id === job.id);
              
              // Show toast for print job updates
              if (index === -1 && job.status === 'printing') {
                toast.loading(`Print job started...`, { id: job.id });
              } else if (index >= 0 && prev[index].status !== job.status) {
                if (job.status === 'completed') {
                  toast.success(`Print job completed`, { id: job.id });
                } else if (job.status === 'failed') {
                  toast.error(`Print job failed: ${job.error || 'Unknown error'}`, { id: job.id });
                }
              }
              
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = job;
                return updated;
              }
              return [job, ...prev];
            });
            break;

          case 'printer_status':
            const printerData = message.data as PrinterStatus;
            setPrinterStatus(printerData);
            
            // Show toast for printer status changes
            if (printerData.status === 'online') {
              toast.success(`Printer ${printerData.name} is online`);
            } else if (printerData.status === 'offline') {
              toast.warning(`Printer ${printerData.name} is offline`);
            } else if (printerData.status === 'error') {
              toast.error(`Printer ${printerData.name} has an error`);
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Don't show disconnect toast during normal cleanup (dev mode)
      // Only show if it was a real connection that closed unexpectedly
      if (event.code !== 1000 && hasConnectedOnce.current && event.wasClean === false) {
        toast.error('Connection lost - page will attempt to reconnect');
      }
    };

    ws.onerror = () => {
      // Suppress error logs during component cleanup (React Strict Mode)
      // The error is expected when cleanup happens before connection is established
      // Real errors will be caught by onclose handler
    };

    return () => {
      // Cleanly close the WebSocket
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [fetchInitialData]);

  return { orders, printJobs, printerStatus, isConnected };
}
