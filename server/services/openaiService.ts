import OpenAI from 'openai';
import { type OpenAIAnalysisResult, openAIAnalysisSchema } from '@shared/schema';

export interface EmailData {
  subject: string;
  sender: string;
  recipients: string[];
  content: string;
  sentDate: Date;
}

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    this.initializeClient();
  }

  public async initializeClient(config: Record<string, string> = {}) {
    const apiKey = config.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OpenAI API key not found. AI analysis will not be available.');
      this.client = null;
      return;
    }

    try {
      this.client = new OpenAI({ apiKey });
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  async analyzeOrganizationalClimate(emails: EmailData[]): Promise<OpenAIAnalysisResult> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please configure OPENAI_API_KEY.');
    }

    if (emails.length === 0) {
      throw new Error('No emails provided for analysis');
    }

    try {
      const emailsSummary = this.prepareEmailsForAnalysis(emails);
      const prompt = this.buildAnalysisPrompt(emailsSummary, emails.length);

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto en análisis de clima organizacional. Analiza los correos electrónicos corporativos y proporciona insights profesionales sobre la cultura, comunicación y ambiente laboral. Responde únicamente en formato JSON válido."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse and validate the JSON response
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', responseContent);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Validate against schema
      const validatedResult = openAIAnalysisSchema.parse(parsedResponse);
      return validatedResult;

    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      throw new Error(`OpenAI analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private prepareEmailsForAnalysis(emails: EmailData[]): string {
    // Sample a representative set of emails to avoid token limits
    const sampleSize = Math.min(emails.length, 100);
    const sampledEmails = emails.slice(0, sampleSize);

    return sampledEmails.map((email, index) => {
      const content = email.content?.slice(0, 300) || 'Sin contenido'; // Limit content length
      const recipients = email.recipients?.slice(0, 3).join(', ') || 'Sin destinatarios';
      
      return `Email ${index + 1}:
Asunto: ${email.subject || 'Sin asunto'}
De: ${email.sender || 'Desconocido'}
Para: ${recipients}
Fecha: ${email.sentDate?.toLocaleDateString() || 'Desconocida'}
Contenido: ${content}
---`;
    }).join('\n\n');
  }

  private buildAnalysisPrompt(emailsSummary: string, totalEmails: number): string {
    return `Analiza los siguientes ${totalEmails} correos electrónicos corporativos para evaluar el clima y cultura organizacional. 

CORREOS ELECTRÓNICOS:
${emailsSummary}

Proporciona un análisis completo en el siguiente formato JSON exacto:

{
  "diagnostico_general": "Descripción general del clima organizacional (2-3 párrafos)",
  "tipo_de_cultura": "Tipo de cultura organizacional identificada (Clan, Adhocracia, Mercado, o Jerarquía)",
  "indicadores_estrategicos": [
    {
      "indicador": "Clima Organizacional",
      "valor": 75,
      "descripcion": "Nivel general de satisfacción y ambiente laboral (0-100)"
    },
    {
      "indicador": "Liderazgo",
      "valor": 68,
      "descripcion": "Efectividad del liderazgo y dirección estratégica (0-100)"
    },
    {
      "indicador": "Comunicación",
      "valor": 82,
      "descripcion": "Claridad, frecuencia y efectividad de la comunicación (0-100)"
    },
    {
      "indicador": "Productividad",
      "valor": 70,
      "descripcion": "Nivel de productividad y eficiencia operativa (0-100)"
    },
    {
      "indicador": "Compromiso",
      "valor": 65,
      "descripcion": "Nivel de engagement y compromiso de los empleados (0-100)"
    },
    {
      "indicador": "Innovación",
      "valor": 58,
      "descripcion": "Capacidad de innovación y adaptación al cambio (0-100)"
    },
    {
      "indicador": "Colaboración",
      "valor": 78,
      "descripcion": "Trabajo en equipo y cooperación entre áreas (0-100)"
    },
    {
      "indicador": "Satisfacción",
      "valor": 72,
      "descripcion": "Satisfacción general de los empleados (0-100)"
    }
  ],
  "kpis": [
    {
      "nombre": "Nombre del KPI",
      "valor_estimado": "Valor porcentual o numérico",
      "interpretacion": "Interpretación del KPI"
    }
  ],
  "okrs": [
    {
      "objetivo": "Objetivo estratégico basado en el análisis",
      "resultados_clave": ["Resultado clave 1", "Resultado clave 2", "Resultado clave 3"]
    }
  ],
  "fortalezas": [
    "Fortaleza identificada 1",
    "Fortaleza identificada 2",
    "Fortaleza identificada 3"
  ],
  "debilidades": [
    "Debilidad identificada 1",
    "Debilidad identificada 2",
    "Debilidad identificada 3"
  ],
  "estrategias": [
    "Estrategia recomendada 1",
    "Estrategia recomendada 2",
    "Estrategia recomendada 3"
  ],
  "recomendaciones_metodologicas": [
    "Recomendación metodológica 1",
    "Recomendación metodológica 2",
    "Recomendación metodológica 3"
  ],
  "people_analytics": {
    "metricas_internas": {
      "rotacion_estimada": "Porcentaje estimado de rotación anual basado en patrones de despedida/salida detectados",
      "ausentismo_detectado": "Nivel de ausentismo detectado (Bajo/Medio/Alto) con porcentaje estimado",
      "nivel_desempeno_promedio": "Nivel de desempeño promedio detectado (Bajo/Medio/Alto/Excelente)",
      "interpretacion": "Interpretación general de las métricas internas detectadas"
    },
    "benchmarking_externo": {
      "comparacion_industria": "Comparación estimada con estándares de la industria",
      "posicionamiento": "Posicionamiento estimado (Por debajo/En línea/Por encima del promedio)",
      "gaps_identificados": [
        "Gap identificado 1",
        "Gap identificado 2",
        "Gap identificado 3"
      ]
    },
    "riesgos_fuga_talento": {
      "nivel_riesgo": "Nivel de riesgo general (Bajo/Medio/Alto/Crítico)",
      "areas_criticas": [
        "Área crítica 1",
        "Área crítica 2"
      ],
      "indicadores_alerta": [
        "Indicador de alerta 1",
        "Indicador de alerta 2",
        "Indicador de alerta 3"
      ],
      "empleados_en_riesgo_estimado": "Porcentaje o número estimado de empleados en riesgo"
    },
    "relacion_clima_desempeno": {
      "correlacion": "Tipo de correlación detectada (Positiva fuerte/Positiva moderada/Neutral/Negativa)",
      "areas_impacto_positivo": [
        "Área con impacto positivo 1",
        "Área con impacto positivo 2"
      ],
      "areas_impacto_negativo": [
        "Área con impacto negativo 1",
        "Área con impacto negativo 2"
      ],
      "insight_principal": "Insight principal sobre la relación clima-desempeño"
    },
    "vinculacion_productividad": {
      "impacto_productividad": "Descripción del impacto del clima en la productividad",
      "impacto_rentabilidad_estimado": "Impacto estimado en rentabilidad (porcentaje o descripción cualitativa)",
      "metricas_clave": [
        {
          "metrica": "Métrica de productividad 1",
          "relacion_clima": "Cómo el clima afecta esta métrica"
        },
        {
          "metrica": "Métrica de productividad 2",
          "relacion_clima": "Cómo el clima afecta esta métrica"
        }
      ],
      "recomendaciones_roi": [
        "Recomendación ROI 1",
        "Recomendación ROI 2",
        "Recomendación ROI 3"
      ]
    }
  }
}

INSTRUCCIONES ESPECÍFICAS:
- Genera exactamente 8 indicadores estratégicos con valores numéricos de 0-100 basados en el análisis real de los correos
- Los indicadores deben ser: Clima Organizacional, Liderazgo, Comunicación, Productividad, Compromiso, Innovación, Colaboración, Satisfacción
- Calcula cada valor basándote en evidencia concreta de los correos (tono, patrones, frecuencias, colaboración detectada)
- Incluye mínimo 4 KPIs relevantes (satisfacción, colaboración, comunicación, etc.) y 2 OKRs con sus resultados clave correspondientes
- En People Analytics, estima métricas basándote en patrones de comunicación, tono, frecuencia de interacciones, y señales de estrés/satisfacción
- Identifica señales de riesgo de fuga como: quejas frecuentes, falta de engagement, búsqueda de oportunidades externas mencionadas
- Correlaciona el clima detectado con indicadores de desempeño como colaboración, eficiencia en respuestas, proactividad
- Proporciona recomendaciones específicas con ROI estimado para mejorar clima y retener talento
- Base todo el análisis en patrones reales detectados en los correos`;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}