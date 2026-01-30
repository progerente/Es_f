import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

interface ConnectionStatusProps {
  service: string;
  status: 'connected' | 'warning' | 'error' | 'offline';
  lastUpdate?: string;
}

export function ConnectionStatus({ service, status, lastUpdate }: ConnectionStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-3 h-3" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3" />;
      case 'error':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-status-connected text-white';
      case 'warning':
        return 'bg-status-warning text-white';
      case 'error':
        return 'bg-status-error text-white';
      default:
        return 'bg-status-offline text-white';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="flex items-center gap-2" data-testid={`status-${service.toLowerCase()}`}>
      <span className="text-sm font-medium text-foreground">{service}</span>
      <Badge className={`${getStatusColor()} flex items-center gap-1`}>
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Última actualización: {lastUpdate}
        </span>
      )}
    </div>
  );
}