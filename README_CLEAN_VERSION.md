# Plataforma de Análisis de Clima Organizacional

Aplicación web profesional para analizar el clima y cultura organizacional mediante el procesamiento inteligente de comunicaciones por email desde Microsoft 365, utilizando análisis con IA de OpenAI.

## 🎯 Características Principales

- **Análisis de Emails**: Procesa correos electrónicos de Microsoft 365 para extraer insights organizacionales
- **Inteligencia Artificial**: Utiliza OpenAI GPT para generar análisis profundos y recomendaciones
- **Filtros Avanzados**: Filtra por fecha, departamento y país para análisis segmentados
- **Visualizaciones**: Dashboard con gráficos radar de 8 indicadores estratégicos
- **People Analytics**: Métricas de talento, riesgo de fuga, correlaciones clima-rendimiento

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI (Radix UI)
- **TanStack Query** - State management
- **Recharts** - Visualizaciones

### Backend
- **Node.js 20** con TypeScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Drizzle ORM** - ORM type-safe

### APIs Externas
- **Microsoft Graph API** - Acceso a emails de Microsoft 365
- **OpenAI API** - Análisis con IA

## 📋 Requisitos Previos

- Node.js 20 o superior
- PostgreSQL 15 o superior
- Cuenta de Microsoft 365 con permisos de Azure AD
- API Key de OpenAI

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/clima-organizacional.git
cd clima-organizacional
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

Variables requeridas:
- `CLIENT_ID` - Azure AD Application ID
- `CLIENT_SECRET` - Azure AD Application Secret
- `TENANT_ID` - Azure AD Tenant ID
- `OPENAI_API_KEY` - OpenAI API Key
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret aleatorio para sesiones

### 4. Configurar Base de Datos

```bash
# Aplicar el esquema a PostgreSQL
npm run db:push
```

### 5. Desarrollo

```bash
# Iniciar servidor de desarrollo (frontend + backend)
npm run dev
```

La aplicación estará disponible en: `http://localhost:5000`

### 6. Producción

```bash
# Compilar para producción
npm run build

# Iniciar en modo producción
npm start
```

## 🔑 Configuración de Azure AD (Microsoft 365)

1. Ir a [Azure Portal](https://portal.azure.com)
2. Crear una nueva **App Registration**
3. Configurar permisos de API:
   - Microsoft Graph → **Application permissions** → `Mail.Read`
4. Crear un **Client Secret**
5. Copiar: `Client ID`, `Tenant ID`, `Client Secret` al archivo `.env`

## 🔐 Seguridad

- ✅ Todas las credenciales en variables de entorno
- ✅ Secrets nunca en el código fuente
- ✅ `.env` incluido en `.gitignore`
- ✅ HTTPS obligatorio en producción
- ✅ Autenticación via Azure AD

## 📊 Arquitectura

```
┌─────────────────┐
│  Microsoft 365  │ ← Almacenamiento de emails (externo)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Este Servidor  │ ← Orquestador (coordina APIs)
│   Express API   │   - Solicita emails a M365
└────────┬────────┘   - Envía a OpenAI
         │            - Guarda resultados
         ↓
┌─────────────────┐
│   OpenAI API    │ ← Procesamiento IA (externo)
└─────────────────┘
```

**El servidor actúa como orquestador ligero**, no almacena los 10M de emails, solo los resultados del análisis.

## 📁 Estructura del Proyecto

```
.
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Dashboard, Analysis, etc.)
│   │   └── components/    # Componentes UI
│   └── index.html
├── server/                # Backend Express
│   ├── services/          # MicrosoftGraphService, OpenAIService
│   ├── routes.ts          # API endpoints
│   └── index.ts           # Entry point
├── shared/                # Código compartido
│   └── schema.ts          # Esquema Drizzle (tipos)
└── package.json

```

## 🌐 API Endpoints

- `GET /api/connections/status` - Estado de conexiones M365 y OpenAI
- `GET /api/users/metadata` - Departamentos y países disponibles
- `POST /api/analysis/start` - Iniciar nuevo análisis
- `GET /api/analysis/progress` - Progreso del análisis actual
- `GET /api/analysis/results` - Resultados del último análisis

## 💰 Costos Estimados

### Infraestructura (VPS)
- **Servidor básico**: $12-20/mes (2 vCPU, 4GB RAM)
- Suficiente para 1 usuario, 4 análisis/mes

### APIs Externas
- **Microsoft 365**: Incluido (sin costo adicional)
- **OpenAI API**: Variable según uso
  - GPT-4o Batch: ~$8,750 por análisis de 10M emails
  - GPT-3.5 Turbo: ~$1,750 por análisis de 10M emails
  - **Recomendación**: Usar muestreo estadístico (100K emails) para reducir costos 99%

## 🧪 Testing

```bash
# Verificar TypeScript
npm run check

# Limpiar y reconstruir
rm -rf dist node_modules
npm install
npm run build
```

## 📦 Despliegue

### Opción 1: VPS (DigitalOcean, Linode, Hetzner)

```bash
# En el servidor
git clone tu-repositorio.git
cd clima-organizacional
npm install
npm run build

# Configurar PM2
npm install -g pm2
pm2 start npm --name clima-app -- start
pm2 startup
pm2 save

# Configurar Nginx como reverse proxy
# Ver documentación en docs/nginx.conf
```

### Opción 2: Cloud Platform (AWS, GCP, Azure)

Ver documentación específica en `docs/deployment/`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Ver archivo `LICENSE`

## 📞 Soporte

Para preguntas o soporte:
- Email: soporte@tuempresa.com
- Documentación: [Wiki del proyecto](#)

---

**Desarrollado para análisis profesional de clima organizacional** 🎯
