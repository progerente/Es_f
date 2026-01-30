import { useQuery } from "@tanstack/react-query";
import { api, type StrategicIndicator } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StrategicRadarChart } from "@/components/StrategicRadarChart";
import { PeopleAnalyticsSection } from "@/components/PeopleAnalyticsSection";
import { KPIDetailDialog } from "@/components/KPIDetailDialog";
import { AlertCircle, TrendingUp, TrendingDown, Target, CheckCircle2, XCircle, Lightbulb, Calendar, Building2, Globe, Info } from "lucide-react";
import { useState } from "react";

export default function Analysis() {
  // State for KPI detail dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<{
    type: 'kpi' | 'indicator' | 'okr';
    data: any;
  } | null>(null);

  // Handlers for KPI detail dialog
  const handleOpenKPIDetail = (kpi: any) => {
    setSelectedIndicator({
      type: 'kpi',
      data: {
        nombre: kpi.nombre,
        valor: kpi.valor_estimado,
        interpretacion: kpi.interpretacion,
      }
    });
    setDialogOpen(true);
  };

  const handleOpenIndicatorDetail = (indicator: StrategicIndicator) => {
    setSelectedIndicator({
      type: 'indicator',
      data: {
        nombre: indicator.indicador,
        valor: indicator.valor,
        descripcion: indicator.descripcion,
      }
    });
    setDialogOpen(true);
  };

  const handleOpenOKRDetail = (okr: any) => {
    setSelectedIndicator({
      type: 'okr',
      data: {
        objetivo: okr.objetivo,
        resultados_clave: okr.resultados_clave,
      }
    });
    setDialogOpen(true);
  };

  // Fetch latest analysis results
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['/api/analysis/results'],
    queryFn: api.getLatestResults,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('No analysis results found')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Show empty state if no results
  if (!isLoading && (!results || error?.message?.includes('No analysis results found'))) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="page-analysis-empty">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Aún no tenemos análisis</CardTitle>
            <CardDescription>
              Inicie un análisis desde el panel principal para visualizar aquí los resultados detallados
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Estamos cargando el análisis...</p>
        </div>
      </div>
    );
  }

  const analysisData = results?.analysisResult;

  return (
    <div className="space-y-6 pb-8" data-testid="page-analysis">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Análisis Detallado</h1>
            <p className="text-muted-foreground mt-1">
              Presentamos los resultados completos del análisis organizacional
            </p>
          </div>
          {results?.analysisDate && (
            <Badge variant="outline" className="text-sm gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(results.analysisDate).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Badge>
          )}
        </div>

        {/* Analysis metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Comunicaciones analizadas</p>
                <p className="text-2xl font-bold" data-testid="text-emails-count">
                  {results?.totalEmailsAnalyzed.toLocaleString()}
                </p>
              </div>
              {results?.dateFrom && results?.dateTo && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Período analizado</p>
                  <p className="text-base font-medium" data-testid="text-period">
                    {new Date(results.dateFrom).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(results.dateTo).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Filters applied */}
            {(results?.departments?.length || results?.countries?.length) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Filtros aplicados:</p>
                  <div className="flex flex-wrap gap-2">
                    {results.departments?.map(dept => (
                      <Badge key={dept} variant="secondary" className="gap-1.5" data-testid={`badge-dept-${dept.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Building2 className="w-3 h-3" />
                        {dept}
                      </Badge>
                    ))}
                    {results.countries?.map(country => (
                      <Badge key={country} variant="secondary" className="gap-1.5" data-testid={`badge-country-${country.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Globe className="w-3 h-3" />
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diagnostic Summary */}
      {analysisData?.diagnostico_general && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Diagnóstico General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-base leading-relaxed" data-testid="text-diagnostic">
                {analysisData.diagnostico_general}
              </AlertDescription>
            </Alert>
            {analysisData.tipo_de_cultura && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Tipo de cultura identificada:</p>
                <Badge className="text-base py-1.5 px-3" data-testid="badge-culture-type">
                  {analysisData.tipo_de_cultura}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strategic Radar Chart */}
      <StrategicRadarChart 
        data={analysisData?.indicadores_estrategicos}
        onIndicatorClick={handleOpenIndicatorDetail}
      />

      {/* KPIs Section */}
      {analysisData?.kpis && analysisData.kpis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Indicadores Clave de Desempeño (KPIs)
            </CardTitle>
            <CardDescription>
              Métricas principales del clima organizacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData.kpis.map((kpi, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border bg-card hover-elevate cursor-pointer active-elevate-2 transition-all" 
                  data-testid={`card-kpi-${index}`}
                  onClick={() => handleOpenKPIDetail(kpi)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{kpi.nombre}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" data-testid={`badge-kpi-value-${index}`}>
                        {kpi.valor_estimado}
                      </Badge>
                      <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{kpi.interpretacion}</p>
                  <p className="text-xs text-primary mt-3 font-medium">
                    Haga clic para ver detalles
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* OKRs Section */}
      {analysisData?.okrs && analysisData.okrs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Objetivos y Resultados Clave (OKRs)
            </CardTitle>
            <CardDescription>
              Objetivos estratégicos recomendados para mejorar el clima
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysisData.okrs.map((okr, index) => (
              <div key={index} className="space-y-3" data-testid={`okr-${index}`}>
                <div 
                  className="flex items-start gap-3 p-4 rounded-lg border hover-elevate cursor-pointer active-elevate-2 transition-all"
                  onClick={() => handleOpenOKRDetail(okr)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-semibold text-foreground">{okr.objetivo}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 -mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOKRDetail(okr);
                        }}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      {okr.resultados_clave.map((resultado, rIndex) => (
                        <div key={rIndex} className="flex items-start gap-2" data-testid={`okr-${index}-kr-${rIndex}`}>
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{resultado}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-primary mt-3 font-medium">
                      Haga clic para ver detalles
                    </p>
                  </div>
                </div>
                {index < analysisData.okrs.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        {analysisData?.fortalezas && analysisData.fortalezas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="w-5 h-5" />
                Fortalezas Identificadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisData.fortalezas.map((fortaleza, index) => (
                  <li key={index} className="flex items-start gap-3" data-testid={`strength-${index}`}>
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{fortaleza}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses */}
        {analysisData?.debilidades && analysisData.debilidades.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <TrendingDown className="w-5 h-5" />
                Áreas de Mejora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisData.debilidades.map((debilidad, index) => (
                  <li key={index} className="flex items-start gap-3" data-testid={`weakness-${index}`}>
                    <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{debilidad}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Strategies */}
      {analysisData?.estrategias && analysisData.estrategias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Estrategias Recomendadas
            </CardTitle>
            <CardDescription>
              Acciones clave para mejorar el clima organizacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData.estrategias.map((estrategia, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card" data-testid={`strategy-${index}`}>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm flex-1">{estrategia}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Methodological Recommendations */}
      {analysisData?.recomendaciones_metodologicas && analysisData.recomendaciones_metodologicas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Recomendaciones Metodológicas
            </CardTitle>
            <CardDescription>
              Mejores prácticas para implementar las estrategias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisData.recomendaciones_metodologicas.map((recomendacion, index) => (
                <li key={index} className="flex items-start gap-3" data-testid={`recommendation-${index}`}>
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{index + 1}</span>
                  </div>
                  <span className="text-sm flex-1">{recomendacion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* People Analytics */}
      <PeopleAnalyticsSection data={analysisData?.people_analytics} />

      {/* KPI Detail Dialog */}
      {selectedIndicator && (
        <KPIDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          type={selectedIndicator.type}
          data={selectedIndicator.data}
        />
      )}
    </div>
  );
}
