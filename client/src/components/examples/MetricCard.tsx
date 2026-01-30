import { MetricCard } from '../MetricCard'

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      <MetricCard 
        title="Satisfacción General" 
        value="78%" 
        description="Nivel de satisfacción promedio"
        trend="up"
        trendValue="+5%"
      />
      <MetricCard 
        title="Colaboración" 
        value="85%" 
        description="Índice de colaboración activa"
        trend="up"
        trendValue="+3%"
      />
      <MetricCard 
        title="Comunicación" 
        value="72%" 
        description="Efectividad comunicacional"
        trend="down"
        trendValue="-2%"
      />
      <MetricCard 
        title="Estrés Laboral" 
        value="42%" 
        description="Nivel de estrés percibido"
        trend="neutral"
        trendValue="±0%"
      />
    </div>
  )
}