import { Printer, Circle } from 'lucide-react';
import type { PrinterStatus as PrinterStatusType } from '../types';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface PrinterStatusProps {
  status: PrinterStatusType | null;
}

const statusConfig = {
  online: {
    variant: 'success' as const,
    icon: Circle,
    color: 'text-green-500',
  },
  offline: {
    variant: 'secondary' as const,
    icon: Circle,
    color: 'text-gray-400',
  },
  error: {
    variant: 'destructive' as const,
    icon: Circle,
    color: 'text-red-500',
  },
};

export function PrinterStatus({ status }: PrinterStatusProps) {
  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Printer Status
          </CardTitle>
          <CardDescription>No printer configured</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const config = statusConfig[status.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Printer Status
        </CardTitle>
        <CardDescription>{status.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-3 w-3 fill-current ${config.color}`} />
            <Badge variant={config.variant}>{status.status}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Last check: {new Date(status.lastCheck).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
