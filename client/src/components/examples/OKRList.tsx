import { OKRList } from '../OKRList'

export default function OKRListExample() {
  const okrs = [
    {
      objetivo: "Mejorar la comunicación organizacional en un 25% durante el próximo trimestre",
      resultados_clave: [
        {
          descripcion: "Incrementar la frecuencia de comunicaciones directivas",
          progreso: 65,
          meta: "100%"
        },
        {
          descripcion: "Implementar canales de feedback bidireccional",
          progreso: 40,
          meta: "100%"
        },
        {
          descripcion: "Reducir el tiempo de respuesta promedio en emails internos",
          progreso: 75,
          meta: "< 4 horas"
        }
      ]
    },
    {
      objetivo: "Aumentar la colaboración interdepartamental",
      resultados_clave: [
        {
          descripcion: "Establecer equipos de trabajo multidisciplinarios",
          progreso: 30,
          meta: "5 equipos"
        },
        {
          descripcion: "Implementar herramientas de colaboración digital",
          progreso: 80,
          meta: "100%"
        }
      ]
    }
  ];

  return (
    <div className="p-4 max-w-4xl">
      <OKRList okrs={okrs} />
    </div>
  )
}