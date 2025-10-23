import { useState, useEffect } from 'react';
import { Download, ExternalLink, Printer, RefreshCw, Package, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { FulfilledOrder, PrintJob, ShopifyOrderDetails } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Skeleton } from './ui/skeleton';

interface OrderDetailsDialogProps {
  order: FulfilledOrder | null;
  onClose: () => void;
  printJobs: PrintJob[];
  onDownloadLabel: (order: FulfilledOrder, e: React.MouseEvent) => Promise<void>;
  onPrint: (order: FulfilledOrder, e: React.MouseEvent) => Promise<void>;
  onRetryPrintJob: (jobId: string, e: React.MouseEvent) => Promise<void>;
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

export function OrderDetailsDialog({
  order,
  onClose,
  printJobs,
  onDownloadLabel,
  onPrint,
  onRetryPrintJob,
}: OrderDetailsDialogProps) {
  const [orderDetails, setOrderDetails] = useState<ShopifyOrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!order) {
      setOrderDetails(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Fetch order details from Shopify
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const encodedOrderId = encodeURIComponent(order.shopifyOrderId);
        const response = await fetch(`/api/orders/${encodedOrderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: string, currency?: string) => {
    const amount = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const getOrderPrintJobs = (orderId: string) => {
    return printJobs.filter(job => job.orderId === orderId);
  };

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto !bg-white" style={{ backgroundColor: 'white' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details
          </DialogTitle>
          <DialogDescription>
            Complete information for order {order.shopifyOrderId.replace('gid://shopify/Order/', '#')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Order ID</div>
              <div className="font-mono text-sm mt-1">
                {order.shopifyOrderId.replace('gid://shopify/Order/', '#')}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="mt-1">
                <Badge variant={statusVariants[order.status]}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Carrier</div>
              <div className="mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${carrierColors[order.carrier]}`}>
                  {order.carrier}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Tracking Number</div>
              <div className="font-mono text-sm mt-1">{order.trackingNumber}</div>
            </div>
            {order.lockerId && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Locker ID</div>
                <div className="font-mono text-sm mt-1">{order.lockerId}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-muted-foreground">Created At</div>
              <div className="text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                <h4 className="font-medium">Order Items</h4>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border-t pt-4">
              <div className="text-sm bg-destructive/10 text-destructive p-3 rounded-md">
                {error}
              </div>
            </div>
          )}

          {/* Products Section */}
          {orderDetails && orderDetails.line_items && orderDetails.line_items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                <h4 className="font-medium">Order Items ({orderDetails.line_items.length})</h4>
              </div>
              
              <div className="space-y-3">
                {orderDetails.line_items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.image?.src ? (
                        <img
                          src={item.image.src}
                          alt={item.image.alt || item.title}
                          className="h-16 w-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded border flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.variant_title && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.variant_title}
                        </div>
                      )}
                      {item.sku && (
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          SKU: {item.sku}
                        </div>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex flex-col items-end justify-between text-sm">
                      <div className="font-medium">
                        {formatPrice(item.price, orderDetails.currency)}
                      </div>
                      <div className="text-muted-foreground">
                        Qty: {item.quantity}
                      </div>
                      <div className="font-semibold">
                        {formatPrice((parseFloat(item.price) * item.quantity).toString(), orderDetails.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-4 pt-4 border-t space-y-2">
                {orderDetails.subtotal_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatPrice(orderDetails.subtotal_price, orderDetails.currency)}</span>
                  </div>
                )}
                {orderDetails.shipping_lines && orderDetails.shipping_lines[0]?.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>{formatPrice(orderDetails.shipping_lines[0].price, orderDetails.currency)}</span>
                  </div>
                )}
                {orderDetails.total_tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatPrice(orderDetails.total_tax, orderDetails.currency)}</span>
                  </div>
                )}
                {orderDetails.total_price && (
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPrice(orderDetails.total_price, orderDetails.currency)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Information */}
          {orderDetails?.customer && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                <h4 className="font-medium">Customer Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Name</div>
                  <div className="mt-1">
                    {orderDetails.customer.first_name && orderDetails.customer.last_name
                      ? `${orderDetails.customer.first_name} ${orderDetails.customer.last_name}`
                      : orderDetails.customer.first_name || orderDetails.customer.last_name || 'Guest Customer'}
                  </div>
                </div>
                {orderDetails.customer.email && (
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="mt-1">{orderDetails.customer.email}</div>
                  </div>
                )}
                {orderDetails.customer.phone && (
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="mt-1">{orderDetails.customer.phone}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address or Parcel Locker */}
          {(orderDetails?.shipping_address || orderDetails?.note_attributes) && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                <h4 className="font-medium">
                  {(() => {
                    const parcelName = orderDetails.note_attributes?.find(attr => attr.name === 'parcelName');
                    return parcelName ? 'Parcel Locker' : 'Shipping Address';
                  })()}
                </h4>
              </div>
              <div className="text-sm space-y-1">
                {(() => {
                  const parcelName = orderDetails.note_attributes?.find(attr => attr.name === 'parcelName');
                  const parcelAddress = orderDetails.note_attributes?.find(attr => attr.name === 'address');
                  const parcelCity = orderDetails.note_attributes?.find(attr => attr.name === 'city');
                  const parcelZip = orderDetails.note_attributes?.find(attr => attr.name === 'zip');
                  const parcelId = orderDetails.note_attributes?.find(attr => attr.name === 'parcelId');

                  if (parcelName) {
                    // Show parcel locker info
                    return (
                      <>
                        <div className="font-medium">{parcelName.value}</div>
                        {parcelId && <div className="text-muted-foreground">Locker ID: {parcelId.value}</div>}
                        {parcelAddress && <div>{parcelAddress.value}</div>}
                        <div>
                          {parcelCity?.value}
                          {parcelZip?.value && `, ${parcelZip.value}`}
                        </div>
                        <div>{orderDetails.shipping_address?.country || 'Lithuania'}</div>
                      </>
                    );
                  }

                  // Show regular shipping address
                  const addr = orderDetails.shipping_address;
                  if (!addr) return <div className="text-muted-foreground">No shipping address provided</div>;

                  return (
                    <>
                      {(addr.first_name || addr.last_name) && (
                        <div>
                          {addr.first_name} {addr.last_name}
                        </div>
                      )}
                      {addr.address1 && <div>{addr.address1}</div>}
                      {addr.address2 && <div>{addr.address2}</div>}
                      {(addr.city || addr.zip) && (
                        <div>
                          {addr.city}
                          {addr.city && addr.zip && ', '}
                          {addr.zip}
                        </div>
                      )}
                      {addr.province && <div>{addr.province}</div>}
                      {addr.country && <div>{addr.country}</div>}
                      {addr.phone && (
                        <div className="mt-2 text-muted-foreground">
                          Phone: {addr.phone}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Label Info */}
          {(order.labelUrl || order.labelPath) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Label Information</h4>
              <div className="flex flex-wrap gap-2">
                {order.labelUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(order.labelUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Label
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => onDownloadLabel(order, e)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => onPrint(order, e)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </Button>
              </div>
            </div>
          )}

          {/* Associated Print Jobs */}
          {order && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">
                Print Jobs ({getOrderPrintJobs(order.id).length})
              </h4>
              {getOrderPrintJobs(order.id).length === 0 ? (
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
                      {getOrderPrintJobs(order.id).map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-mono text-xs">
                            {job.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="text-xs">{job.printerId}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                job.status === 'completed'
                                  ? 'success'
                                  : job.status === 'failed'
                                  ? 'destructive'
                                  : job.status === 'printing'
                                  ? 'default'
                                  : 'warning'
                              }
                            >
                              {job.status}
                            </Badge>
                            {job.error && (
                              <div className="text-xs text-destructive mt-1">{job.error}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(job.createdAt)}</TableCell>
                          <TableCell className="text-xs">
                            {job.completedAt ? formatDate(job.completedAt) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {(job.status === 'queued' || job.status === 'failed') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={(e) => onRetryPrintJob(job.id, e)}
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
          )}

          {/* Error Info */}
          {order.error && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 text-destructive">Error</h4>
              <div className="text-sm bg-destructive/10 text-destructive p-3 rounded-md">
                {order.error}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
