import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Info } from "lucide-react";
import type { StrategicIndicator } from "@/lib/api";

interface StrategicRadarChartProps {
  data?: StrategicIndicator[];
  onIndicatorClick?: (indicator: StrategicIndicator) => void;
}

export function StrategicRadarChart({ data, onIndicatorClick }: StrategicRadarChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map(indicator => ({
    indicador: indicator.indicador,
    valor: indicator.valor,
    fullMark: 100
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = data.find(d => d.indicador === payload[0].payload.indicador);
      return (
        <div className="bg-card border border-border rounded-md p-3 shadow-lg">
          <p className="font-semibold text-sm text-foreground">{payload[0].payload.indicador}</p>
          <p className="text-2xl font-bold text-primary mt-1">{payload[0].value}/100</p>
          {item && (
            <p className="text-xs text-muted-foreground mt-2">{item.descripcion}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card data-testid="card-radar-chart">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Indicadores Estratégicos</CardTitle>
          <CardDescription>
            Análisis multidimensional de aspectos clave organizacionales
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid 
                strokeDasharray="3 3" 
                className="stroke-muted-foreground/20"
              />
              <PolarAngleAxis 
                dataKey="indicador" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Valor"
                dataKey="valor"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
                strokeWidth={2}
                data-testid="radar-area"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.map((indicator, index) => {
            const getColorClass = (value: number) => {
              if (value >= 80) return 'text-green-600 dark:text-green-400';
              if (value >= 60) return 'text-blue-600 dark:text-blue-400';
              if (value >= 40) return 'text-amber-600 dark:text-amber-400';
              return 'text-red-600 dark:text-red-400';
            };

            return (
              <div 
                key={index} 
                className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-border ${
                  onIndicatorClick ? 'hover-elevate cursor-pointer active-elevate-2' : ''
                }`}
                data-testid={`indicator-${indicator.indicador.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onIndicatorClick?.(indicator)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`text-2xl font-bold ${getColorClass(indicator.valor)}`}>
                    {indicator.valor}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {indicator.indicador}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {indicator.descripcion}
                    </p>
                  </div>
                </div>
                {onIndicatorClick && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIndicatorClick(indicator);
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
