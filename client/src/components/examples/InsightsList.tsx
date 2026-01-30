import { InsightsList } from '../InsightsList'

export default function InsightsListExample() {
  const strengths = [
    { text: "Excelente comunicación horizontal entre departamentos", priority: 'high' as const },
    { text: "Alto nivel de engagement en proyectos colaborativos", priority: 'medium' as const },
    { text: "Cultura de feedback constructivo bien establecida", priority: 'medium' as const }
  ];

  const weaknesses = [
    { text: "Comunicación vertical limitada entre niveles jerárquicos", priority: 'high' as const },
    { text: "Procesos de toma de decisiones lentos", priority: 'medium' as const },
    { text: "Falta de claridad en objetivos a largo plazo", priority: 'low' as const }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
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
    </div>
  )
}