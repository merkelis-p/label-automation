import { Package } from 'lucide-react';
import { Toaster } from 'sonner';
import { useWebSocket } from './hooks/useWebSocket';
import { OrdersTable } from './components/OrdersTable';
import { PrintJobsTable } from './components/PrintJobsTable';
import { PrinterStatus } from './components/PrinterStatus';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TestDataBanner } from './components/TestDataBanner';

function App() {
  const { orders, printJobs, printerStatus, isConnected, hasTestData } = useWebSocket();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-right" richColors closeButton />
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Package className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-0">
                  <h1 className="text-xl md:text-3xl font-bold">Label Printing Automation</h1>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block whitespace-nowrap mt-0">
                  Real-time order fulfillment and label printing
                </p>
              </div>
            </div>
            <ConnectionStatus isConnected={isConnected} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid gap-4 md:gap-6">
          <TestDataBanner hasTestData={hasTestData} />
          <PrinterStatus status={printerStatus} />
          <OrdersTable orders={orders} printJobs={printJobs} />
          <PrintJobsTable printJobs={printJobs} />
        </div>
      </main>
    </div>
  );
}

export default App;
