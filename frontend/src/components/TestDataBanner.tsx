import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface TestDataBannerProps {
  hasTestData: boolean;
}

export function TestDataBanner({ hasTestData }: TestDataBannerProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!hasTestData || isDismissed) {
    return null;
  }

  const handleClearData = async () => {
    if (!confirm('Clear all test data? This will remove all orders and print jobs from the dashboard.')) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/clear', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Test data cleared successfully');
        setIsDismissed(true);
        // Data will be cleared via WebSocket 'data_cleared' message
      } else {
        toast.error('Failed to clear test data');
      }
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast.error('Failed to clear test data');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative rounded-lg border-2 border-amber-400/60 bg-gradient-to-r from-amber-50 via-amber-50/80 to-yellow-50 dark:from-amber-950/40 dark:via-amber-950/30 dark:to-yellow-950/30 dark:border-amber-600/40 shadow-sm">
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
              Test/Mock Data Active
            </h3>
            <span className="inline-flex items-center rounded-full bg-amber-200 dark:bg-amber-800 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100">
              Testing Mode
            </span>
          </div>
          <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            You're viewing test or mock data. Some order details or actual shipping labels may not be available.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleClearData}
            disabled={isClearing}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm dark:bg-amber-700 dark:hover:bg-amber-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear Data'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8 p-0 text-amber-800 hover:text-amber-950 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
