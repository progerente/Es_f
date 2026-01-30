import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

export function MetricCard({ title, value, description, trend, trendValue, onClick }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-status-connected" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-status-error" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-status-warning" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-status-connected';
      case 'down':
        return 'text-status-error';
      case 'neutral':
        return 'text-status-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card 
      className={`hover-elevate transition-all ${onClick ? 'cursor-pointer active-elevate-2' : ''}`}
      onClick={onClick}
      data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          {onClick && (
            <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trendValue && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${getTrendColor()}`}>
            <span>{trendValue}</span>
            <span>vs. período anterior</span>
          </p>
        )}
        {onClick && (
          <p className="text-xs text-primary mt-2 font-medium">
            Haga clic para ver detalles
          </p>
        )}
      </CardContent>
    </Card>
  );
}