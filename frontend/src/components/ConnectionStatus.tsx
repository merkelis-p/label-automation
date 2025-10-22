import { Activity, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <Badge variant="success">Live</Badge>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <Badge variant="destructive">Disconnected</Badge>
        </>
      )}
    </div>
  );
}
