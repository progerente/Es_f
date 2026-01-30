import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Target, Lightbulb } from "lucide-react";

interface CultureTypeCardProps {
  type: string;
  description: string;
  characteristics: string[];
  confidence?: number;
}

export function CultureTypeCard({ type, description, characteristics }: CultureTypeCardProps) {
  const getCultureIcon = () => {
    switch (type.toLowerCase()) {
      case 'clan':
        return <Users className="w-5 h-5 text-primary" />;
      case 'adhocracia':
        return <Lightbulb className="w-5 h-5 text-primary" />;
      case 'mercado':
        return <Target className="w-5 h-5 text-primary" />;
      case 'jerarquía':
        return <Building2 className="w-5 h-5 text-primary" />;
      default:
        return <Building2 className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Card className="hover-elevate" data-testid="card-culture-type">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          {getCultureIcon()}
          <CardTitle className="text-lg font-semibold">Tipo de Cultura: {type}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Características principales:</h4>
          <div className="space-y-1">
            {characteristics.map((characteristic, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-foreground">{characteristic}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}