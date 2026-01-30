import { 
  type EmailAnalysis, 
  type InsertEmailAnalysis,
  type AnalysisResult, 
  type InsertAnalysisResult,
  type AnalysisProgress,
  type InsertAnalysisProgress,
  type OpenAIAnalysisResult,
  type SystemConfig,
  type InsertSystemConfig,
  emailAnalysis,
  analysisResults,
  analysisProgress,
  systemConfig
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Email analysis operations
  createEmailAnalysis(email: InsertEmailAnalysis): Promise<EmailAnalysis>;
  getEmailAnalysisByMessageId(messageId: string): Promise<EmailAnalysis | undefined>;
  getAllEmailAnalyses(): Promise<EmailAnalysis[]>;
  
  // Analysis results operations
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getLatestAnalysisResult(): Promise<AnalysisResult | undefined>;
  getAllAnalysisResults(): Promise<AnalysisResult[]>;
  
  // Analysis progress operations
  createAnalysisProgress(progress: InsertAnalysisProgress): Promise<AnalysisProgress>;
  updateAnalysisProgress(id: string, progress: Partial<InsertAnalysisProgress>): Promise<AnalysisProgress | undefined>;
  getLatestAnalysisProgress(): Promise<AnalysisProgress | undefined>;

  // Config operations
  getConfig(key: string): Promise<string | undefined>;
  setConfig(key: string, value: string): Promise<void>;
  getAllConfig(): Promise<Record<string, string>>;
}

export class MemStorage implements IStorage {
  private emailAnalyses: Map<string, EmailAnalysis>;
  private analysisResults: Map<string, AnalysisResult>;
  private analysisProgresses: Map<string, AnalysisProgress>;
  private configs: Map<string, string>;

  constructor() {
    this.emailAnalyses = new Map();
    this.analysisResults = new Map();
    this.analysisProgresses = new Map();
    this.configs = new Map();
  }

  async getConfig(key: string): Promise<string | undefined> {
    return this.configs.get(key);
  }

  async setConfig(key: string, value: string): Promise<void> {
    this.configs.set(key, value);
  }

  async getAllConfig(): Promise<Record<string, string>> {
    return Object.fromEntries(this.configs);
  }

  async createEmailAnalysis(insertEmail: InsertEmailAnalysis): Promise<EmailAnalysis> {
    const id = randomUUID();
    const email: EmailAnalysis = { 
      id,
      messageId: insertEmail.messageId,
      source: insertEmail.source || 'outlook',
      chatType: insertEmail.chatType || null,
      subject: insertEmail.subject || null,
      sender: insertEmail.sender || null,
      recipients: insertEmail.recipients || null,
      content: insertEmail.content || null,
      sentDate: insertEmail.sentDate || null,
      processedDate: new Date(),
      sentiment: insertEmail.sentiment || null,
      topics: insertEmail.topics || null
    };
    this.emailAnalyses.set(id, email);
    return email;
  }

  async getEmailAnalysisByMessageId(messageId: string): Promise<EmailAnalysis | undefined> {
    return Array.from(this.emailAnalyses.values()).find(
      (email) => email.messageId === messageId,
    );
  }

  async getAllEmailAnalyses(): Promise<EmailAnalysis[]> {
    return Array.from(this.emailAnalyses.values());
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = randomUUID();
    const result: AnalysisResult = { 
      id,
      analysisDate: new Date(),
      totalEmailsAnalyzed: insertResult.totalEmailsAnalyzed,
      analysisResult: insertResult.analysisResult,
      confidence: insertResult.confidence || null,
      isActive: insertResult.isActive !== false,
      departments: insertResult.departments || null,
      countries: insertResult.countries || null,
      dateFrom: insertResult.dateFrom || null,
      dateTo: insertResult.dateTo || null,
    };
    
    // Mark all other results as inactive
    Array.from(this.analysisResults.entries()).forEach(([key, existingResult]) => {
      this.analysisResults.set(key, { ...existingResult, isActive: false });
    });
    
    this.analysisResults.set(id, result);
    return result;
  }

  async getLatestAnalysisResult(): Promise<AnalysisResult | undefined> {
    return Array.from(this.analysisResults.values())
      .find(result => result.isActive);
  }

  async getAllAnalysisResults(): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values())
      .sort((a, b) => {
        const dateA = a.analysisDate ? new Date(a.analysisDate).getTime() : 0;
        const dateB = b.analysisDate ? new Date(b.analysisDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createAnalysisProgress(insertProgress: InsertAnalysisProgress): Promise<AnalysisProgress> {
    const id = randomUUID();
    const progress: AnalysisProgress = { 
      id,
      status: insertProgress.status,
      progress: insertProgress.progress || null,
      emailsProcessed: insertProgress.emailsProcessed || null,
      totalEmails: insertProgress.totalEmails || null,
      startedAt: new Date(),
      completedAt: insertProgress.completedAt || null,
      errorMessage: insertProgress.errorMessage || null
    };
    this.analysisProgresses.set(id, progress);
    return progress;
  }

  async updateAnalysisProgress(id: string, updateData: Partial<InsertAnalysisProgress>): Promise<AnalysisProgress | undefined> {
    const existing = this.analysisProgresses.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...updateData,
      ...(updateData.status === 'completed' || updateData.status === 'error' ? { completedAt: new Date() } : {})
    };
    this.analysisProgresses.set(id, updated);
    return updated;
  }

  async getLatestAnalysisProgress(): Promise<AnalysisProgress | undefined> {
    return Array.from(this.analysisProgresses.values())
      .sort((a, b) => {
        const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return dateB - dateA;
      })[0];
  }
}

// Database storage implementation using Drizzle ORM
export class DbStorage implements IStorage {
  // Email analysis operations
  async createEmailAnalysis(insertEmail: InsertEmailAnalysis): Promise<EmailAnalysis> {
    const [email] = await db.insert(emailAnalysis).values(insertEmail).returning();
    return email;
  }

  async getEmailAnalysisByMessageId(messageId: string): Promise<EmailAnalysis | undefined> {
    const [email] = await db
      .select()
      .from(emailAnalysis)
      .where(eq(emailAnalysis.messageId, messageId))
      .limit(1);
    return email;
  }

  async getAllEmailAnalyses(): Promise<EmailAnalysis[]> {
    return await db.select().from(emailAnalysis);
  }

  // Analysis results operations
  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    // Use transaction to atomically deactivate old results and insert new one
    const result = await db.transaction(async (tx) => {
      // Mark all other results as inactive
      await tx.update(analysisResults).set({ isActive: false });
      
      // Insert new result as active
      const [newResult] = await tx
        .insert(analysisResults)
        .values({ ...insertResult, isActive: true })
        .returning();
      return newResult;
    });
    
    return result;
  }

  async getLatestAnalysisResult(): Promise<AnalysisResult | undefined> {
    const [result] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.isActive, true))
      .limit(1);
    return result;
  }

  async getAllAnalysisResults(): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.analysisDate));
  }

  // Analysis progress operations
  async createAnalysisProgress(insertProgress: InsertAnalysisProgress): Promise<AnalysisProgress> {
    const [progress] = await db
      .insert(analysisProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateAnalysisProgress(id: string, updateData: Partial<InsertAnalysisProgress>): Promise<AnalysisProgress | undefined> {
    const updates: any = { ...updateData };
    if (updateData.status === 'completed' || updateData.status === 'error') {
      updates.completedAt = new Date();
    }
    
    const [progress] = await db
      .update(analysisProgress)
      .set(updates)
      .where(eq(analysisProgress.id, id))
      .returning();
    return progress;
  }

  async getLatestAnalysisProgress(): Promise<AnalysisProgress | undefined> {
    const [progress] = await db
      .select()
      .from(analysisProgress)
      .orderBy(desc(analysisProgress.startedAt))
      .limit(1);
    return progress;
  }

  async getConfig(key: string): Promise<string | undefined> {
    const [config] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, key))
      .limit(1);
    return config?.value;
  }

  async setConfig(key: string, value: string): Promise<void> {
    await db
      .insert(systemConfig)
      .values({ key, value })
      .onConflictDoUpdate({
        target: systemConfig.key,
        set: { value, updatedAt: new Date() }
      });
  }

  async getAllConfig(): Promise<Record<string, string>> {
    const rows = await db.select().from(systemConfig);
    return rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  }
}

// Use database storage for production
export const storage = new DbStorage();
