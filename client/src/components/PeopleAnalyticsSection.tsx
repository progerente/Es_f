import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Users, Target, DollarSign } from "lucide-react";

interface PeopleAnalyticsData {
  metricas_internas: {
    rotacion_estimada: string;
    ausentismo_detectado: string;
    nivel_desempeno_promedio: string;
    interpretacion: string;
  };
  benchmarking_externo: {
    comparacion_industria: string;
    posicionamiento: string;
    gaps_identificados: string[];
  };
  riesgos_fuga_talento: {
    nivel_riesgo: string;
    areas_criticas: string[];
    indicadores_alerta: string[];
    empleados_en_riesgo_estimado: string;
  };
  relacion_clima_desempeno: {
    correlacion: string;
    areas_impacto_positivo: string[];
    areas_impacto_negativo: string[];
    insight_principal: string;
  };
  vinculacion_productividad: {
    impacto_productividad: string;
    impacto_rentabilidad_estimado: string;
    metricas_clave: Array<{
      metrica: string;
      relacion_clima: string;
    }>;
    recomendaciones_roi: string[];
  };
}

interface PeopleAnalyticsSectionProps {
  data: PeopleAnalyticsData | undefined;
}

export function PeopleAnalyticsSection({ data }: PeopleAnalyticsSectionProps) {
  if (!data) {
    return null;
  }

  const getRiskBadgeVariant = (riesgo: string) => {
    const nivel = riesgo.toLowerCase();
    if (nivel.includes('crítico') || nivel.includes('alto')) return 'destructive';
    if (nivel.includes('medio')) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6" data-testid="section-people-analytics">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" />
          People Analytics
        </h2>
        <p className="text-muted-foreground">
          Análisis de datos internos, benchmarking y correlación clima-desempeño
        </p>
      </div>

      {/* Internal Metrics */}
      <Card data-testid="card-metricas-internas">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Métricas Internas
          </CardTitle>
          <CardDescription>{data.metricas_internas.interpretacion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Rotación Estimada</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-rotacion">
                {data.metricas_internas.rotacion_estimada}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ausentismo</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-ausentismo">
                {data.metricas_internas.ausentismo_detectado}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Desempeño Promedio</p>
              <p className="text-2xl font-bold text-foreground" data-testid="text-desempeno">
                {data.metricas_internas.nivel_desempeno_promedio}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talent Flight Risk */}
      <Card data-testid="card-riesgo-fuga">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Riesgos de Fuga de Talento
          </CardTitle>
          <CardDescription>
            {data.riesgos_fuga_talento.empleados_en_riesgo_estimado}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Nivel de Riesgo:</span>
            <Badge variant={getRiskBadgeVariant(data.riesgos_fuga_talento.nivel_riesgo)} data-testid="badge-nivel-riesgo">
              {data.riesgos_fuga_talento.nivel_riesgo}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Áreas Críticas:</p>
            <div className="flex flex-wrap gap-2">
              {data.riesgos_fuga_talento.areas_criticas.map((area, index) => (
                <Badge key={index} variant="outline" data-testid={`badge-area-critica-${index}`}>
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Indicadores de Alerta:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {data.riesgos_fuga_talento.indicadores_alerta.map((indicador, index) => (
                <li key={index} className="flex items-start gap-2" data-testid={`text-indicador-${index}`}>
                  <span className="text-destructive mt-1">•</span>
                  <span>{indicador}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benchmarking */}
        <Card data-testid="card-benchmarking">
          <CardHeader>
            <CardTitle>Benchmarking Externo</CardTitle>
            <CardDescription>{data.benchmarking_externo.comparacion_industria}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Posicionamiento:</span>
              <Badge variant="secondary" data-testid="badge-posicionamiento">
                {data.benchmarking_externo.posicionamiento}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Gaps Identificados:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.benchmarking_externo.gaps_identificados.map((gap, index) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`text-gap-${index}`}>
                    <span className="text-primary mt-1">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Climate-Performance Correlation */}
        <Card data-testid="card-clima-desempeno">
          <CardHeader>
            <CardTitle>Relación Clima-Desempeño</CardTitle>
            <CardDescription>{data.relacion_clima_desempeno.insight_principal}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Correlación:</span>
              <Badge variant="secondary" data-testid="badge-correlacion">
                {data.relacion_clima_desempeno.correlacion}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Impacto Positivo:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.relacion_clima_desempeno.areas_impacto_positivo.map((area, index) => (
                  <li key={index} data-testid={`text-impacto-positivo-${index}`}>• {area}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Impacto Negativo:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.relacion_clima_desempeno.areas_impacto_negativo.map((area, index) => (
                  <li key={index} data-testid={`text-impacto-negativo-${index}`}>• {area}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity & ROI */}
      <Card data-testid="card-productividad">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Vinculación con Productividad y Rentabilidad
          </CardTitle>
          <CardDescription>
            {data.vinculacion_productividad.impacto_productividad}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Impacto en Rentabilidad</p>
            <p className="text-xl font-bold text-foreground mt-1" data-testid="text-impacto-rentabilidad">
              {data.vinculacion_productividad.impacto_rentabilidad_estimado}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Métricas Clave:</p>
            {data.vinculacion_productividad.metricas_clave.map((metrica, index) => (
              <div key={index} className="p-3 border border-card-border rounded-lg space-y-1" data-testid={`card-metrica-${index}`}>
                <p className="font-medium text-foreground">{metrica.metrica}</p>
                <p className="text-sm text-muted-foreground">{metrica.relacion_clima}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Recomendaciones ROI:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {data.vinculacion_productividad.recomendaciones_roi.map((recomendacion, index) => (
                <li key={index} className="flex items-start gap-2" data-testid={`text-recomendacion-roi-${index}`}>
                  <span className="text-primary mt-1">→</span>
                  <span>{recomendacion}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
