import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Info } from "lucide-react";

interface OKR {
  objetivo: string;
  resultados_clave: Array<{
    descripcion: string;
    progreso?: number;
    meta?: string;
  }>;
}

interface OKRListProps {
  okrs: OKR[];
  onOKRClick?: (okr: OKR) => void;
}

export function OKRList({ okrs, onOKRClick }: OKRListProps) {
  return (
    <Card className="hover-elevate" data-testid="card-okrs">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Target className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg font-semibold">OKRs Sugeridos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {okrs.map((okr, index) => (
            <div key={index} className="space-y-3">
              <div 
                className={`p-4 rounded-lg border ${
                  onOKRClick ? 'hover-elevate cursor-pointer active-elevate-2 transition-all' : ''
                }`}
                onClick={() => onOKRClick?.(okr)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-medium text-foreground text-base leading-relaxed flex-1">
                    {okr.objetivo}
                  </h3>
                  {onOKRClick && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOKRClick(okr);
                      }}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-3 ml-4">
                  {okr.resultados_clave.map((resultado, resultIndex) => (
                    <div key={resultIndex} className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm text-muted-foreground leading-relaxed flex-1">
                          {resultado.descripcion}
                        </span>
                        {resultado.meta && (
                          <span className="text-xs text-primary font-medium flex-shrink-0">
                            Meta: {resultado.meta}
                          </span>
                        )}
                      </div>
                      {resultado.progreso !== undefined && (
                        <div className="flex items-center gap-2">
                          <Progress value={resultado.progreso} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground font-medium w-10">
                            {resultado.progreso}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {onOKRClick && (
                  <p className="text-xs text-primary mt-3 font-medium">
                    Haga clic para ver detalles
                  </p>
                )}
              </div>
              {index < okrs.length - 1 && (
                <div className="border-b border-border mt-6" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}