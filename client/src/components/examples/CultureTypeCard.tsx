import { CultureTypeCard } from '../CultureTypeCard'

export default function CultureTypeCardExample() {
  return (
    <div className="p-4 max-w-2xl">
      <CultureTypeCard 
        type="Clan"
        description="Una cultura orientada hacia las personas, que valora la colaboración, el trabajo en equipo y el desarrollo personal. Se caracteriza por un ambiente familiar y de apoyo mutuo."
        characteristics={[
          "Alto nivel de colaboración entre equipos",
          "Comunicación abierta y transparente", 
          "Enfoque en el desarrollo del talento",
          "Toma de decisiones participativa"
        ]}
        confidence={85}
      />
    </div>
  )
}