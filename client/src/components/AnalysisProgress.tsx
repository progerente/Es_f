import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Play, Pause, CalendarIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AnalysisFilters as FiltersType } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface AnalysisProgressProps {
  isRunning: boolean;
  progress: number;
  status: string;
  emailsProcessed: number;
  totalEmails: number;
  onStart: (filters: FiltersType) => void;
  onStop: () => void;
  onRefresh: () => void;
  departments: string[];
  countries: string[];
}

export function AnalysisProgress({
  isRunning,
  progress,
  status,
  emailsProcessed,
  totalEmails,
  onStart,
  onStop,
  onRefresh,
  departments,
  countries,
}: AnalysisProgressProps) {
  // Default date range: last 30 days
  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultFrom,
    to: defaultTo,
  });
  
  const [filters, setFilters] = useState<FiltersType>({
    dateFrom: defaultFrom.toISOString(),
    dateTo: defaultTo.toISOString(),
    departments: [],
    countries: [],
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setFilters({
        ...filters,
        dateFrom: range.from.toISOString(),
        dateTo: range.to.toISOString(),
      });
    }
  };

  const handleStartWithFilters = () => {
    onStart(filters);
  };

  return (
    <Card data-testid="card-analysis-progress">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Estado del Análisis</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRunning}
            data-testid="button-refresh"
            className="hover-elevate"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && (
          <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período de Análisis</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal hover-elevate"
                    data-testid="button-date-range"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to ? (
                      <>
                        {format(dateRange.from, "d 'de' MMMM 'de' yyyy", { locale: es })} -{" "}
                        {format(dateRange.to, "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </>
                    ) : (
                      <span>Seleccionar rango de fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    locale={es}
                    data-testid="calendar-date-range"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Selecciona el rango de fechas para el análisis
              </p>
            </div>

            {departments.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Departamentos</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal hover-elevate"
                      data-testid="button-departments"
                    >
                      <span className="truncate">
                        {filters.departments && filters.departments.length > 0
                          ? `${filters.departments.length} seleccionado${filters.departments.length > 1 ? 's' : ''}`
                          : 'Seleccionar departamentos'}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                      {departments.map((dept) => {
                        const safeId = `dept-${dept.toLowerCase().replace(/\s+/g, '-')}`;
                        return (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox
                              id={safeId}
                              checked={filters.departments?.includes(dept)}
                              onCheckedChange={(checked) => {
                                const current = filters.departments || [];
                                const updated = checked
                                  ? [...current, dept]
                                  : current.filter(d => d !== dept);
                                setFilters({ ...filters, departments: updated });
                              }}
                              data-testid={`checkbox-department-${dept.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <label
                              htmlFor={safeId}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {dept}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Selecciona uno o varios departamentos
                </p>
              </div>
            )}

            {countries.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Países</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal hover-elevate"
                      data-testid="button-countries"
                    >
                      <span className="truncate">
                        {filters.countries && filters.countries.length > 0
                          ? `${filters.countries.length} seleccionado${filters.countries.length > 1 ? 's' : ''}`
                          : 'Seleccionar países'}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                      {countries.map((country) => {
                        const safeId = `country-${country.toLowerCase().replace(/\s+/g, '-')}`;
                        return (
                          <div key={country} className="flex items-center space-x-2">
                            <Checkbox
                              id={safeId}
                              checked={filters.countries?.includes(country)}
                              onCheckedChange={(checked) => {
                                const current = filters.countries || [];
                                const updated = checked
                                  ? [...current, country]
                                  : current.filter(c => c !== country);
                                setFilters({ ...filters, countries: updated });
                              }}
                              data-testid={`checkbox-country-${country.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <label
                              htmlFor={safeId}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {country}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Selecciona uno o varios países
                </p>
              </div>
            )}

            <Button
              size="sm"
              onClick={handleStartWithFilters}
              data-testid="button-start"
              className="w-full hover-elevate"
            >
              <Play className="w-4 h-4" />
              Iniciar Análisis
            </Button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <span className="ml-2 font-medium">{status}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Comunicaciones:</span>
                <span className="ml-2 font-medium">{emailsProcessed} / {totalEmails}</span>
              </div>
            </div>

            <Button
              variant="outline" 
              size="sm"
              onClick={onStop}
              data-testid="button-stop"
              className="w-full hover-elevate"
            >
              <Pause className="w-4 h-4" />
              Pausar Análisis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}