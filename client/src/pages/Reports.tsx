import { useQuery } from "@tanstack/react-query";
import { api, type AnalysisResultResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, FileText, Calendar, TrendingUp, TrendingDown, Minus, Building2, Globe, X, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function Reports() {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  
  // Filters state
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  
  // Fetch all analysis results
  const { data: allResults, isLoading } = useQuery({
    queryKey: ['/api/analysis/results/history'],
    queryFn: api.getResultsHistory,
  });

  // Extract unique departments and countries from all reports
  const availableMetadata = useMemo(() => {
    if (!allResults) return { departments: [], countries: [] };
    
    const depts = new Set<string>();
    const countries = new Set<string>();
    
    allResults.forEach((report: AnalysisResultResponse) => {
      report.departments?.forEach((d: string) => depts.add(d));
      report.countries?.forEach((c: string) => countries.add(c));
    });
    
    return {
      departments: Array.from(depts).sort(),
      countries: Array.from(countries).sort(),
    };
  }, [allResults]);

  // Filter reports based on selected filters
  const filteredReports = useMemo(() => {
    if (!allResults) return [];
    
    return allResults.filter((report: AnalysisResultResponse) => {
      // Filter by date range
      if (dateFrom && new Date(report.analysisDate) < dateFrom) {
        return false;
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (new Date(report.analysisDate) > endOfDay) {
          return false;
        }
      }
      
      // Filter by departments (report must include at least one selected department)
      if (selectedDepartments.length > 0) {
        const reportDepts = report.departments || [];
        const hasMatchingDept = selectedDepartments.some(dept => 
          reportDepts.includes(dept)
        );
        if (!hasMatchingDept) return false;
      }
      
      // Filter by countries (report must include at least one selected country)
      if (selectedCountries.length > 0) {
        const reportCountries = report.countries || [];
        const hasMatchingCountry = selectedCountries.some(country => 
          reportCountries.includes(country)
        );
        if (!hasMatchingCountry) return false;
      }
      
      return true;
    });
  }, [allResults, dateFrom, dateTo, selectedDepartments, selectedCountries]);

  // Show filtered reports
  const reports = filteredReports;
  
  // Check if any filters are active
  const hasActiveFilters = dateFrom || dateTo || selectedDepartments.length > 0 || selectedCountries.length > 0;
  
  // Clear all filters
  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedDepartments([]);
    setSelectedCountries([]);
  };

  // Toggle report selection for comparison
  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else if (prev.length < 2) {
        return [...prev, reportId];
      } else {
        // Replace the first selected with the new one
        return [prev[1], reportId];
      }
    });
  };

  // Show empty state if no reports exist at all (not filtered)
  if (!isLoading && allResults && allResults.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="page-reports-empty">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Aún no tenemos reportes</CardTitle>
            <CardDescription>
              Inicie su primer análisis desde el panel principal para comenzar a generar reportes
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
          <p className="text-muted-foreground">Estamos cargando los reportes...</p>
        </div>
      </div>
    );
  }

  // Get selected reports data
  const selectedReportsData = reports.filter((r: AnalysisResultResponse) => selectedReports.includes(r.id));
  const canCompare = selectedReports.length === 2;

  return (
    <div className="space-y-6 pb-8" data-testid="page-reports">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Historial de Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Hemos realizado {reports.length} {reports.length === 1 ? 'análisis' : 'análisis'} hasta ahora
          </p>
        </div>
        {canCompare && (
          <Badge variant="default" className="text-sm gap-2" data-testid="badge-comparison-ready">
            <TrendingUp className="w-4 h-4" />
            Listos para comparar
          </Badge>
        )}
      </div>

      {reports.length >= 2 && !hasActiveFilters && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground">
              <strong>Sugerencia:</strong> Seleccione dos reportes para comparar sus indicadores y resultados clave
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Filtrar Reportes</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label>Fecha desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                    data-testid="button-date-from"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Fecha hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                    data-testid="button-date-to"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    locale={es}
                    disabled={(date) => dateFrom ? date < dateFrom : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Departments Filter */}
            <div className="space-y-2">
              <Label>Departamentos</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-departments"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {selectedDepartments.length > 0
                      ? `${selectedDepartments.length} seleccionado${selectedDepartments.length > 1 ? 's' : ''}`
                      : "Todos"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar departamento..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron departamentos</CommandEmpty>
                      <CommandGroup>
                        {availableMetadata.departments.map((dept) => (
                          <CommandItem
                            key={dept}
                            onSelect={() => {
                              setSelectedDepartments(prev =>
                                prev.includes(dept)
                                  ? prev.filter(d => d !== dept)
                                  : [...prev, dept]
                              );
                            }}
                            data-testid={`option-dept-${dept.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedDepartments.includes(dept) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {dept}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Countries Filter */}
            <div className="space-y-2">
              <Label>Países</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-countries"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {selectedCountries.length > 0
                      ? `${selectedCountries.length} seleccionado${selectedCountries.length > 1 ? 's' : ''}`
                      : "Todos"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar país..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron países</CommandEmpty>
                      <CommandGroup>
                        {availableMetadata.countries.map((country) => (
                          <CommandItem
                            key={country}
                            onSelect={() => {
                              setSelectedCountries(prev =>
                                prev.includes(country)
                                  ? prev.filter(c => c !== country)
                                  : [...prev, country]
                              );
                            }}
                            data-testid={`option-country-${country.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCountries.includes(country) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Filtros activos:</p>
              <div className="flex flex-wrap gap-2">
                {dateFrom && (
                  <Badge variant="secondary" className="gap-1">
                    Desde: {format(dateFrom, "d MMM yyyy", { locale: es })}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setDateFrom(undefined)}
                    />
                  </Badge>
                )}
                {dateTo && (
                  <Badge variant="secondary" className="gap-1">
                    Hasta: {format(dateTo, "d MMM yyyy", { locale: es })}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setDateTo(undefined)}
                    />
                  </Badge>
                )}
                {selectedDepartments.map(dept => (
                  <Badge key={dept} variant="secondary" className="gap-1">
                    <Building2 className="w-3 h-3" />
                    {dept}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedDepartments(prev => prev.filter(d => d !== dept))}
                    />
                  </Badge>
                ))}
                {selectedCountries.map(country => (
                  <Badge key={country} variant="secondary" className="gap-1">
                    <Globe className="w-3 h-3" />
                    {country}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => setSelectedCountries(prev => prev.filter(c => c !== country))}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando <strong className="text-foreground">{reports.length}</strong> de <strong className="text-foreground">{allResults?.length || 0}</strong> reportes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* No results after filtering */}
      {hasActiveFilters && reports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron reportes</h3>
            <p className="text-muted-foreground mb-4">
              No hay reportes que coincidan con los filtros seleccionados
            </p>
            <Button onClick={clearFilters} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report: AnalysisResultResponse, index: number) => {
          const isSelected = selectedReports.includes(report.id);
          const analysisData = report.analysisResult;
          
          return (
            <Card 
              key={report.id} 
              className={`transition-all ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}
              data-testid={`card-report-${index}`}
            >
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">
                        Reporte #{reports.length - index}
                      </CardTitle>
                      {index === 0 && (
                        <Badge variant="default" data-testid="badge-latest">Más reciente</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5" data-testid={`text-date-${index}`}>
                        <Calendar className="w-4 h-4" />
                        {new Date(report.analysisDate).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        {report.totalEmailsAnalyzed.toLocaleString()} comunicaciones
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleReportSelection(report.id)}
                    data-testid={`button-select-report-${index}`}
                  >
                    {isSelected ? 'Seleccionado' : 'Seleccionar para comparar'}
                  </Button>
                </div>
                
                {/* Applied filters */}
                {(report.departments?.length || report.countries?.length || report.dateFrom) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Filtros aplicados:</p>
                    <div className="flex flex-wrap gap-2">
                      {report.dateFrom && report.dateTo && (
                        <Badge variant="outline" className="gap-1.5 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.dateFrom).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(report.dateTo).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </Badge>
                      )}
                      {report.departments?.map((dept: string) => (
                        <Badge key={dept} variant="outline" className="gap-1.5 text-xs">
                          <Building2 className="w-3 h-3" />
                          {dept}
                        </Badge>
                      ))}
                      {report.countries?.map((country: string) => (
                        <Badge key={country} variant="outline" className="gap-1.5 text-xs">
                          <Globe className="w-3 h-3" />
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Culture Type */}
                {analysisData?.tipo_de_cultura && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tipo de cultura:</p>
                    <Badge variant="secondary" className="text-sm" data-testid={`badge-culture-${index}`}>
                      {analysisData.tipo_de_cultura}
                    </Badge>
                  </div>
                )}

                {/* Key Indicators Summary */}
                {analysisData?.indicadores_estrategicos && analysisData.indicadores_estrategicos.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Indicadores estratégicos:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {analysisData.indicadores_estrategicos.slice(0, 4).map((ind: any, indIndex: number) => (
                        <div key={indIndex} className="text-center p-3 rounded-lg bg-muted/50" data-testid={`indicator-${index}-${indIndex}`}>
                          <p className="text-2xl font-bold text-primary">{ind.valor}</p>
                          <p className="text-xs text-muted-foreground mt-1">{ind.indicador}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <Separator />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Fortalezas</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400" data-testid={`stat-strengths-${index}`}>
                      {analysisData?.fortalezas?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mejoras</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400" data-testid={`stat-weaknesses-${index}`}>
                      {analysisData?.debilidades?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estrategias</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid={`stat-strategies-${index}`}>
                      {analysisData?.estrategias?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Comparison Section */}
      {canCompare && (
        <Card className="border-2 border-primary" data-testid="card-comparison">
          <CardHeader>
            <CardTitle className="text-2xl">Comparación de Reportes</CardTitle>
            <CardDescription>
              Presentamos una comparación detallada entre los dos análisis seleccionados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Analysis Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalysisSummaryCard report={selectedReportsData[0]} label="Análisis 1" />
              <AnalysisSummaryCard report={selectedReportsData[1]} label="Análisis 2" />
            </div>

            <Separator />

            {/* Strategic Indicators Comparison */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Indicadores Estratégicos</h3>
              <ComparisonTable 
                report1={selectedReportsData[0]} 
                report2={selectedReportsData[1]}
                type="indicators"
              />
            </div>

            <Separator />

            {/* KPIs Comparison */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resultados Clave de Desempeño</h3>
              <ComparisonTable 
                report1={selectedReportsData[0]} 
                report2={selectedReportsData[1]}
                type="kpis"
              />
            </div>

            <Separator />

            {/* Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resumen de Cambios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComparisonStat
                  label="Fortalezas"
                  value1={selectedReportsData[0]?.analysisResult?.fortalezas?.length || 0}
                  value2={selectedReportsData[1]?.analysisResult?.fortalezas?.length || 0}
                  date1={selectedReportsData[0]?.analysisDate}
                  date2={selectedReportsData[1]?.analysisDate}
                />
                <ComparisonStat
                  label="Áreas de Mejora"
                  value1={selectedReportsData[0]?.analysisResult?.debilidades?.length || 0}
                  value2={selectedReportsData[1]?.analysisResult?.debilidades?.length || 0}
                  date1={selectedReportsData[0]?.analysisDate}
                  date2={selectedReportsData[1]?.analysisDate}
                  inverse
                />
                <ComparisonStat
                  label="Estrategias"
                  value1={selectedReportsData[0]?.analysisResult?.estrategias?.length || 0}
                  value2={selectedReportsData[1]?.analysisResult?.estrategias?.length || 0}
                  date1={selectedReportsData[0]?.analysisDate}
                  date2={selectedReportsData[1]?.analysisDate}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to format report labels based on filters
function getReportLabel(report: AnalysisResultResponse, maxItems: number = 2): string {
  const parts: string[] = [];
  
  // Add departments
  if (report.departments && report.departments.length > 0) {
    if (report.departments.length <= maxItems) {
      parts.push(report.departments.join(', '));
    } else {
      parts.push(`${report.departments.slice(0, maxItems).join(', ')} +${report.departments.length - maxItems}`);
    }
  }
  
  // Add countries if no departments
  if (parts.length === 0 && report.countries && report.countries.length > 0) {
    if (report.countries.length <= maxItems) {
      parts.push(report.countries.join(', '));
    } else {
      parts.push(`${report.countries.slice(0, maxItems).join(', ')} +${report.countries.length - maxItems}`);
    }
  }
  
  // Fallback to "Global" if no filters
  return parts.length > 0 ? parts.join(' • ') : 'Análisis Global';
}

// Comparison Table Component
function ComparisonTable({ 
  report1, 
  report2, 
  type 
}: { 
  report1: AnalysisResultResponse; 
  report2: AnalysisResultResponse; 
  type: 'indicators' | 'kpis' 
}) {
  const getData = (report: AnalysisResultResponse) => {
    if (type === 'indicators') {
      return report.analysisResult.indicadores_estrategicos || [];
    } else {
      return report.analysisResult.kpis?.slice(0, 5) || [];
    }
  };

  const data1 = getData(report1);
  const data2 = getData(report2);
  
  // Get labels based on filters
  const label1 = getReportLabel(report1);
  const label2 = getReportLabel(report2);

  // For KPIs, we'll just compare the first 5
  if (type === 'kpis') {
    const kpis1 = data1 as any[];
    const kpis2 = data2 as any[];
    return (
      <div className="space-y-3">
        {kpis1.map((kpi1, index: number) => {
          const kpi2 = kpis2[index];
          return (
            <div key={index} className="grid grid-cols-3 gap-4 p-3 rounded-lg border" data-testid={`comparison-kpi-${index}`}>
              <div className="col-span-3 md:col-span-1 font-medium text-sm">{kpi1.nombre}</div>
              <div className="text-sm">
                <p className="text-muted-foreground text-xs mb-1 truncate" title={label1}>{label1}</p>
                <p className="font-semibold">{kpi1.valor_estimado}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground text-xs mb-1 truncate" title={label2}>{label2}</p>
                <p className="font-semibold">{kpi2?.valor_estimado || 'N/A'}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // For indicators, compare values
  const indicators1 = data1 as any[];
  const indicators2 = data2 as any[];
  return (
    <div className="space-y-3">
      {indicators1.map((ind1, index: number) => {
        const ind2 = indicators2.find((i: any) => i.indicador === ind1.indicador);
        const diff = ind2 ? ind2.valor - ind1.valor : 0;
        
        return (
          <div key={index} className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg border" data-testid={`comparison-indicator-${index}`}>
            <div className="col-span-4 md:col-span-1 font-medium text-sm">{ind1.indicador}</div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1 truncate px-2" title={label1}>{label1}</p>
              <p className="text-lg font-bold">{ind1.valor}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1 truncate px-2" title={label2}>{label2}</p>
              <p className="text-lg font-bold">{ind2?.valor || 'N/A'}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Diferencia</p>
              {ind2 && (
                <div className="flex items-center justify-center gap-1">
                  {diff > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : diff < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Analysis Summary Card Component
function AnalysisSummaryCard({ 
  report, 
  label 
}: { 
  report: AnalysisResultResponse; 
  label: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-muted/30" data-testid={`analysis-summary-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <h4 className="font-semibold text-sm mb-3">{label}</h4>
      
      <div className="space-y-3">
        {/* Date and Email Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(report.analysisDate).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short',
              year: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            <span>{report.totalEmailsAnalyzed} comunicaciones</span>
          </div>
        </div>

        {/* Departments */}
        {report.departments && report.departments.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Departamentos:</p>
            <div className="flex flex-wrap gap-1.5">
              {report.departments.slice(0, 3).map((dept: string) => (
                <Badge key={dept} variant="secondary" className="text-xs gap-1">
                  <Building2 className="w-3 h-3" />
                  {dept}
                </Badge>
              ))}
              {report.departments.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{report.departments.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Countries */}
        {report.countries && report.countries.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Países:</p>
            <div className="flex flex-wrap gap-1.5">
              {report.countries.slice(0, 3).map((country: string) => (
                <Badge key={country} variant="secondary" className="text-xs gap-1">
                  <Globe className="w-3 h-3" />
                  {country}
                </Badge>
              ))}
              {report.countries.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{report.countries.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Date Range */}
        {report.dateFrom && report.dateTo && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Período analizado:</p>
            <Badge variant="outline" className="text-xs gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(report.dateFrom).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(report.dateTo).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </Badge>
          </div>
        )}

        {/* Global Analysis indicator */}
        {(!report.departments || report.departments.length === 0) && 
         (!report.countries || report.countries.length === 0) && (
          <div>
            <Badge variant="default" className="text-xs">
              Análisis Global
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// Comparison Stat Component
function ComparisonStat({ 
  label, 
  value1, 
  value2, 
  date1, 
  date2,
  inverse = false 
}: { 
  label: string; 
  value1: number; 
  value2: number; 
  date1: string;
  date2: string;
  inverse?: boolean;
}) {
  const diff = value2 - value1;
  const isPositive = inverse ? diff < 0 : diff > 0;
  const isNegative = inverse ? diff > 0 : diff < 0;
  
  return (
    <div className="p-4 rounded-lg border bg-card" data-testid={`comparison-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="text-sm text-muted-foreground mb-3">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {new Date(date1).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-2xl font-bold">{value1}</p>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {diff !== 0 && (
            <>
              {isPositive && <TrendingUp className="w-5 h-5 text-green-600" />}
              {isNegative && <TrendingDown className="w-5 h-5 text-red-600" />}
              {!isPositive && !isNegative && <Minus className="w-5 h-5 text-muted-foreground" />}
              <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'}`}>
                {diff > 0 ? '+' : ''}{diff}
              </span>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            {new Date(date2).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-2xl font-bold">{value2}</p>
        </div>
      </div>
    </div>
  );
}
