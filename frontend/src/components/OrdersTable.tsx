import { useState } from 'react';
import { Download, ExternalLink, Printer, Eye, RefreshCw } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

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

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `label-${order.trackingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
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

  const getOrderPrintJobs = (orderId: string) => {
    return printJobs.filter(job => job.orderId === orderId);
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
    <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto !bg-white" style={{ backgroundColor: 'white' }}>
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Complete information for order {selectedOrder?.shopifyOrderId.replace('gid://shopify/Order/', '#')}
          </DialogDescription>
        </DialogHeader>

        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Order ID</div>
                <div className="font-mono text-sm mt-1">{selectedOrder?.shopifyOrderId.replace('gid://shopify/Order/', '#')}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="mt-1">
                  <Badge variant={statusVariants[selectedOrder.status]}>
                    {selectedOrder.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Carrier</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${carrierColors[selectedOrder.carrier]}`}>
                    {selectedOrder.carrier}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Tracking Number</div>
                <div className="font-mono text-sm mt-1">{selectedOrder.trackingNumber}</div>
              </div>
              {selectedOrder.lockerId && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Locker ID</div>
                  <div className="font-mono text-sm mt-1">{selectedOrder.lockerId}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-muted-foreground">Created At</div>
                <div className="text-sm mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Label Info */}
            {(selectedOrder.labelUrl || selectedOrder.labelPath) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Label Information</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.labelUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedOrder.labelUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Label
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDownloadLabel(selectedOrder, e)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => handlePrint(selectedOrder, e)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Label
                  </Button>
                </div>
              </div>
            )}

            {/* Associated Print Jobs */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Print Jobs ({getOrderPrintJobs(selectedOrder.id).length})</h4>
              {getOrderPrintJobs(selectedOrder.id).length === 0 ? (
                <div className="text-sm text-muted-foreground">No print jobs yet</div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Printer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getOrderPrintJobs(selectedOrder.id).map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-mono text-xs">{job.id.slice(0, 8)}</TableCell>
                          <TableCell className="text-xs">{job.printerId}</TableCell>
                          <TableCell>
                            <Badge variant={
                              job.status === 'completed' ? 'success' :
                              job.status === 'failed' ? 'destructive' :
                              job.status === 'printing' ? 'default' : 'warning'
                            }>
                              {job.status}
                            </Badge>
                            {job.error && (
                              <div className="text-xs text-destructive mt-1">{job.error}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(job.createdAt)}</TableCell>
                          <TableCell className="text-xs">{job.completedAt ? formatDate(job.completedAt) : '—'}</TableCell>
                          <TableCell className="text-right">
                            {(job.status === 'queued' || job.status === 'failed') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={(e) => handleRetryPrintJob(job.id, e)}
                                title="Retry print job"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Error Info */}
            {selectedOrder.error && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 text-destructive">Error</h4>
                <div className="text-sm bg-destructive/10 text-destructive p-3 rounded-md">
                  {selectedOrder.error}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
