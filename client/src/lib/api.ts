import { apiRequest } from "./queryClient";

export interface ConnectionStatus {
  configured: boolean;
  connected: boolean;
  lastUpdate: string;
}

export interface ConnectionsResponse {
  microsoft365: ConnectionStatus;
  openai: ConnectionStatus;
}

export interface AnalysisProgressResponse {
  id?: string;
  status: string;
  progress: number;
  emailsProcessed: number;
  totalEmails: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface KPI {
  nombre: string;
  valor_estimado: string;
  interpretacion: string;
}

export interface OKR {
  objetivo: string;
  resultados_clave: string[];
}

export interface StrategicIndicator {
  indicador: string;
  valor: number;
  descripcion: string;
}

export interface AnalysisResultData {
  diagnostico_general: string;
  tipo_de_cultura: string;
  indicadores_estrategicos: StrategicIndicator[];
  kpis: KPI[];
  okrs: OKR[];
  fortalezas: string[];
  debilidades: string[];
  estrategias: string[];
  recomendaciones_metodologicas: string[];
  people_analytics?: {
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
  };
}

export interface AnalysisResultResponse {
  id: string;
  analysisDate: string;
  totalEmailsAnalyzed: number;
  analysisResult: AnalysisResultData;
  confidence: number;
  isActive: boolean;
  periodType?: string;
  periodValue?: number;
  departments?: string[];
  countries?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface AnalysisFilters {
  dateFrom?: string;
  dateTo?: string;
  departments?: string[];
  countries?: string[];
}

export interface UserMetadata {
  departments: string[];
  countries: string[];
}

// API functions
export const api = {
  // Configuration
  async saveConfig(data: { clientId: string; tenantId: string; clientSecret: string; openaiKey: string }): Promise<void> {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to save configuration');
    }
  },

  // Connection status
  async getConnectionStatus(): Promise<ConnectionsResponse & { 
    microsoft365: { config?: { clientId: string; tenantId: string; hasSecret: boolean } };
    openai: { config?: { hasKey: boolean } };
  }> {
    const response = await fetch('/api/connections/status');
    if (!response.ok) {
      throw new Error('Failed to fetch connection status');
    }
    return response.json();
  },

  // Analysis progress
  async getAnalysisProgress(): Promise<AnalysisProgressResponse> {
    const response = await fetch('/api/analysis/progress');
    if (!response.ok) {
      throw new Error('Failed to fetch analysis progress');
    }
    return response.json();
  },

  async startAnalysis(filters?: AnalysisFilters): Promise<{ message: string; progressId: string }> {
    const response = await fetch('/api/analysis/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) {
      throw new Error('Failed to start analysis');
    }
    return response.json();
  },

  async getUserMetadata(): Promise<UserMetadata> {
    const response = await fetch('/api/users/metadata');
    if (!response.ok) {
      throw new Error('Failed to fetch user metadata');
    }
    return response.json();
  },

  async stopAnalysis(): Promise<{ message: string }> {
    const response = await fetch('/api/analysis/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to stop analysis');
    }
    return response.json();
  },

  // Analysis results
  async getLatestResults(): Promise<AnalysisResultResponse> {
    const response = await fetch('/api/analysis/results');
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No analysis results found');
      }
      throw new Error('Failed to fetch analysis results');
    }
    return response.json();
  },

  async getResultsHistory(): Promise<AnalysisResultResponse[]> {
    const response = await fetch('/api/analysis/results/history');
    if (!response.ok) {
      throw new Error('Failed to fetch analysis results history');
    }
    return response.json();
  }
};