import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from './db';
import { sql } from 'drizzle-orm';

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API para inserir contratantes via backend PostgreSQL
  app.post("/api/contratantes", async (req, res) => {
    try {
      const { value, label } = req.body;
      
      // Inserir contratante via SQL direto no PostgreSQL
      await db.execute(sql`
        INSERT INTO code_options (category, value, label, is_active) 
        VALUES ('contratantes', ${value}, ${label}, true)
        ON CONFLICT (category, value) DO UPDATE SET 
          label = EXCLUDED.label,
          is_active = EXCLUDED.is_active
      `);
      
      res.json({ success: true, message: 'Contratante adicionado com sucesso' });
    } catch (error) {
      console.error('Error inserting contratante:', error);
      res.status(500).json({ success: false, error: 'Erro ao inserir contratante' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}