import { useState } from 'react';
import { Download, ExternalLink, Printer, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { FulfilledOrder, PrintJob } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { OrderDetailsDialog } from './OrderDetailsDialog';

interface OrdersTableProps {
  orders: FulfilledOrder[];
  printJobs: PrintJob[];
}

const statusVariants = {
  pending: 'warning',
  label_created: 'default',
  printed: 'success',
  error: 'destructive',
} as const;

const carrierColors = {
  DPD_LT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  OMNIVA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const ITEMS_PER_PAGE = 10;

export function OrdersTable({ orders, printJobs }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<FulfilledOrder | null>(null);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadLabel = async (order: FulfilledOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.labelPath && !order.labelUrl) return;

    try {
      const url = order.labelPath || order.labelUrl;
      if (!url) return;

      // Use proxy endpoint for external URLs to avoid CORS issues
      const isExternal = url.startsWith('http://') || url.startsWith('https://');
      const downloadUrl = isExternal 
        ? `http://localhost:3000/api/proxy-pdf?url=${encodeURIComponent(url)}`
        : url;

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `label-${order.trackingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      toast.success('Label downloaded successfully');
    } catch (error) {
      console.error('Failed to download label:', error);
      toast.error('Failed to download label');
    }
  };

  const handlePrint = async (order: FulfilledOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.labelPath && !order.labelUrl) return;

    try {
      const printPromise = fetch('/mock/printnode/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerId: order.id, // Use order ID as printer ID for mock
          title: `Label ${order.trackingNumber}`,
          contentType: 'pdf_uri',
          content: order.labelUrl || order.labelPath,
          source: 'manual',
          qty: 1,
        }),
      });

      toast.promise(printPromise, {
        loading: `Sending label ${order.trackingNumber} to printer...`,
        success: 'Label sent to printer successfully',
        error: 'Failed to send label to printer',
      });

      await printPromise;
    } catch (error) {
      console.error('Failed to print:', error);
      toast.error('Failed to print label');
    }
  };

  const handleRetryPrintJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/print-jobs/${jobId}/retry`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to retry print job');
      }

      toast.success('Print job retry initiated');
    } catch (error) {
      console.error('Failed to retry print job:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to retry print job');
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Fulfilled Orders</CardTitle>
        <CardDescription>
          Real-time tracking of order fulfillments and label generation ({orders.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Order ID</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead className="hidden sm:table-cell">Locker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No orders yet. Waiting for fulfillments...
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate max-w-[140px]">
                        {order.shopifyOrderId.replace('gid://shopify/Order/', '#')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        carrierColors[order.carrier]
                      }`}
                    >
                      {order.carrier}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {order.trackingNumber}
                  </TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">
                    {order.lockerId || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[order.status]}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {order.labelUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(order.labelUrl, '_blank');
                          }}
                          title="View label"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {(order.labelPath || order.labelUrl) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => handleDownloadLabel(order, e)}
                            title="Download label"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => handlePrint(order, e)}
                            title="Print label"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Order Details Dialog */}
    <OrderDetailsDialog
      order={selectedOrder}
      onClose={() => setSelectedOrder(null)}
      printJobs={printJobs}
      onDownloadLabel={handleDownloadLabel}
      onPrint={handlePrint}
      onRetryPrintJob={handleRetryPrintJob}
    />
    </>
  );
}
