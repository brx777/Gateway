import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertPaymentMethodSchema, insertTransactionSchema, insertMerchantSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ===== Payment Methods Routes ===== 
  app.get("/api/users/:userId/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Check if user is accessing their own data
      if (req.user?.claims?.sub !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const paymentMethods = await storage.getPaymentMethods(userId);
      res.json({ paymentMethods });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/payment-methods", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPaymentMethodSchema.extend({
        cardNumber: z.string().min(13).max(19)
      }).parse(req.body);
      
      // Ensure user can only create payment methods for themselves
      if (req.user?.claims?.sub !== validatedData.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const paymentMethod = await storage.createPaymentMethod(validatedData);
      res.json({ paymentMethod });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/payment-methods/:id", isAuthenticated, async (req, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      
      // Check if user owns this payment method
      if (req.user?.claims?.sub !== paymentMethod.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const deleted = await storage.deletePaymentMethod(paymentMethodId);
      if (deleted) {
        res.json({ message: "Payment method deleted successfully" });
      } else {
        res.status(404).json({ message: "Payment method not found" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== Transaction Routes =====
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transactions = await storage.getTransactions(userId);
      res.json({ transactions });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Ensure user can only create transactions for themselves
      if (req.user?.claims?.sub !== validatedData.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const transaction = await storage.createTransaction(validatedData);
      
      // Simulate payment processing (async)
      setTimeout(async () => {
        const success = Math.random() > 0.2; // 80% success rate
        const newStatus = success ? 'completed' : 'failed';
        const gatewayResponse = JSON.stringify({
          success,
          transactionId: transaction.referenceId,
          timestamp: new Date().toISOString(),
          message: success ? 'Payment processed successfully' : 'Payment failed - insufficient funds'
        });
        
        await storage.updateTransactionStatus(transaction.id, newStatus, gatewayResponse);
      }, 2000);
      
      res.json({ transaction });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== Merchant Routes =====
  app.get("/api/merchants", isAuthenticated, async (req, res) => {
    try {
      const merchants = await storage.getMerchants();
      res.json({ merchants });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/merchants", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMerchantSchema.parse(req.body);
      const merchant = await storage.createMerchant(validatedData);
      res.json({ merchant });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== External Gateway API =====
  app.post("/api/gateway/process-payment", async (req, res) => {
    try {
      const { apiKey, amount, paymentMethod, description, customerEmail } = req.body;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }
      
      const merchant = await storage.getMerchantByApiKey(apiKey);
      if (!merchant) {
        return res.status(401).json({ message: "Invalid API key" });
      }
      
      if (!merchant.isActive) {
        return res.status(403).json({ message: "Merchant account inactive" });
      }
      
      // Simulate external payment processing
      const success = Math.random() > 0.1; // 90% success rate for external API
      const referenceId = `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      setTimeout(() => {
        // In a real implementation, this would trigger a webhook
        console.log(`Webhook would be sent to: ${merchant.webhookUrl}`);
      }, 1000);
      
      res.json({
        success,
        transactionId: referenceId,
        status: success ? 'completed' : 'failed',
        amount,
        currency: 'BRL',
        message: success ? 'Payment processed successfully' : 'Payment failed',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}