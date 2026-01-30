import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for SSO authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  azureId: text("azure_id").unique(), // Azure AD unique identifier
  department: text("department"),
  country: text("country"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communication analysis table (emails + Teams messages)
export const emailAnalysis = pgTable("email_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: text("message_id").notNull().unique(),
  source: text("source").notNull().default("outlook"), // "outlook" or "teams"
  chatType: text("chat_type"), // For Teams: "chat", "channel", "meeting", null for emails
  subject: text("subject"),
  sender: text("sender"),
  recipients: text("recipients").array(),
  content: text("content"),
  sentDate: timestamp("sent_date"),
  processedDate: timestamp("processed_date").defaultNow(),
  sentiment: text("sentiment"),
  topics: text("topics").array(),
});

// Analysis results table
export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisDate: timestamp("analysis_date").defaultNow(),
  totalEmailsAnalyzed: integer("total_emails_analyzed").notNull(),
  analysisResult: jsonb("analysis_result").notNull(), // Stores the complete OpenAI JSON response
  confidence: integer("confidence"), // 0-100
  isActive: boolean("is_active").default(true), // Mark the most recent analysis as active
  // Applied filters
  departments: text("departments").array(), // List of departments filtered
  countries: text("countries").array(), // List of countries filtered
  dateFrom: timestamp("date_from"), // Calculated start date for the period
  dateTo: timestamp("date_to"), // Calculated end date (usually now)
});

// Analysis progress tracking
export const analysisProgress = pgTable("analysis_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull(), // 'running', 'completed', 'error', 'paused'
  progress: integer("progress").default(0), // 0-100
  emailsProcessed: integer("emails_processed").default(0),
  totalEmails: integer("total_emails").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
});

// Zod schemas for API validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  lastLogin: true
});

export const insertEmailAnalysisSchema = createInsertSchema(emailAnalysis).omit({ 
  id: true, 
  processedDate: true 
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({ 
  id: true, 
  analysisDate: true 
});

export const insertAnalysisProgressSchema = createInsertSchema(analysisProgress).omit({ 
  id: true, 
  startedAt: true 
});

// System configuration table
export const systemConfig = pgTable("system_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({ 
  id: true, 
  updatedAt: true 
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// OpenAI Analysis Response Schema
export const openAIAnalysisSchema = z.object({
  diagnostico_general: z.string(),
  tipo_de_cultura: z.string(),
  indicadores_estrategicos: z.array(z.object({
    indicador: z.string(),
    valor: z.number().min(0).max(100),
    descripcion: z.string()
  })),
  kpis: z.array(z.object({
    nombre: z.string(),
    valor_estimado: z.string(),
    interpretacion: z.string()
  })),
  okrs: z.array(z.object({
    objetivo: z.string(),
    resultados_clave: z.array(z.string())
  })),
  fortalezas: z.array(z.string()),
  debilidades: z.array(z.string()),
  estrategias: z.array(z.string()),
  recomendaciones_metodologicas: z.array(z.string()),
  people_analytics: z.object({
    metricas_internas: z.object({
      rotacion_estimada: z.string(),
      ausentismo_detectado: z.string(),
      nivel_desempeno_promedio: z.string(),
      interpretacion: z.string()
    }),
    benchmarking_externo: z.object({
      comparacion_industria: z.string(),
      posicionamiento: z.string(),
      gaps_identificados: z.array(z.string())
    }),
    riesgos_fuga_talento: z.object({
      nivel_riesgo: z.string(),
      areas_criticas: z.array(z.string()),
      indicadores_alerta: z.array(z.string()),
      empleados_en_riesgo_estimado: z.string()
    }),
    relacion_clima_desempeno: z.object({
      correlacion: z.string(),
      areas_impacto_positivo: z.array(z.string()),
      areas_impacto_negativo: z.array(z.string()),
      insight_principal: z.string()
    }),
    vinculacion_productividad: z.object({
      impacto_productividad: z.string(),
      impacto_rentabilidad_estimado: z.string(),
      metricas_clave: z.array(z.object({
        metrica: z.string(),
        relacion_clima: z.string()
      })),
      recomendaciones_roi: z.array(z.string())
    })
  })
});

// Analysis filters schema
export const analysisFiltersSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  departments: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
});

// Type exports
export type InsertEmailAnalysis = z.infer<typeof insertEmailAnalysisSchema>;
export type EmailAnalysis = typeof emailAnalysis.$inferSelect;

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

export type InsertAnalysisProgress = z.infer<typeof insertAnalysisProgressSchema>;
export type AnalysisProgress = typeof analysisProgress.$inferSelect;

export type OpenAIAnalysisResult = z.infer<typeof openAIAnalysisSchema>;
export type AnalysisFilters = z.infer<typeof analysisFiltersSchema>;
