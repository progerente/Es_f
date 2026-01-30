import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MicrosoftGraphService } from "./services/microsoftGraphService";
import { OpenAIService } from "./services/openaiService";
import { DemoDataService } from "./services/demoDataService.js";
import { insertAnalysisProgressSchema, insertAnalysisResultSchema, analysisFiltersSchema, type AnalysisFilters } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const graphService = new MicrosoftGraphService();
  const openaiService = new OpenAIService();
  const demoService = new DemoDataService();

  await demoService.initializeDemoData();

  // Connection status endpoints
  app.get("/api/connections/status", async (req, res) => {
    try {
      // Re-initialize services with latest config
      const dbConfig = await storage.getAllConfig();
      await graphService.initializeClient(dbConfig);
      await openaiService.initializeClient(dbConfig);

      const microsoftStatus = graphService.isConfigured();
      const openaiStatus = openaiService.isConfigured();

      let microsoftConnected = false;
      let openaiConnected = false;

      if (microsoftStatus) {
        microsoftConnected = await graphService.testConnection();
      }

      if (openaiStatus) {
        openaiConnected = await openaiService.testConnection();
      }

      res.json({
        microsoft365: {
          configured: microsoftStatus,
          connected: microsoftConnected,
          lastUpdate: new Date().toISOString(),
          config: {
            clientId: dbConfig.CLIENT_ID || process.env.CLIENT_ID || "",
            tenantId: dbConfig.TENANT_ID || process.env.TENANT_ID || "",
            hasSecret: !!(dbConfig.CLIENT_SECRET || process.env.CLIENT_SECRET)
          }
        },
        openai: {
          configured: openaiStatus,
          connected: openaiConnected,
          lastUpdate: new Date().toISOString(),
          config: {
            hasKey: !!(dbConfig.OPENAI_API_KEY || process.env.OPENAI_API_KEY)
          }
        }
      });
    } catch (error) {
      console.error("Connection status check failed:", error);
      res.status(500).json({ 
        error: "Failed to check connection status",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Save configuration
  app.post("/api/config", async (req, res) => {
    try {
      const { clientId, tenantId, clientSecret, openaiKey } = req.body;
      
      if (clientId) await storage.setConfig("CLIENT_ID", clientId);
      if (tenantId) await storage.setConfig("TENANT_ID", tenantId);
      if (clientSecret) await storage.setConfig("CLIENT_SECRET", clientSecret);
      if (openaiKey) await storage.setConfig("OPENAI_API_KEY", openaiKey);

      // Re-initialize services
      const dbConfig = await storage.getAllConfig();
      await graphService.initializeClient(dbConfig);
      await openaiService.initializeClient(dbConfig);

      res.json({ message: "Configuration saved successfully" });
    } catch (error) {
      console.error("Failed to save config:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  // Get user metadata (departments and countries)
  app.get("/api/users/metadata", async (req, res) => {
    try {
      if (graphService.isConfigured()) {
        const metadata = await graphService.getUsersMetadata();
        res.json(metadata);
      } else {
        res.json(demoService.getDemoMetadata());
      }
    } catch (error) {
      console.error("Failed to fetch user metadata:", error);
      res.json(demoService.getDemoMetadata());
    }
  });

  // Analysis progress endpoints
  app.get("/api/analysis/progress", async (req, res) => {
    try {
      const progress = await storage.getLatestAnalysisProgress();
      res.json(progress || {
        status: 'idle',
        progress: 0,
        emailsProcessed: 0,
        totalEmails: 0
      });
    } catch (error) {
      console.error("Failed to get analysis progress:", error);
      res.status(500).json({ 
        error: "Failed to get analysis progress",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Start analysis endpoint
  app.post("/api/analysis/start", async (req, res) => {
    try {
      // Check if analysis is already running
      const currentProgress = await storage.getLatestAnalysisProgress();
      if (currentProgress?.status === 'running') {
        return res.status(400).json({ error: "Analysis is already running" });
      }

      // Validate and parse filters from request body
      const filters = analysisFiltersSchema.parse(req.body || {});

      // Create new progress entry
      const progressData = insertAnalysisProgressSchema.parse({
        status: 'running',
        progress: 0,
        emailsProcessed: 0,
        totalEmails: 0
      });

      const progress = await storage.createAnalysisProgress(progressData);

      // Start the analysis process asynchronously with filters
      setImmediate(async () => {
        try {
          await runAnalysisProcess(progress.id, filters);
        } catch (error) {
          console.error("Analysis process failed:", error);
          await storage.updateAnalysisProgress(progress.id, {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : "Unknown error"
          });
        }
      });

      res.json({ message: "Analysis started", progressId: progress.id });
    } catch (error) {
      console.error("Failed to start analysis:", error);
      res.status(500).json({ 
        error: "Failed to start analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stop analysis endpoint
  app.post("/api/analysis/stop", async (req, res) => {
    try {
      const currentProgress = await storage.getLatestAnalysisProgress();
      if (!currentProgress || currentProgress.status !== 'running') {
        return res.status(400).json({ error: "No analysis is currently running" });
      }

      await storage.updateAnalysisProgress(currentProgress.id, {
        status: 'paused'
      });

      res.json({ message: "Analysis paused" });
    } catch (error) {
      console.error("Failed to stop analysis:", error);
      res.status(500).json({ 
        error: "Failed to stop analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get latest analysis results
  app.get("/api/analysis/results", async (req, res) => {
    try {
      const result = await storage.getLatestAnalysisResult();
      if (!result) {
        return res.status(404).json({ error: "No analysis results found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Failed to get analysis results:", error);
      res.status(500).json({ 
        error: "Failed to get analysis results",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all analysis results history
  app.get("/api/analysis/results/history", async (req, res) => {
    try {
      const results = await storage.getAllAnalysisResults();
      res.json(results);
    } catch (error) {
      console.error("Failed to get analysis results history:", error);
      res.status(500).json({ 
        error: "Failed to get analysis results history",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Analysis process function
  async function runAnalysisProcess(progressId: string, filters: AnalysisFilters = {}): Promise<void> {
    const checkCancellation = async () => {
      const currentProgress = await storage.getLatestAnalysisProgress();
      return currentProgress?.status === 'paused';
    };

    try {
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const useRealServices = graphService.isConfigured() && openaiService.isConfigured();

      if (!useRealServices) {
        console.log('Using demo data for analysis (Microsoft Graph or OpenAI not configured)');
        
        const result = await demoService.runDemoAnalysis(filters, async (progress, processed, total) => {
          if (await checkCancellation()) return;
          await storage.updateAnalysisProgress(progressId, {
            status: 'running',
            progress,
            emailsProcessed: processed,
            totalEmails: total
          });
        });

        const resultData = insertAnalysisResultSchema.parse({
          totalEmailsAnalyzed: result.totalEmailsAnalyzed,
          analysisResult: result.analysisResult,
          confidence: result.confidence,
          isActive: true,
          departments: filters.departments || null,
          countries: filters.countries || null,
          dateFrom,
          dateTo
        });

        await storage.createAnalysisResult(resultData);
        
        await storage.updateAnalysisProgress(progressId, {
          status: 'completed',
          progress: 100
        });
        
        return;
      }

      if (await checkCancellation()) return;
      
      const communications = await graphService.getAllUsersCommunications(
        dateFrom,
        dateTo,
        filters.departments,
        filters.countries
      );
      const totalCommunications = communications.length;

      // Initial progress: 5% - fetched communications, now starting to process
      await storage.updateAnalysisProgress(progressId, {
        progress: 5,
        totalEmails: totalCommunications,
        emailsProcessed: 0
      });

      const processedCommunications = [];
      for (let i = 0; i < communications.length; i++) {
        if (await checkCancellation()) return;
        
        const comm = communications[i];
        
        const commData = {
          messageId: comm.id,
          source: comm.source,
          chatType: comm.chatType || null,
          subject: comm.subject || null,
          sender: comm.sender || null,
          recipients: comm.recipients || [],
          content: comm.content || null,
          sentDate: comm.sentDateTime ? new Date(comm.sentDateTime) : null,
          sentiment: null,
          topics: null
        };

        const existing = await storage.getEmailAnalysisByMessageId(comm.id);
        if (!existing) {
          await storage.createEmailAnalysis(commData);
        }

        processedCommunications.push({
          subject: commData.subject || '',
          sender: commData.sender || '',
          recipients: commData.recipients,
          content: commData.content || '',
          sentDate: commData.sentDate || new Date()
        });

        // Progress percentage directly reflects communications processed
        // When all communications are processed, it shows 100%
        const processedCount = i + 1;
        const progress = Math.round((processedCount / totalCommunications) * 100);
        await storage.updateAnalysisProgress(progressId, {
          progress,
          emailsProcessed: processedCount
        });

        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      if (await checkCancellation()) return;

      if (processedCommunications.length === 0) {
        throw new Error('No communications found for analysis');
      }

      // All communications processed - now at 100%
      await storage.updateAnalysisProgress(progressId, {
        progress: 100,
        emailsProcessed: totalCommunications
      });

      const analysisResult = await openaiService.analyzeOrganizationalClimate(processedCommunications);

      const resultData = insertAnalysisResultSchema.parse({
        totalEmailsAnalyzed: totalCommunications,
        analysisResult: analysisResult,
        confidence: 85,
        isActive: true,
        departments: filters.departments || null,
        countries: filters.countries || null,
        dateFrom,
        dateTo
      });

      await storage.createAnalysisResult(resultData);

      await storage.updateAnalysisProgress(progressId, {
        status: 'completed',
        progress: 100
      });

    } catch (error) {
      console.error("Analysis process error:", error);
      await storage.updateAnalysisProgress(progressId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
