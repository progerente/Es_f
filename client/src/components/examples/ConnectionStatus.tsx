import { ConnectionStatus } from '../ConnectionStatus'

export default function ConnectionStatusExample() {
  return (
    <div className="space-y-4 p-4">
      <ConnectionStatus 
        service="Microsoft 365" 
        status="connected" 
        lastUpdate="hace 2 minutos"
      />
      <ConnectionStatus 
        service="OpenAI" 
        status="connected" 
        lastUpdate="hace 1 minuto"
      />
      <ConnectionStatus 
        service="Análisis" 
        status="warning" 
        lastUpdate="hace 5 minutos"
      />
    </div>
  )
}