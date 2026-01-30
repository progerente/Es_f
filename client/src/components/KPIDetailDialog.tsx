import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageSquare, TrendingUp, Info, Database, Target } from "lucide-react";

interface KPIDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'kpi' | 'indicator' | 'okr';
  data: {
    nombre?: string;
    valor?: string | number;
    descripcion?: string;
    interpretacion?: string;
    objetivo?: string;
    resultados_clave?: string[];
  };
}

interface IndicatorDetails {
  outlook: string[];
  teams: string[];
  methodology: string[];
  criteria: string;
  impact: string[];
}

export function KPIDetailDialog({ open, onOpenChange, type, data }: KPIDetailDialogProps) {
  const getIndicatorDetails = (name: string): IndicatorDetails => {
    const normalizedName = name.toLowerCase();

    if (normalizedName.includes('liderazgo')) {
      return {
        outlook: [
          "Correos de líderes hacia sus equipos: frecuencia, claridad y tono de las directrices",
          "Tiempo de respuesta de líderes a consultas del equipo",
          "Uso de lenguaje motivacional vs. autoritario en comunicaciones oficiales",
          "Mensajes de reconocimiento y feedback proporcionados por gerentes",
          "Transparencia en la comunicación de objetivos y cambios organizacionales"
        ],
        teams: [
          "Participación de líderes en canales de equipo y respuestas a inquietudes",
          "Frecuencia de reuniones one-on-one (agendadas vía Teams)",
          "Uso de reacciones y menciones por parte de líderes para reconocer logros",
          "Moderación y guía en discusiones de equipo",
          "Disponibilidad y accesibilidad de líderes en chats grupales"
        ],
        methodology: [
          "Análisis de frecuencia de comunicación entre líderes y equipos",
          "Detección de patrones de lenguaje directivo vs. colaborativo",
          "Medición de tiempos de respuesta y disponibilidad de líderes",
          "Evaluación del tono emocional en mensajes de liderazgo (usando análisis de sentimiento)",
          "Identificación de menciones a reconocimiento, feedback y desarrollo profesional",
          "Cálculo de ratio de comunicación ascendente vs. descendente"
        ],
        criteria: "Se evalúa la efectividad del liderazgo mediante el análisis de la calidad de las comunicaciones de líderes, su accesibilidad, el tono usado y la frecuencia de retroalimentación positiva. Un liderazgo efectivo se refleja en comunicaciones claras, bidireccionales y motivadoras.",
        impact: [
          "Liderazgo efectivo aumenta el compromiso y motivación del equipo",
          "Mejora la claridad en objetivos y reduce incertidumbre organizacional",
          "Fomenta cultura de feedback y desarrollo continuo",
          "Reduce rotación de talento y aumenta retención",
          "Impacta directamente en la productividad y satisfacción del equipo"
        ]
      };
    }

    if (normalizedName.includes('comunicación') || normalizedName.includes('comunicacion')) {
      return {
        outlook: [
          "Claridad en asuntos y estructura de mensajes (uso de puntos clave vs. texto denso)",
          "Frecuencia de correos enviados y respondidos por departamento",
          "Tiempo promedio de respuesta a correos importantes",
          "Uso de CC/CCO y distribución de información entre equipos",
          "Presencia de malentendidos o aclaraciones necesarias en hilos de correo"
        ],
        teams: [
          "Frecuencia y calidad de mensajes en canales compartidos",
          "Uso de hilos para mantener conversaciones organizadas",
          "Reacciones y confirmaciones de lectura de mensajes clave",
          "Uso de @menciones para dirigir comunicación efectivamente",
          "Balance entre chats privados y comunicación en canales abiertos"
        ],
        methodology: [
          "Análisis semántico de claridad y estructura en mensajes",
          "Medición de tiempos de respuesta promedio por departamento",
          "Evaluación de completitud de información en comunicaciones",
          "Detección de patrones de malentendidos o necesidad de aclaraciones",
          "Análisis de distribución de información (silos vs. transparencia)",
          "Cálculo de ratio de comunicación bidireccional vs. unidireccional"
        ],
        criteria: "La comunicación se evalúa por su claridad, oportunidad, bidireccionalidad y efectividad para transmitir información sin generar malentendidos. Una comunicación óptima es clara, oportuna, estructurada y fomenta el diálogo.",
        impact: [
          "Comunicación efectiva reduce errores operacionales y retrabajos",
          "Mejora la alineación entre equipos y departamentos",
          "Aumenta la velocidad de toma de decisiones",
          "Reduce frustración y conflictos interpersonales",
          "Impacta la productividad y eficiencia organizacional"
        ]
      };
    }

    if (normalizedName.includes('productividad')) {
      return {
        outlook: [
          "Frecuencia de correos sobre tareas completadas vs. bloqueos o retrasos",
          "Tiempo de respuesta en comunicaciones urgentes relacionadas con entregas",
          "Menciones de cumplimiento de deadlines y logros de objetivos",
          "Correos relacionados con re-priorización o cambios de alcance",
          "Volumen de correos enviados fuera de horario laboral (indicador de sobrecarga)"
        ],
        teams: [
          "Frecuencia de actualizaciones de progreso en canales de proyecto",
          "Uso de integraciones de herramientas de gestión de tareas",
          "Discusiones sobre obstáculos y solicitudes de apoyo",
          "Mensajes relacionados con celebración de hitos y entregas",
          "Actividad en canales durante horarios productivos vs. distracciones"
        ],
        methodology: [
          "Análisis de menciones a cumplimiento de objetivos y entregas",
          "Detección de patrones de bloqueos, retrasos y re-priorizaciones",
          "Evaluación de carga de trabajo mediante volumen y horario de comunicaciones",
          "Medición de tiempo entre asignación y completitud de tareas",
          "Identificación de señales de eficiencia vs. sobrecarga de trabajo",
          "Análisis de colaboración efectiva para resolver obstáculos rápidamente"
        ],
        criteria: "La productividad se mide por la frecuencia de menciones a logros, cumplimiento de plazos, resolución eficiente de bloqueos y un balance saludable en la carga de trabajo. Una alta productividad se refleja en entregas constantes sin sobrecarga.",
        impact: [
          "Productividad óptima asegura cumplimiento de objetivos estratégicos",
          "Balance adecuado de carga previene burnout y rotación",
          "Eficiencia en ejecución mejora rentabilidad organizacional",
          "Identificación temprana de bloqueos permite intervenciones oportunas",
          "Impacta directamente en resultados de negocio y satisfacción del cliente"
        ]
      };
    }

    if (normalizedName.includes('compromiso') || normalizedName.includes('engagement')) {
      return {
        outlook: [
          "Tono emocional en correos (entusiasmo vs. desinterés o frustración)",
          "Participación proactiva en iniciativas organizacionales",
          "Voluntariedad en correos sobre proyectos adicionales o mejoras",
          "Expresiones de orgullo organizacional o identificación con la empresa",
          "Frecuencia de correos relacionados con desarrollo profesional y capacitación"
        ],
        teams: [
          "Participación activa en canales generales y de cultura organizacional",
          "Uso de reacciones positivas y celebraciones de logros del equipo",
          "Contribuciones voluntarias a discusiones y lluvia de ideas",
          "Presencia y participación en eventos y actividades de equipo",
          "Frecuencia de interacciones sociales positivas entre colegas"
        ],
        methodology: [
          "Análisis de sentimiento para detectar entusiasmo vs. apatía",
          "Medición de participación voluntaria en iniciativas no obligatorias",
          "Evaluación de identificación con valores y misión organizacional",
          "Detección de expresiones de orgullo, pertenencia y motivación",
          "Análisis de proactividad en comunicaciones y propuestas de mejora",
          "Medición de participación en actividades de desarrollo y capacitación"
        ],
        criteria: "El compromiso se evalúa mediante el análisis del tono emocional, la participación voluntaria, las expresiones de identificación organizacional y la proactividad en comunicaciones. Un alto compromiso se refleja en entusiasmo, participación y orgullo de pertenencia.",
        impact: [
          "Alto compromiso reduce rotación de talento crítico",
          "Empleados comprometidos son más productivos y creativos",
          "Mejora el clima laboral y atrae talento de calidad",
          "Aumenta la lealtad organizacional y advocacy de marca empleadora",
          "Impacta la innovación, calidad de trabajo y resultados de negocio"
        ]
      };
    }

    if (normalizedName.includes('innovación') || normalizedName.includes('innovacion')) {
      return {
        outlook: [
          "Menciones a propuestas de mejora, nuevas ideas o experimentación",
          "Correos relacionados con proyectos piloto o iniciativas de innovación",
          "Discusiones sobre nuevas tecnologías, herramientas o metodologías",
          "Apertura a cambios y adaptación vs. resistencia en comunicaciones",
          "Correos sobre lecciones aprendidas y retrospectivas de proyectos"
        ],
        teams: [
          "Lluvia de ideas y discusiones creativas en canales de innovación",
          "Compartición de artículos, recursos o tendencias del sector",
          "Propuestas espontáneas de optimización de procesos",
          "Experimentación con nuevas funcionalidades de herramientas",
          "Discusiones sobre adaptación a cambios del mercado o industria"
        ],
        methodology: [
          "Detección de palabras clave relacionadas con innovación (nuevo, mejorar, experimentar, piloto, etc.)",
          "Análisis de frecuencia de propuestas de mejora y nuevas ideas",
          "Evaluación de apertura al cambio vs. resistencia en comunicaciones",
          "Medición de participación en iniciativas de innovación",
          "Identificación de cultura de aprendizaje continuo y experimentación",
          "Análisis de adopción de nuevas herramientas y prácticas"
        ],
        criteria: "La innovación se mide por la frecuencia de propuestas creativas, apertura al cambio, experimentación y adopción de nuevas prácticas. Una cultura innovadora fomenta la creatividad, tolera el error y promueve el aprendizaje continuo.",
        impact: [
          "Innovación constante mantiene competitividad organizacional",
          "Cultura de mejora continua optimiza procesos y reduce costos",
          "Atrae y retiene talento creativo y visionario",
          "Permite adaptación ágil a cambios del mercado",
          "Impacta la diferenciación competitiva y crecimiento sostenible"
        ]
      };
    }

    if (normalizedName.includes('colaboración') || normalizedName.includes('colaboracion')) {
      return {
        outlook: [
          "Correos con múltiples destinatarios trabajando juntos en proyectos",
          "Uso de CC para mantener visibilidad y alineación entre equipos",
          "Frecuencia de coordinación inter-departamental",
          "Correos sobre compartición de recursos, conocimiento o apoyo mutuo",
          "Solicitudes de ayuda y respuestas de colegas ofreciendo asistencia"
        ],
        teams: [
          "Actividad en canales compartidos entre departamentos",
          "Uso de menciones para solicitar input o colaboración",
          "Hilos de conversación con participación de múltiples personas",
          "Compartición de archivos y co-edición de documentos",
          "Reacciones y reconocimiento a contribuciones de colegas"
        ],
        methodology: [
          "Análisis de redes de comunicación y colaboración inter-equipos",
          "Medición de frecuencia de comunicaciones colaborativas vs. aisladas",
          "Evaluación de compartición de conocimiento y recursos",
          "Detección de patrones de apoyo mutuo y mentoría",
          "Análisis de co-creación y trabajo en equipo en proyectos",
          "Medición de silos departamentales vs. colaboración transversal"
        ],
        criteria: "La colaboración se evalúa mediante el análisis de interacciones entre equipos, compartición de recursos, apoyo mutuo y trabajo conjunto en proyectos. Una alta colaboración se refleja en comunicación transversal, apoyo entre colegas y co-creación.",
        impact: [
          "Colaboración efectiva acelera resolución de problemas complejos",
          "Rompe silos organizacionales y mejora flujo de información",
          "Fomenta innovación mediante diversidad de perspectivas",
          "Mejora el clima laboral y sentido de pertenencia",
          "Impacta la agilidad organizacional y calidad de resultados"
        ]
      };
    }

    if (normalizedName.includes('satisfacción') || normalizedName.includes('satisfaccion')) {
      return {
        outlook: [
          "Tono emocional general: positivo, neutral o negativo en comunicaciones",
          "Menciones de satisfacción con proyectos, logros o ambiente laboral",
          "Expresiones de frustración, quejas o insatisfacción",
          "Correos relacionados con reconocimiento y agradecimiento",
          "Menciones de balance vida-trabajo y bienestar"
        ],
        teams: [
          "Uso de emojis positivos y reacciones de celebración",
          "Participación en canales de cultura y eventos sociales",
          "Expresiones de agradecimiento y reconocimiento entre colegas",
          "Discusiones sobre beneficios, ambiente laboral y cultura",
          "Menciones de orgullo por logros individuales o de equipo"
        ],
        methodology: [
          "Análisis de sentimiento en todas las comunicaciones (positivo, neutral, negativo)",
          "Detección de expresiones de satisfacción vs. frustración",
          "Medición de frecuencia de reconocimiento y agradecimiento",
          "Evaluación de menciones a bienestar y balance vida-trabajo",
          "Identificación de quejas recurrentes o áreas de insatisfacción",
          "Análisis de tono emocional promedio por departamento y período"
        ],
        criteria: "La satisfacción se mide mediante análisis de sentimiento, frecuencia de expresiones positivas vs. negativas, menciones de reconocimiento y bienestar. Una alta satisfacción se refleja en tono positivo, expresiones de orgullo y balance saludable.",
        impact: [
          "Alta satisfacción reduce rotación de talento y costos de reclutamiento",
          "Empleados satisfechos son más productivos y creativos",
          "Mejora la reputación como empleador y atrae talento de calidad",
          "Reduce ausentismo y mejora salud organizacional",
          "Impacta directamente en resultados de negocio y servicio al cliente"
        ]
      };
    }

    if (normalizedName.includes('clima') || normalizedName.includes('organizacional')) {
      return {
        outlook: [
          "Tono general de comunicaciones: positivo, profesional, tenso o conflictivo",
          "Frecuencia de comunicaciones formales vs. informales y cordiales",
          "Presencia de conflictos, tensiones o comunicaciones defensivas",
          "Correos relacionados con cultura, valores y ambiente laboral",
          "Balance entre comunicación orientada a tareas vs. relaciones interpersonales"
        ],
        teams: [
          "Actividad en canales sociales y de cultura organizacional",
          "Uso de lenguaje informal y cercano vs. excesivamente formal",
          "Participación en eventos virtuales y actividades de integración",
          "Expresiones de camaradería y conexión entre colegas",
          "Presencia de humor positivo y celebraciones compartidas"
        ],
        methodology: [
          "Recopilación simultánea de datos de los 7 indicadores estratégicos (Liderazgo, Comunicación, Productividad, Compromiso, Innovación, Colaboración, Satisfacción)",
          "Cálculo individual de cada indicador usando sus metodologías específicas",
          "Ponderación de indicadores según su impacto en clima laboral (ej: Satisfacción y Compromiso tienen mayor peso)",
          "Análisis de correlaciones entre indicadores (ej: baja Comunicación afecta Colaboración)",
          "Cálculo de promedio ponderado considerando interdependencias detectadas",
          "Ajuste final basado en señales críticas (conflictos, rotación, ausentismo mencionados en comunicaciones)"
        ],
        criteria: "El clima organizacional se calcula como un índice compuesto que integra los 7 indicadores estratégicos con ponderación diferencial. Se enfatiza la coherencia entre indicadores: un clima positivo requiere valores altos en la mayoría de dimensiones, no solo en algunas. Valores discordantes (ej: alta Productividad pero baja Satisfacción) reducen el puntaje final.",
        impact: [
          "Clima organizacional positivo es predictor clave de éxito empresarial",
          "Afecta directamente retención de talento, productividad e innovación",
          "Mejora la reputación organizacional y atracción de talento",
          "Reduce costos asociados a rotación, ausentismo y bajo desempeño",
          "Impacta la sostenibilidad y competitividad a largo plazo"
        ]
      };
    }

    return {
      outlook: [
        "Contenido y contexto de correos electrónicos relevantes al indicador",
        "Frecuencia y patrones de comunicación por email",
        "Tono y lenguaje utilizado en comunicaciones formales",
        "Tiempos de respuesta y distribución de información",
        "Menciones específicas relacionadas al tema analizado"
      ],
      teams: [
        "Mensajes y discusiones en canales relevantes",
        "Frecuencia de interacciones y participación",
        "Uso de reacciones, menciones y colaboración",
        "Actividad en hilos de conversación relacionados",
        "Patrones de comunicación informal y espontánea"
      ],
      methodology: [
        "Análisis de contenido mediante procesamiento de lenguaje natural",
        "Detección de patrones y tendencias en comunicaciones",
        "Evaluación de frecuencia y contexto de términos relevantes",
        "Medición de sentimiento y tono emocional",
        "Cálculo de métricas basadas en criterios predefinidos",
        "Validación de resultados con múltiples fuentes de datos"
      ],
      criteria: "Este indicador se evalúa mediante análisis de comunicaciones organizacionales usando inteligencia artificial. Se consideran múltiples factores como frecuencia, tono, contexto y patrones para generar una evaluación objetiva.",
      impact: [
        "Permite identificar áreas de fortaleza y oportunidad",
        "Facilita toma de decisiones basada en datos objetivos",
        "Proporciona visibilidad de tendencias organizacionales",
        "Ayuda a priorizar iniciativas de mejora",
        "Impacta la efectividad de estrategias de gestión del talento"
      ]
    };
  };

  const renderContent = () => {
    const indicatorName = data.nombre || '';
    const details = getIndicatorDetails(indicatorName);

    return (
      <div className="space-y-6">
        {/* Current Value */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor Actual</p>
              <p className="text-3xl font-bold text-primary">
                {data.valor !== undefined ? data.valor : 'N/A'}
                {typeof data.valor === 'number' && type !== 'okr' && '/100'}
              </p>
            </div>
            {data.interpretacion && (
              <Badge variant="secondary" className="text-xs">
                {data.interpretacion.split(' ').slice(0, 2).join(' ')}
              </Badge>
            )}
          </div>
          {data.descripcion && (
            <p className="text-sm text-muted-foreground mt-3">
              {data.descripcion}
            </p>
          )}
          {data.interpretacion && type === 'kpi' && (
            <p className="text-sm text-foreground mt-2">
              {data.interpretacion}
            </p>
          )}
        </div>

        <Separator />

        {/* Data Sources */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-base">Aspectos Analizados por Fuente</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Para calcular <strong>{indicatorName}</strong>, se analizaron los siguientes aspectos específicos de cada plataforma de comunicación:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Mail className="w-4 h-4" />
                Outlook
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {details.outlook.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 font-medium text-sm">
                <MessageSquare className="w-4 h-4" />
                Microsoft Teams
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {details.teams.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Methodology */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-base">Metodología y Criterios Objetivos</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Criterio de evaluación:</strong> {details.criteria}
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Proceso de análisis aplicado:</p>
            {details.methodology.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-foreground flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Business Impact */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-base">Impacto en la Organización</h3>
          </div>
          <div className="space-y-2 bg-primary/5 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">Por qué es importante monitorear <strong>{indicatorName}</strong>:</p>
            <ul className="space-y-2">
              {details.impact.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* OKR Key Results */}
        {type === 'okr' && data.resultados_clave && data.resultados_clave.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-base mb-3">Resultados Clave</h3>
              <div className="space-y-2">
                {data.resultados_clave.map((resultado, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-semibold text-xs flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-foreground flex-1">{resultado}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const getTitle = () => {
    if (type === 'okr') return data.objetivo || 'Objetivo Estratégico';
    return data.nombre || 'Detalle del Indicador';
  };

  const getDescription = () => {
    if (type === 'kpi') return 'Indicador Clave de Desempeño';
    if (type === 'indicator') return 'Indicador Estratégico Organizacional';
    return 'Objetivo y Resultados Clave (OKR)';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-kpi-detail">
        <DialogHeader>
          <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
