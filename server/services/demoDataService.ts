import { storage } from '../storage.js';

interface DemoFilters {
  departments?: string[];
  countries?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export class DemoDataService {
  private departments = ['IT', 'Ventas', 'RRHH', 'Mercadeo', 'Finanzas', 'Contabilidad'];
  private countries = ['Colombia', 'Panama', 'Ecuador'];

  private normalizeCountryName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  getDemoMetadata() {
    return {
      departments: this.departments,
      countries: this.countries
    };
  }

  private hashFilters(filters: DemoFilters, timestamp?: number): number {
    let hash = 0;
    const str = JSON.stringify({
      departments: filters.departments?.sort() || [],
      countries: filters.countries?.sort() || [],
      dateFrom: filters.dateFrom?.toISOString().slice(0, 10) || '',
      dateTo: filters.dateTo?.toISOString().slice(0, 10) || '',
      ts: timestamp || 0
    });
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number, min: number, max: number): number {
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(random * (max - min + 1)) + min;
  }

  generateDemoAnalysis(filters: DemoFilters, timestamp?: number) {
    const seed = this.hashFilters(filters, timestamp);
    const baseScore = this.seededRandom(seed, 65, 82);
    
    const deptCount = filters.departments?.length || this.departments.length;
    const countryCount = filters.countries?.length || this.countries.length;
    
    const deptModifier = deptCount === 1 ? this.seededRandom(seed + 1, -8, 12) : 0;
    const countryModifier = countryCount === 1 ? this.seededRandom(seed + 2, -5, 10) : 0;
    
    const dateFrom = filters.dateFrom || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const dateTo = filters.dateTo || new Date();
    const daysDiff = Math.floor((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    const periodModifier = daysDiff > 365 ? this.seededRandom(seed + 3, -5, 5) : 0;

    const clamp = (val: number) => Math.max(0, Math.min(100, val));

    const selectedDepts = filters.departments?.length ? filters.departments : this.departments;
    const selectedCountries = filters.countries?.length ? filters.countries : this.countries;

    const contextLabel = this.getContextLabel(selectedDepts, selectedCountries);

    return {
      diagnostico_general: this.generateDiagnostico(baseScore + deptModifier, selectedDepts, selectedCountries),
      tipo_de_cultura: this.getCultureType(baseScore + deptModifier),
      indicadores_estrategicos: [
        { indicador: "Clima Organizacional", valor: clamp(baseScore + deptModifier + countryModifier + 3), descripcion: `Ambiente laboral general ${contextLabel}. Se percibe un entorno de trabajo positivo con oportunidades de mejora en integración de equipos.` },
        { indicador: "Liderazgo", valor: clamp(baseScore + this.seededRandom(seed + 10, -5, 10) + deptModifier + 5), descripcion: `Efectividad del liderazgo ${contextLabel}. Los líderes demuestran compromiso con el desarrollo de sus equipos.` },
        { indicador: "Comunicación", valor: clamp(baseScore + this.seededRandom(seed + 11, -8, 8) + countryModifier + 2), descripcion: `Calidad de comunicación interna ${contextLabel}. Flujo de información efectivo entre áreas con oportunidades en comunicación vertical.` },
        { indicador: "Productividad", valor: clamp(baseScore + this.seededRandom(seed + 12, -3, 12) + periodModifier + 4), descripcion: `Nivel de productividad ${contextLabel}. Los equipos mantienen buenos niveles de entrega y cumplimiento de objetivos.` },
        { indicador: "Compromiso", valor: clamp(baseScore + this.seededRandom(seed + 13, -10, 8) + 1), descripcion: `Engagement de colaboradores ${contextLabel}. Alto nivel de identificación con la organización y sus valores.` },
        { indicador: "Innovación", valor: clamp(baseScore + this.seededRandom(seed + 14, -12, 6) + deptModifier - 2), descripcion: `Capacidad de innovación ${contextLabel}. Se fomenta la creatividad aunque hay espacio para más iniciativas disruptivas.` },
        { indicador: "Colaboración", valor: clamp(baseScore + this.seededRandom(seed + 15, -6, 10) + 3), descripcion: `Trabajo en equipo ${contextLabel}. Excelente sinergia entre departamentos y disposición para proyectos conjuntos.` },
        { indicador: "Satisfacción", valor: clamp(baseScore + this.seededRandom(seed + 16, -8, 9) + countryModifier + 2), descripcion: `Satisfacción laboral ${contextLabel}. Los colaboradores expresan conformidad con condiciones laborales y beneficios.` }
      ],
      kpis: this.generateKPIs(seed, baseScore, selectedDepts, selectedCountries),
      okrs: this.generateOKRs(seed, baseScore, selectedDepts),
      fortalezas: this.generateFortalezas(seed, baseScore, selectedDepts, selectedCountries),
      debilidades: this.generateDebilidades(seed, baseScore, selectedDepts, selectedCountries),
      estrategias: this.generateEstrategias(seed, selectedDepts),
      recomendaciones_metodologicas: this.generateRecomendaciones(seed, selectedDepts),
      people_analytics: this.generatePeopleAnalytics(seed, baseScore, selectedDepts, selectedCountries)
    };
  }

  private getContextLabel(depts: string[], countries: string[]): string {
    const deptLabel = depts.length === 1 ? `en ${depts[0]}` : depts.length <= 2 ? `en ${depts.join(' y ')}` : '';
    const countryLabel = countries.length === 1 ? `(${countries[0]})` : countries.length <= 2 ? `(${countries.join(' y ')})` : '';
    return [deptLabel, countryLabel].filter(Boolean).join(' ');
  }

  private generateDiagnostico(score: number, depts: string[], countries: string[]): string {
    const level = score >= 75 ? 'positivo y saludable' : score >= 65 ? 'moderadamente positivo' : 'con oportunidades de mejora significativas';
    const deptContext = depts.length <= 2 ? `En las áreas de ${depts.join(' y ')}, ` : '';
    const countryContext = countries.length <= 2 ? `para las operaciones en ${countries.join(' y ')} ` : '';
    
    return `${deptContext}El análisis exhaustivo de las comunicaciones organizacionales ${countryContext}revela un clima laboral ${level}. Se analizaron más de 15,000 comunicaciones incluyendo correos electrónicos y mensajes de Microsoft Teams durante el período seleccionado. Los patrones de comunicación identificados reflejan ${score >= 70 ? 'una cultura colaborativa sólida con buenos niveles de engagement y compromiso organizacional' : 'áreas de oportunidad para fortalecer la cohesión del equipo y mejorar la comunicación interdepartamental'}. Los 8 indicadores estratégicos muestran ${score >= 68 ? 'tendencias favorables en liderazgo, productividad y satisfacción laboral' : 'necesidad de intervención focalizada en comunicación y desarrollo de liderazgo'}. Se recomienda ${score >= 70 ? 'mantener las prácticas actuales, potenciar las fortalezas identificadas y continuar monitoreando los indicadores clave' : 'implementar las estrategias sugeridas para mejorar el ambiente laboral y fortalecer la cultura organizacional'}.`;
  }

  private getCultureType(score: number): string {
    if (score >= 80) return 'Cultura de Alto Rendimiento';
    if (score >= 72) return 'Cultura Colaborativa';
    if (score >= 65) return 'Cultura en Desarrollo Positivo';
    return 'Cultura en Transición';
  }

  private generateKPIs(seed: number, baseScore: number, depts: string[], countries: string[]) {
    const context = this.getContextLabel(depts, countries);
    return [
      {
        nombre: "Índice de Satisfacción Laboral",
        valor_estimado: `${this.seededRandom(seed + 20, baseScore - 5, baseScore + 8)}%`,
        interpretacion: `Nivel ${baseScore >= 70 ? 'satisfactorio' : 'moderado'} de satisfacción entre colaboradores ${context}. ${baseScore >= 70 ? 'Los equipos muestran engagement positivo y orgullo organizacional.' : 'Se detectan áreas de mejora en beneficios y desarrollo profesional.'}`
      },
      {
        nombre: "Tasa de Colaboración Inter-equipos",
        valor_estimado: `${this.seededRandom(seed + 21, 55, 82)}%`,
        interpretacion: `Frecuencia de comunicación y proyectos conjuntos entre ${depts.join(' y ')} ${countries.length <= 2 ? `en ${countries.join(' y ')}` : ''}. Se observa colaboración activa en iniciativas estratégicas compartidas.`
      },
      {
        nombre: "Índice de Comunicación Efectiva",
        valor_estimado: `${this.seededRandom(seed + 22, baseScore - 8, baseScore + 5)}%`,
        interpretacion: `Calidad y claridad en las comunicaciones ${context}. ${baseScore >= 68 ? 'Los mensajes son claros, oportunos y bien estructurados.' : 'Oportunidad para mejorar la claridad y frecuencia de comunicaciones clave.'}`
      },
      {
        nombre: "Nivel de Engagement Digital",
        valor_estimado: `${this.seededRandom(seed + 23, 60, 88)}%`,
        interpretacion: `Participación activa en plataformas de comunicación (Outlook + Teams) ${context}. Los colaboradores utilizan efectivamente las herramientas digitales disponibles para coordinación.`
      },
      {
        nombre: "Índice de Respuesta Oportuna",
        valor_estimado: `${this.seededRandom(seed + 24, 2, 6)} horas promedio`,
        interpretacion: `Tiempo promedio de respuesta a comunicaciones importantes ${context}. ${this.seededRandom(seed + 24, 2, 6) <= 4 ? 'Excelente capacidad de respuesta que facilita la toma de decisiones.' : 'Oportunidad de mejorar tiempos de respuesta en comunicaciones críticas.'}`
      }
    ];
  }

  private generateOKRs(seed: number, baseScore: number, depts: string[]) {
    const deptContext = depts.length <= 2 ? ` en ${depts.join(' y ')}` : '';
    return [
      {
        objetivo: `Fortalecer la cultura de comunicación abierta y transparente${deptContext}`,
        resultados_clave: [
          "Incrementar la frecuencia de comunicación bidireccional en un 25% para el próximo trimestre",
          "Reducir el tiempo de respuesta promedio a comunicaciones críticas a menos de 4 horas",
          "Aumentar la participación activa en canales de Teams en un 30%",
          "Implementar 2 nuevos espacios de retroalimentación mensual"
        ]
      },
      {
        objetivo: `Mejorar el engagement y compromiso del equipo${deptContext}`,
        resultados_clave: [
          "Alcanzar un índice de satisfacción laboral superior al 80% en la próxima medición",
          "Reducir las señales de riesgo de rotación en un 25% mediante intervenciones focalizadas",
          "Incrementar menciones positivas y reconocimientos en comunicaciones en un 20%",
          "Lograr 90% de participación en iniciativas de bienestar organizacional"
        ]
      },
      {
        objetivo: `Potenciar la colaboración entre ${depts.join(' y ')} y otras áreas`,
        resultados_clave: [
          "Aumentar proyectos colaborativos interdepartamentales en un 40%",
          "Mejorar la puntuación de comunicación inter-áreas a 85 puntos o más",
          "Establecer 3 nuevos canales de comunicación transversal para proyectos estratégicos",
          "Reducir tiempos de coordinación en proyectos conjuntos en un 20%"
        ]
      },
      {
        objetivo: "Desarrollar capacidades de liderazgo y gestión de equipos",
        resultados_clave: [
          "Capacitar al 100% de líderes en comunicación efectiva y feedback constructivo",
          "Implementar programa de mentoría con participación del 60% de colaboradores",
          "Aumentar índice de confianza en liderazgo en 15 puntos",
          "Establecer reuniones 1:1 mensuales entre líderes y sus equipos"
        ]
      }
    ];
  }

  private generateFortalezas(seed: number, score: number, depts: string[], countries: string[]) {
    const context = this.getContextLabel(depts, countries);
    const fortalezas = [
      `Alta frecuencia de comunicación colaborativa entre ${depts.join(' y ')} ${context}`,
      `Liderazgo visible y accesible que mantiene comunicación constante con los equipos`,
      `Uso efectivo y consistente de herramientas digitales (Outlook y Teams) para coordinación diaria`,
      `Respuestas oportunas y profesionales entre miembros del equipo ${context}`,
      `Tono profesional, respetuoso e inclusivo en todas las interacciones escritas`,
      `Cultura establecida de reconocimiento entre colegas que fortalece el engagement`,
      `Comunicación clara y efectiva de objetivos, expectativas y cambios organizacionales`,
      `Buena práctica de documentación y seguimiento de acuerdos en reuniones`,
      `Alto nivel de participación en canales grupales y foros de discusión`,
      `Disposición positiva para colaborar en proyectos interdepartamentales`
    ];
    const count = this.seededRandom(seed + 30, 5, 7);
    return this.shuffleWithSeed(fortalezas, seed + 31).slice(0, count);
  }

  private generateDebilidades(seed: number, score: number, depts: string[], countries: string[]) {
    const context = this.getContextLabel(depts, countries);
    const debilidades = [
      `Comunicación ocasionalmente unidireccional en algunas áreas ${context}`,
      `Oportunidad de mejorar la frecuencia de feedback constructivo entre equipos`,
      `Tiempos de respuesta variables en comunicaciones que requieren urgencia`,
      `Algunos silos de información entre departamentos que limitan la visibilidad`,
      `Necesidad de mayor comunicación proactiva sobre logros y reconocimientos`,
      `Participación limitada en canales dedicados a innovación y mejora continua`,
      `Comunicación de cambios organizacionales puede ser más anticipada y detallada`,
      `Falta de espacios regulares para retroalimentación ascendente`
    ];
    const count = this.seededRandom(seed + 40, 4, 5);
    return this.shuffleWithSeed(debilidades, seed + 41).slice(0, count);
  }

  private generateEstrategias(seed: number, depts: string[]) {
    const deptContext = depts.length <= 2 ? ` para ${depts.join(' y ')}` : '';
    const estrategias = [
      `Implementar programa estructurado de comunicación bidireccional${deptContext} con sesiones mensuales de retroalimentación`,
      `Establecer reuniones periódicas de retroalimentación entre líderes y equipos con agenda estandarizada`,
      `Crear canales temáticos en Teams para fomentar innovación, mejores prácticas y aprendizaje compartido`,
      `Desarrollar programa formal de reconocimiento público de logros individuales y de equipo`,
      `Implementar encuestas pulse trimestrales para monitorear clima en tiempo real y actuar proactivamente`,
      `Establecer protocolos claros de comunicación para proyectos inter-áreas con responsables definidos`,
      `Capacitar a líderes en comunicación efectiva, feedback constructivo y gestión de equipos remotos`,
      `Crear espacios de integración virtual y presencial para fortalecer relaciones interpersonales`,
      `Implementar dashboard de comunicación para visualizar métricas de engagement en tiempo real`
    ];
    const count = this.seededRandom(seed + 50, 5, 7);
    return this.shuffleWithSeed(estrategias, seed + 51).slice(0, count);
  }

  private generateRecomendaciones(seed: number, depts: string[]) {
    const recomendaciones = [
      "Realizar análisis de comunicaciones trimestralmente para identificar tendencias y actuar de forma preventiva",
      "Implementar métricas de comunicación y colaboración en evaluaciones de desempeño anuales",
      "Establecer KPIs específicos de colaboración para equipos multidisciplinarios con metas claras",
      "Crear dashboard ejecutivo de monitoreo continuo de clima organizacional para liderazgo",
      "Desarrollar programa de embajadores de cultura organizacional en cada departamento",
      "Implementar sistema de feedback anónimo para temas sensibles con seguimiento estructurado",
      "Establecer comité de clima organizacional con representantes de cada área para seguimiento mensual",
      "Documentar y compartir mejores prácticas de comunicación identificadas en el análisis"
    ];
    const count = this.seededRandom(seed + 60, 4, 6);
    return this.shuffleWithSeed(recomendaciones, seed + 61).slice(0, count);
  }

  private generatePeopleAnalytics(seed: number, baseScore: number, depts: string[], countries: string[]) {
    const context = this.getContextLabel(depts, countries);
    const rotacionBase = this.seededRandom(seed + 70, 8, 14);
    const ausentismoBase = this.seededRandom(seed + 71, 2, 6);
    
    return {
      metricas_internas: {
        rotacion_estimada: `${rotacionBase}% anual`,
        ausentismo_detectado: `${ausentismoBase}% mensual`,
        nivel_desempeno_promedio: `${this.seededRandom(seed + 72, baseScore, baseScore + 12)}%`,
        interpretacion: `Los indicadores de talento ${context} muestran ${rotacionBase <= 10 ? 'excelente estabilidad laboral y retención de talento clave' : 'estabilidad laboral dentro de parámetros normales con oportunidades de mejora en retención'}. El ausentismo está ${ausentismoBase <= 4 ? 'dentro de parámetros saludables, indicando buen bienestar general' : 'ligeramente elevado, sugiriendo revisar factores de bienestar y carga laboral'}.`
      },
      benchmarking_externo: {
        comparacion_industria: `${baseScore >= 70 ? 'Por encima' : 'En línea con'} el promedio del sector tecnológico en Latinoamérica`,
        posicionamiento: `Top ${this.seededRandom(seed + 73, 18, 35)}% en clima organizacional para empresas similares en la región`,
        gaps_identificados: [
          "Oportunidad de mejora en programas de desarrollo profesional y plan de carrera",
          "Fortalecer comunicación de beneficios, compensaciones y propuesta de valor al empleado",
          "Incrementar iniciativas de bienestar integral y balance vida-trabajo",
          "Desarrollar más opciones de flexibilidad laboral y trabajo remoto"
        ]
      },
      riesgos_fuga_talento: {
        nivel_riesgo: baseScore >= 75 ? "Bajo" : baseScore >= 65 ? "Moderado" : "Moderado-Alto",
        areas_criticas: depts,
        indicadores_alerta: [
          "Monitorear disminución en participación de comunicaciones grupales como señal temprana",
          "Atender reducción en propuestas de mejora o iniciativas de innovación",
          "Observar menor interacción con contenido de cultura organizacional y eventos",
          "Identificar cambios en patrones de comunicación de colaboradores clave"
        ],
        empleados_en_riesgo_estimado: `${this.seededRandom(seed + 75, 5, 12)}% del total analizado ${context}`
      },
      relacion_clima_desempeno: {
        correlacion: "Alta correlación positiva (r=0.78) entre clima y productividad",
        areas_impacto_positivo: [
          `Equipos de ${depts[0] || 'IT'} con alta comunicación muestran +23% productividad`,
          "Áreas con liderazgo activo y visible tienen 30% menor rotación voluntaria",
          "Colaboración efectiva acelera entrega de proyectos en promedio 18%",
          "Mayor engagement correlaciona con mejor atención y satisfacción del cliente interno"
        ],
        areas_impacto_negativo: [
          "Silos de comunicación retrasan toma de decisiones en promedio 2-3 días",
          "Falta de feedback oportuno afecta motivación y compromiso individual",
          "Comunicación deficiente genera duplicación de esfuerzos y retrabajo",
          "Baja visibilidad de logros reduce motivación intrínseca del equipo"
        ],
        insight_principal: `El clima organizacional ${context} tiene impacto directo y medible en la productividad. Por cada 10 puntos de mejora en indicadores de comunicación y colaboración, se estima un incremento del 8% en eficiencia operativa y 12% en retención de talento.`
      },
      vinculacion_productividad: {
        impacto_productividad: `El clima actual ${context} representa un ${baseScore >= 70 ? 'impulso significativo' : 'área de oportunidad importante'} para la productividad organizacional`,
        impacto_rentabilidad_estimado: `${baseScore >= 70 ? '+' : ''}${this.seededRandom(seed + 76, baseScore >= 70 ? 8 : 2, baseScore >= 70 ? 18 : 8)}% en eficiencia operativa proyectada`,
        metricas_clave: [
          { metrica: "Tiempo de resolución de issues", relacion_clima: "Correlación negativa con silos de comunicación (-0.65)" },
          { metrica: "Velocidad de delivery de proyectos", relacion_clima: "Correlación positiva con colaboración inter-equipos (+0.72)" },
          { metrica: "Satisfacción del cliente interno", relacion_clima: "Directamente proporcional al clima laboral (+0.81)" },
          { metrica: "Innovación y mejora continua", relacion_clima: "Correlación positiva con apertura comunicacional (+0.68)" }
        ],
        recomendaciones_roi: [
          "Invertir en programas de comunicación genera ROI de 3:1 en productividad medido a 12 meses",
          "Reducir rotación en 5% equivale a ahorro del 15% en costos de contratación y capacitación",
          "Mejorar clima en 10 puntos puede incrementar NPS interno en 20 puntos",
          "Programas de reconocimiento con inversión mínima generan mejoras de 15% en engagement"
        ]
      }
    };
  }

  private shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.seededRandom(seed + i, 0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  async initializeDemoData() {
    try {
      console.log('Initializing demo data for Colombia, Panama, Ecuador with IT, Ventas, RRHH, Mercadeo, Finanzas, Contabilidad...');
      const demoAnalysis = this.generateDemoAnalysis({
        departments: this.departments,
        countries: this.countries
      });
      const now = new Date();
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      
      await storage.createAnalysisResult({
        totalEmailsAnalyzed: 15847,
        analysisResult: demoAnalysis,
        confidence: 89,
        isActive: true,
        departments: this.departments,
        countries: this.countries,
        dateFrom: oneYearAgo,
        dateTo: now
      });
      console.log('Demo data initialized successfully with IT, Ventas, RRHH, Mercadeo, Finanzas, Contabilidad, Colombia, Panama, Ecuador');
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  }

  async runDemoAnalysis(filters: AnalysisFilters, progressCallback: (progress: number, processed: number, total: number) => Promise<void>) {
    const analysisTimestamp = Date.now();
    
    const selectedDepts = filters.departments?.length || this.departments.length;
    const selectedCountries = filters.countries?.length || this.countries.length;
    
    // Calculate date range in days
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    const daysDiff = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Base communications per day per department per country (realistic average)
    const baseCommPerDayPerDeptPerCountry = 2.5;
    
    // Calculate total based on actual filters and time period
    const baseTotal = Math.round(
      daysDiff * 
      selectedDepts * 
      selectedCountries * 
      baseCommPerDayPerDeptPerCountry
    );
    
    // Add some variation based on timestamp for randomness (between -15% to +15%)
    const variation = this.seededRandom(analysisTimestamp, -15, 15) / 100;
    const totalEmails = Math.max(10, Math.round(baseTotal * (1 + variation)));
    
    await progressCallback(0, 0, totalEmails);
    
    const totalSteps = 20;
    
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 500));
      
      const processed = Math.round((step / totalSteps) * totalEmails);
      // Progress percentage is exactly (processed / total) * 100
      const progress = Math.round((processed / totalEmails) * 100);
      
      await progressCallback(progress, processed, totalEmails);
    }
    
    // Ensure final callback shows 100% with all emails processed
    await progressCallback(100, totalEmails, totalEmails);

    const demoAnalysis = this.generateDemoAnalysis({
      departments: filters.departments?.length ? filters.departments : this.departments,
      countries: filters.countries?.length ? filters.countries : this.countries,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
    }, analysisTimestamp);

    return {
      analysisResult: demoAnalysis,
      totalEmailsAnalyzed: totalEmails,
      confidence: this.seededRandom(analysisTimestamp, 85, 94)
    };
  }
}

interface AnalysisFilters {
  departments?: string[];
  countries?: string[];
  dateFrom?: string;
  dateTo?: string;
}
