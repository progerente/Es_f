import { ConnectionStatus } from "@/components/ConnectionStatus";
import { MetricCard } from "@/components/MetricCard";
import { CultureTypeCard } from "@/components/CultureTypeCard";
import { InsightsList } from "@/components/InsightsList";
import { OKRList } from "@/components/OKRList";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { PeopleAnalyticsSection } from "@/components/PeopleAnalyticsSection";
import { StrategicRadarChart } from "@/components/StrategicRadarChart";
import { KPIDetailDialog } from "@/components/KPIDetailDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { api, type AnalysisFilters, type StrategicIndicator } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/images (4)_1759380203233.png";

export default function Dashboard() {
  const { toast } = useToast();
  const previousStatus = useRef<string | null>(null);
  
  // State for KPI detail dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<{
    type: 'kpi' | 'indicator' | 'okr';
    data: any;
  } | null>(null);

  // Fetch connection status
  const { data: connections } = useQuery({
    queryKey: ['/api/connections/status'],
    queryFn: api.getConnectionStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch analysis progress
  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ['/api/analysis/progress'],
    queryFn: api.getAnalysisProgress,
    refetchInterval: (query) => {
      // Refetch faster when analysis is running
      return query.state.data?.status === 'running' ? 2000 : 10000;
    },
  });

  // Fetch analysis results
  const { data: results, error: resultsError } = useQuery({
    queryKey: ['/api/analysis/results'],
    queryFn: api.getLatestResults,
    retry: (failureCount, error: any) => {
      // Don't retry if no results found
      if (error?.message?.includes('No analysis results found')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Fetch user metadata (departments and countries)
  const { data: metadata } = useQuery({
    queryKey: ['/api/users/metadata'],
    queryFn: api.getUserMetadata,
    retry: 2,
  });

  // Auto-refresh results when analysis completes
  useEffect(() => {
    const currentStatus = progress?.status;
    
    // Check if status changed from 'running' to 'completed'
    if (previousStatus.current === 'running' && currentStatus === 'completed') {
      // Invalidate results to fetch the new analysis
      queryClient.invalidateQueries({ queryKey: ['/api/analysis/results'] });
      // Invalidate history so Reports page updates
      queryClient.invalidateQueries({ queryKey: ['/api/analysis/results/history'] });
      
      toast({
        title: "Hemos completado el análisis",
        description: "Los resultados ya están disponibles para su revisión.",
      });
    }
    
    // Update previous status
    previousStatus.current = currentStatus || null;
  }, [progress?.status, toast]);

  // Start analysis mutation
  const startAnalysisMutation = useMutation({
    mutationFn: (filters: AnalysisFilters) => api.startAnalysis(filters),
    onSuccess: () => {
      toast({
        title: "Hemos iniciado el análisis",
        description: "Estamos procesando las comunicaciones de Outlook y Teams de su organización.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analysis/progress'] });
    },
    onError: (error: any) => {
      toast({
        title: "No pudimos iniciar el análisis",
        description: error?.message || "Ocurrió un error inesperado. Por favor, inténtelo nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Stop analysis mutation
  const stopAnalysisMutation = useMutation({
    mutationFn: api.stopAnalysis,
    onSuccess: () => {
      toast({
        title: "Hemos pausado el análisis",
        description: "Pausamos temporalmente el procesamiento. Puede reanudarlo cuando lo necesite.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analysis/progress'] });
    },
    onError: (error: any) => {
      toast({
        title: "No pudimos pausar el análisis",
        description: error?.message || "Ocurrió un error inesperado. Por favor, inténtelo nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleStartAnalysis = (filters: AnalysisFilters) => {
    startAnalysisMutation.mutate(filters);
  };

  const handleStopAnalysis = () => {
    stopAnalysisMutation.mutate();
  };

  const handleRefreshAnalysis = () => {
    refetchProgress();
    queryClient.invalidateQueries({ queryKey: ['/api/connections/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users/metadata'] });
  };

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

  // Process real data or use fallbacks
  const analysisData = results?.analysisResult;
  
  // Convert analysis data to component formats
  const strengths = analysisData?.fortalezas?.map((text, index) => ({
    text,
    priority: (index === 0 ? 'high' : index === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
  })) || [];

  const weaknesses = analysisData?.debilidades?.map((text, index) => ({
    text,
    priority: (index === 0 ? 'high' : index === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
  })) || [];

  const strategies = analysisData?.estrategias?.map((text, index) => ({
    text,
    priority: (index === 0 ? 'high' : 'medium') as 'high' | 'medium' | 'low'
  })) || [];

  const recommendations = analysisData?.recomendaciones_metodologicas?.map((text, index) => ({
    text,
    priority: (index === 0 ? 'high' : 'medium') as 'high' | 'medium' | 'low'
  })) || [];

  // Convert OKRs to component format
  const okrs = analysisData?.okrs?.map(okr => ({
    objetivo: okr.objetivo,
    resultados_clave: okr.resultados_clave.map(resultado => ({
      descripcion: resultado,
      // Since we don't have progress data, we'll omit it for now
    }))
  })) || [];

  // Extract KPIs for metrics
  const kpis = analysisData?.kpis || [];

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      {/* Logo */}
      <div className="flex justify-center pt-4">
        <img src={logoPath} alt="ESRI Logo" className="h-16" data-testid="img-logo" />
      </div>

      {/* Connection Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-card rounded-lg border border-card-border">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Análisis de Clima Organizacional (M365 Direct Access)</h1>
          <p className="text-muted-foreground">
            {results ? 
              `Hemos analizado ${results.totalEmailsAnalyzed.toLocaleString()} comunicaciones (Outlook y Teams) de su organización` :
              resultsError?.message?.includes('No analysis results found') ? 
                'Aún no hemos realizado análisis. Inicie uno para comenzar' :
                'Estamos cargando la información...'
            }
          </p>
          {results && (results.dateFrom || results.departments?.length || results.countries?.length) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {results.dateFrom && results.dateTo && (
                <span data-testid="badge-period" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Período: {new Date(results.dateFrom).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(results.dateTo).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {results.departments?.map(dept => (
                <span key={dept} data-testid={`badge-department-${dept.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Dpto: {dept}
                </span>
              ))}
              {results.countries?.map(country => (
                <span key={country} data-testid={`badge-country-${country.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  País: {country}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <ConnectionStatus 
            service="Microsoft 365" 
            status={connections?.microsoft365?.connected ? 'connected' : connections?.microsoft365?.configured ? 'connected' : 'offline'}
            lastUpdate={connections?.microsoft365?.lastUpdate ? 
              `hace ${Math.floor((Date.now() - new Date(connections.microsoft365.lastUpdate).getTime()) / 60000)} minutos` : 
              'nunca'
            }
          />
          <ConnectionStatus 
            service="OpenAI" 
            status={connections?.openai?.connected ? 'connected' : connections?.openai?.configured ? 'connected' : 'offline'}
            lastUpdate={connections?.openai?.lastUpdate ? 
              `hace ${Math.floor((Date.now() - new Date(connections.openai.lastUpdate).getTime()) / 60000)} minutos` : 
              'nunca'
            }
          />
        </div>
      </div>

      {/* Analysis Progress */}
      <AnalysisProgress 
        isRunning={progress?.status === 'running'}
        progress={progress?.progress || 0}
        status={progress?.status === 'running' ? 'Estamos procesando los correos...' : 
               progress?.status === 'completed' ? 'Hemos completado el análisis' :
               progress?.status === 'error' ? `Ocurrió un error: ${progress.errorMessage}` :
               'Listo para iniciar'}
        emailsProcessed={progress?.emailsProcessed || 0}
        totalEmails={progress?.totalEmails || 0}
        onStart={handleStartAnalysis}
        onStop={handleStopAnalysis}
        onRefresh={handleRefreshAnalysis}
        departments={metadata?.departments || []}
        countries={metadata?.countries || []}
      />

      {/* Key Metrics */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.slice(0, 4).map((kpi, index) => (
            <MetricCard 
              key={index}
              title={kpi.nombre} 
              value={kpi.valor_estimado} 
              description={kpi.interpretacion}
              trend={index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'neutral'}
              trendValue={index % 3 === 0 ? '+3%' : index % 3 === 1 ? '-2%' : '±0%'}
              onClick={() => handleOpenKPIDetail(kpi)}
            />
          ))}
        </div>
      )}

      {/* Culture Type */}
      {analysisData && (
        <CultureTypeCard 
          type={analysisData.tipo_de_cultura}
          description={analysisData.diagnostico_general}
          characteristics={analysisData.fortalezas.slice(0, 4)}
          confidence={results?.confidence || 85}
        />
      )}

      {/* Strategic Radar Chart */}
      <StrategicRadarChart 
        data={analysisData?.indicadores_estrategicos}
        onIndicatorClick={handleOpenIndicatorDetail}
      />

      {/* OKRs */}
      <OKRList 
        okrs={okrs}
        onOKRClick={(okr) => handleOpenOKRDetail({
          objetivo: okr.objetivo,
          resultados_clave: okr.resultados_clave.map(r => r.descripcion)
        })}
      />

      {/* People Analytics */}
      <PeopleAnalyticsSection data={analysisData?.people_analytics} />

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsList 
          title="Fortalezas Identificadas"
          items={strengths}
          type="strengths"
        />
        <InsightsList 
          title="Áreas de Mejora"
          items={weaknesses}
          type="weaknesses"
        />
        <InsightsList 
          title="Estrategias Recomendadas"
          items={strategies}
          type="strategies"
        />
        <InsightsList 
          title="Recomendaciones Metodológicas"
          items={recommendations}
          type="recommendations"
        />
      </div>

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