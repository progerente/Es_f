# Organizational Climate Analysis Platform

## Overview

This is a web application designed to analyze organizational climate and culture by processing communications from Microsoft 365 (Outlook emails and Microsoft Teams messages). The platform uses AI-powered analysis through OpenAI to generate comprehensive insights, including diagnostics, KPIs, OKRs, strengths, weaknesses, actionable recommendations, and People Analytics. The application provides a professional dashboard interface for viewing analysis results and monitoring the health of the organization through data-driven metrics.

**People Analytics Section** (Added Sept 30, 2025): Includes analysis of internal metrics (turnover, absenteeism, performance), external benchmarking, talent flight risk identification, climate-performance correlation, and productivity/profitability linkage with ROI recommendations.

**Strategic Radar Chart** (Added Sept 30, 2025): Interactive radar chart visualization displaying 8 key strategic indicators (Clima Organizacional, Liderazgo, Comunicación, Productividad, Compromiso, Innovación, Colaboración, Satisfacción) with values 0-100 calculated by OpenAI based on communication analysis patterns.

**Multi-Source Communication Analysis** (Updated Oct 23, 2025): The platform processes communications from both Outlook emails and Microsoft Teams messages conjunctly to generate unified insights. Both sources are analyzed together without separate results per channel. Database schema includes `source` field (outlook/teams) and `chatType` field for Teams messages (chat/channel) to support comprehensive multi-source analysis.

**Advanced Filtering System** (Added Oct 2, 2025, Updated Oct 2, 2025): Comprehensive filtering capabilities allowing targeted analysis of specific organizational segments:
- **Calendar-Based Date Selection**: Users select exact date ranges (from/to) using an interactive calendar picker with Spanish locale, replacing relative period filters
- **Department Filter**: Multi-select filter with automatic normalization (case-insensitive, trim) - "Recursos Humanos", "recursos humanos", and "RECURSOS HUMANOS" are treated as the same department
- **Country Filter**: Multi-select filter with automatic normalization (case-insensitive, trim)
- **Filter Persistence**: Applied filters (dateFrom, dateTo, departments, countries) are stored with analysis results and displayed as formatted badges
- **Metadata API**: GET /api/users/metadata endpoint returns normalized department and country names from Microsoft Graph
- **Smart Filtering Logic**: Department/country comparisons are normalized during filtering to include all case variants, ensuring comprehensive user inclusion

**Detailed Analysis Page** (Added Oct 22, 2025, Updated Oct 23, 2025): Dedicated page (`/analysis`) for in-depth viewing of the latest analysis results:
- **Comprehensive Analysis Display**: Shows complete analysis with diagnostic summary, culture type identification, strategic indicators radar chart, KPIs, OKRs, strengths, weaknesses, strategies, and People Analytics
- **Analysis Metadata**: Displays total communications analyzed (Outlook + Teams), date period, confidence level, and applied filters
- **Empty State Handling**: When no analysis exists, displays user-friendly message: "Inicia un análisis en el dashboard para ver aquí los resultados en detalle"
- **Organized Sections**: Well-structured layout with collapsible cards for each analysis component
- **Visual Indicators**: Uses icons and color coding to differentiate between strengths (green), weaknesses (amber), and strategic actions

**Reports History & Comparison** (Added Oct 22, 2025, Updated Oct 23, 2025): Dedicated page (`/reports`) for viewing all historical analyses and comparing results:
- **Historical View**: Displays ALL analysis reports in chronological order (newest first) with complete metadata
- **Report Cards**: Each report shows analysis date, communications analyzed (Outlook + Teams), culture type, key indicators preview, and quick statistics
- **Comparison System**: Interactive two-report selection for side-by-side comparison
- **Filter-Aware Comparison** (Enhanced Oct 22, 2025): Context-rich comparison showing specific organizational segments:
  - **Analysis Summary Cards**: Visual cards displaying filters (departments, countries, date range) for each selected report with badges and icons
  - **Descriptive Column Labels**: Replaces generic "Anterior/Actual" with specific filter context (e.g., "Contable, Finanzas" vs "Marketing, Innovación")
  - **Smart Truncation**: Long filter lists display first 2-3 items with "+n más" counter, tooltips show full list
  - **Global Analysis Indicator**: When no filters applied, clearly shows "Análisis Global" badge
  - **Contextual Differences**: "Diferencia" column shows calculated changes with trend indicators between specific segments
- **Comparative Analysis**: 
  - Strategic indicators comparison with calculated differences and trend arrows
  - KPIs comparison showing values from both reports with segment-specific labels
  - Summary statistics showing changes in strengths, weaknesses, and strategies count
- **Filter Display**: Shows applied filters (date range, departments, countries) for each historical report
- **Empty State Handling**: When no reports exist, displays: "Inicia tu primer análisis en el dashboard para encontrar aquí los reportes"
- **Unlimited Storage**: All analyses are saved permanently without limit - track organizational climate evolution over time
- **Cache Auto-Refresh**: Reports page automatically updates when new analysis completes without manual page refresh

## User Preferences

Preferred communication style: Simple, everyday language.

## Corporate Style Guidelines

**Esri Colombia, Ecuador y Panamá Corporate Style** (Applied Oct 22, 2025): All user-facing text follows corporate communication standards:
- **Tone**: Professional, close, and proactive
- **Grammatical Person**: First-person plural ("nosotros") or formal third-person
- **Language**: Clear, inclusive, solution-oriented
- **Structure**: Concise phrases focused on solutions

**Key Changes**:
- Navigation: "Dashboard" → "Panel Principal", "Análisis" → "Análisis Detallado", "Reportes" → "Historial de Reportes"
- Toast notifications use first-person plural: "Hemos completado el análisis", "Estamos procesando los correos..."
- Empty states guide users with positive messaging: "Aún no tenemos análisis. Inicie uno para comenzar"
- All status messages prioritize clarity and next actions over technical details

See `CAMBIOS_ESTILO_CORPORATIVO.md` for complete documentation of all ~30 text updates across Dashboard, Reports, Analysis, and AppSidebar components.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives, configured with the "new-york" style variant. This provides a comprehensive set of accessible, customizable components following Material Design principles for professional enterprise applications.

**Styling**: 
- Tailwind CSS for utility-first styling with custom configuration
- Design system supports both light and dark themes with CSS custom properties
- Material Design inspired color palette with deep blue primary colors and professional accent colors (green for success, amber for warnings, coral red for errors)
- Inter font family from Google Fonts for all typography

**State Management**: 
- TanStack Query (React Query) for server state management with configured caching and refetching strategies
- Local React state for UI interactions
- Custom hooks for shared logic (mobile detection, toast notifications)

**Routing**: Wouter for lightweight client-side routing with the following routes:
- `/` - Dashboard (main analysis view with controls to start new analysis)
- `/analysis` - Detailed analysis page showing complete results of latest analysis
- `/reports` - Historical reports page with last 3 analyses and comparison functionality
- `/monitoring` - Monitoring view (currently redirects to Dashboard)
- `/settings` - Configuration settings

**Layout Pattern**: 
- Sidebar navigation layout with collapsible sidebar
- Card-based dashboard for displaying metrics and insights
- Responsive design with mobile breakpoint at 768px

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript with ES modules

**API Structure**: RESTful API with the following key endpoints:
- `/api/connections/status` - Check Microsoft 365 and OpenAI connection status
- `/api/users/metadata` - Retrieve available departments and countries from Microsoft Graph user data
- `/api/analysis/start` - Initiate new analysis with optional filters (dateFrom, dateTo, departments, countries)
- `/api/analysis/progress` - Track email processing progress
- `/api/analysis/results` - Retrieve latest analysis results with applied filter metadata
- `/api/analysis/results/history` - Retrieve last 3 analysis reports for historical comparison

**Data Flow**:
1. Frontend loads metadata (departments/countries) on mount
2. User selects filters in AnalysisProgress component
3. User clicks "Iniciar Análisis"
4. Filters are sent to POST /api/analysis/start
5. Backend filters communications based on:
   - Date range (calculated from periodType + periodValue)
   - User departments (filters users by department metadata)
   - User countries (filters users by country metadata)
6. Microsoft Graph API retrieves filtered communications from matching users using application permissions:
   - Outlook emails via Mail.Read API
   - Microsoft Teams messages via Chat.Read.All/ChatMessage.Read.All API
7. Communications from both sources are processed and stored with source metadata (outlook/teams)
8. OpenAI API analyzes communication content from all sources conjunctly to generate unified structured insights
9. Results are stored with filter metadata and made available through the API
10. Frontend polls for progress updates during analysis
11. Applied filters are displayed as badges when showing results

**Service Layer Pattern**: Separated business logic into dedicated service classes:
- `MicrosoftGraphService` - Handles Microsoft 365 authentication and retrieves communications from Outlook (emails) and Microsoft Teams (messages and chats)
- `OpenAIService` - Manages AI analysis of communication content and prompt engineering

**Storage Strategy**: 
- PostgreSQL database implementation (`DbStorage`) using Drizzle ORM for production
- Neon Database serverless driver for persistent storage
- All analyses, emails, and progress data stored permanently in PostgreSQL
- Implemented with IStorage interface for maintainability and testability
- Database transactions ensure atomic operations for critical data updates

### Database Design

**ORM**: Drizzle ORM with PostgreSQL

**Schema Tables**:
- `email_analysis` - Stores processed communications (emails and Teams messages) with metadata, sentiment analysis, source field (outlook/teams), and chatType field (chat/channel for Teams)
- `analysis_results` - Stores complete OpenAI analysis results as JSONB with KPIs, OKRs, strategies
- `analysis_progress` - Tracks real-time progress of communication processing jobs

**Key Design Decisions**:
- JSONB storage for flexible OpenAI response structures
- UUID primary keys for distributed scalability
- Timestamps for tracking processing chronology
- Array types for multi-value fields (recipients, topics, strengths, weaknesses)
- Source tracking to distinguish Outlook emails from Teams messages in unified analysis

### Authentication & Authorization

**Microsoft 365**: Uses Azure AD application registration with MSAL Node library for server-to-server authentication via client credentials flow. Requires:
- `CLIENT_ID` - Azure AD application ID
- `CLIENT_SECRET` - Application secret
- `TENANT_ID` - Azure AD tenant ID

**Permissions**: Application permissions (not delegated) with:
- `Mail.Read` scope to access all organizational Outlook emails
- `Chat.Read.All` or `ChatMessage.Read.All` scope to access all organizational Teams messages and chats

**Security**: All credentials managed through environment variables, never hardcoded.

## External Dependencies

### Third-Party Services

**Microsoft Graph API**:
- Purpose: Access Microsoft 365 communications (Outlook emails and Teams messages) across the organization
- Authentication: MSAL Node with confidential client application flow
- Required environment variables: `CLIENT_ID`, `TENANT_ID`, `CLIENT_SECRET`
- Required permissions: `Mail.Read`, `Chat.Read.All` or `ChatMessage.Read.All`
- Service class: `MicrosoftGraphService` with methods for both Outlook and Teams data retrieval

**OpenAI API**:
- Purpose: AI-powered analysis of organizational communication patterns from Outlook and Teams
- Model: GPT-based language models for structured JSON responses
- Required environment variables: `OPENAI_API_KEY`
- Service class: `OpenAIService`
- Input: Unified communications dataset from both Outlook emails and Teams messages
- Output format: Structured JSON including diagnostics, culture type, strategic indicators (8 key metrics 0-100), KPIs, OKRs, strengths, weaknesses, recommendations, and People Analytics (internal metrics, benchmarking, talent flight risk, climate-performance correlation, productivity/ROI linkage) - all based on conjunct analysis of both sources

**Neon Database**:
- Purpose: Serverless PostgreSQL database for production data persistence
- Driver: `@neondatabase/serverless`
- Required environment variables: `DATABASE_URL`
- Schema management: Drizzle Kit for migrations

### Key NPM Dependencies

**Frontend**:
- `@tanstack/react-query` - Server state management and caching
- `@radix-ui/*` - Accessible component primitives
- `wouter` - Lightweight routing
- `tailwindcss` - Utility-first CSS framework
- `date-fns` - Date manipulation

**Backend**:
- `express` - Web framework
- `drizzle-orm` - Type-safe ORM
- `@azure/msal-node` - Microsoft authentication
- `@microsoft/microsoft-graph-client` - Microsoft Graph API client
- `openai` - OpenAI API client

**Development**:
- `vite` - Build tool and dev server
- `tsx` - TypeScript execution
- `esbuild` - JavaScript bundler for production builds