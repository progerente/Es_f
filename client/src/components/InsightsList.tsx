import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

interface InsightsListProps {
  title: string;
  items: Array<{
    text: string;
    priority?: 'high' | 'medium' | 'low';
    type?: 'strength' | 'weakness' | 'strategy' | 'recommendation';
  }>;
  type: 'strengths' | 'weaknesses' | 'strategies' | 'recommendations';
}

export function InsightsList({ title, items, type }: InsightsListProps) {
  const getIcon = () => {
    switch (type) {
      case 'strengths':
        return <CheckCircle className="w-5 h-5 text-status-connected" />;
      case 'weaknesses':
        return <AlertTriangle className="w-5 h-5 text-status-error" />;
      case 'strategies':
        return <TrendingUp className="w-5 h-5 text-primary" />;
      case 'recommendations':
        return <Lightbulb className="w-5 h-5 text-status-warning" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-status-error text-white';
      case 'medium':
        return 'bg-status-warning text-white';
      case 'low':
        return 'bg-status-connected text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return '';
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`insights-${type}`}>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        {getIcon()}
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-3 p-3 rounded-md bg-muted/30">
              <span className="text-sm text-foreground leading-relaxed flex-1">
                {item.text}
              </span>
              {item.priority && (
                <Badge className={`${getPriorityColor(item.priority)} text-xs flex-shrink-0`}>
                  {getPriorityText(item.priority)}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}