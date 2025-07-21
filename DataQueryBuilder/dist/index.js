// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  paymentMethods;
  transactions;
  merchants;
  currentUserId;
  currentPaymentMethodId;
  currentTransactionId;
  currentMerchantId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.paymentMethods = /* @__PURE__ */ new Map();
    this.transactions = /* @__PURE__ */ new Map();
    this.merchants = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentPaymentMethodId = 1;
    this.currentTransactionId = 1;
    this.currentMerchantId = 1;
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = {
      ...insertUser,
      id,
      fullName: insertUser.fullName || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  // Payment method operations
  async getPaymentMethods(userId) {
    return Array.from(this.paymentMethods.values()).filter((pm) => pm.userId === userId);
  }
  async getPaymentMethod(id) {
    return this.paymentMethods.get(id);
  }
  async createPaymentMethod(data) {
    const id = this.currentPaymentMethodId++;
    const maskedCardNumber = data.cardNumber ? "**** **** **** " + data.cardNumber.slice(-4) : null;
    const paymentMethod = {
      ...data,
      id,
      userId: data.userId || null,
      cardHolderName: data.cardHolderName || null,
      expiryMonth: data.expiryMonth || null,
      expiryYear: data.expiryYear || null,
      cardNumber: maskedCardNumber,
      isDefault: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.paymentMethods.set(id, paymentMethod);
    return paymentMethod;
  }
  async deletePaymentMethod(id) {
    return this.paymentMethods.delete(id);
  }
  // Transaction operations
  async getTransactions(userId) {
    const allTransactions = Array.from(this.transactions.values());
    if (userId) {
      return allTransactions.filter((t) => t.userId === userId);
    }
    return allTransactions;
  }
  async getTransaction(id) {
    return this.transactions.get(id);
  }
  async getTransactionByReference(referenceId) {
    return Array.from(this.transactions.values()).find((t) => t.referenceId === referenceId);
  }
  async createTransaction(insertTransaction) {
    const id = this.currentTransactionId++;
    const referenceId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      ...insertTransaction,
      id,
      userId: insertTransaction.userId || null,
      paymentMethodId: insertTransaction.paymentMethodId || null,
      currency: insertTransaction.currency || "BRL",
      description: insertTransaction.description || null,
      referenceId,
      status: "pending",
      gatewayResponse: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  async updateTransactionStatus(id, status, gatewayResponse) {
    const transaction = this.transactions.get(id);
    if (!transaction) return void 0;
    const updatedTransaction = {
      ...transaction,
      status,
      gatewayResponse: gatewayResponse || null,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  // Merchant operations
  async getMerchants() {
    return Array.from(this.merchants.values());
  }
  async getMerchant(id) {
    return this.merchants.get(id);
  }
  async getMerchantByApiKey(apiKey) {
    return Array.from(this.merchants.values()).find((m) => m.apiKey === apiKey);
  }
  async createMerchant(insertMerchant) {
    const id = this.currentMerchantId++;
    const apiKey = `pk_${Math.random().toString(36).substr(2, 32)}`;
    const merchant = {
      ...insertMerchant,
      id,
      apiKey,
      webhookUrl: insertMerchant.webhookUrl || null,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.merchants.set(id, merchant);
    return merchant;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow()
});
var paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(),
  // 'credit_card', 'debit_card', 'pix', 'boleto'
  cardNumber: text("card_number"),
  // masked for security
  cardHolderName: text("card_holder_name"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  status: varchar("status", { length: 20 }).notNull(),
  // 'pending', 'processing', 'completed', 'failed', 'cancelled'
  description: text("description"),
  referenceId: text("reference_id").unique(),
  gatewayResponse: text("gateway_response"),
  // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  apiKey: text("api_key").notNull().unique(),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true
});
var insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  userId: true,
  type: true,
  cardHolderName: true,
  expiryMonth: true,
  expiryYear: true
});
var insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  paymentMethodId: true,
  amount: true,
  currency: true,
  description: true
});
var insertMerchantSchema = createInsertSchema(merchants).pick({
  name: true,
  email: true,
  webhookUrl: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const user = await storage.createUser(validatedData);
      res.json({ user: { ...user, password: void 0 } });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, password: void 0 } });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/users/:userId/payment-methods", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const paymentMethods2 = await storage.getPaymentMethods(userId);
      res.json({ paymentMethods: paymentMethods2 });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/payment-methods", async (req, res) => {
    try {
      const validatedData = insertPaymentMethodSchema.extend({
        cardNumber: z.string().min(16).max(19)
      }).parse(req.body);
      const paymentMethod = await storage.createPaymentMethod(validatedData);
      res.json({ paymentMethod });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/payment-methods/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePaymentMethod(id);
      if (!success) {
        return res.status(404).json({ message: "Payment method not found" });
      }
      res.json({ message: "Payment method deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const transactions2 = await storage.getTransactions(userId);
      res.json({ transactions: transactions2 });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ transaction });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const paymentMethod = await storage.getPaymentMethod(validatedData.paymentMethodId);
      if (!paymentMethod || paymentMethod.userId !== validatedData.userId) {
        return res.status(400).json({ message: "Invalid payment method" });
      }
      const transaction = await storage.createTransaction(validatedData);
      setTimeout(async () => {
        const success = Math.random() > 0.2;
        const status = success ? "completed" : "failed";
        const gatewayResponse = JSON.stringify({
          processed_at: (/* @__PURE__ */ new Date()).toISOString(),
          gateway_transaction_id: `GTW_${Math.random().toString(36).substr(2, 12)}`,
          status,
          message: success ? "Payment processed successfully" : "Payment processing failed"
        });
        await storage.updateTransactionStatus(transaction.id, status, gatewayResponse);
      }, 2e3);
      res.json({ transaction });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, gatewayResponse } = req.body;
      const transaction = await storage.updateTransactionStatus(id, status, gatewayResponse);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ transaction });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/merchants", async (req, res) => {
    try {
      const merchants2 = await storage.getMerchants();
      res.json({ merchants: merchants2 });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/merchants", async (req, res) => {
    try {
      const validatedData = insertMerchantSchema.parse(req.body);
      const existingMerchant = await storage.getMerchantByApiKey(validatedData.email);
      if (existingMerchant) {
        return res.status(400).json({ message: "Merchant email already registered" });
      }
      const merchant = await storage.createMerchant(validatedData);
      res.json({ merchant });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/gateway/process-payment", async (req, res) => {
    try {
      const { apiKey, amount, currency = "BRL", description, paymentMethod } = req.body;
      const merchant = await storage.getMerchantByApiKey(apiKey);
      if (!merchant || !merchant.isActive) {
        return res.status(401).json({ message: "Invalid or inactive API key" });
      }
      const transaction = await storage.createTransaction({
        userId: null,
        // External transaction
        paymentMethodId: null,
        amount: amount.toString(),
        currency,
        description: description || "External payment"
      });
      const success = Math.random() > 0.1;
      const status = success ? "completed" : "failed";
      const gatewayResponse = JSON.stringify({
        merchant_id: merchant.id,
        processed_at: (/* @__PURE__ */ new Date()).toISOString(),
        gateway_transaction_id: `GTW_${Math.random().toString(36).substr(2, 12)}`,
        status,
        message: success ? "Payment processed successfully" : "Payment processing failed",
        payment_method: paymentMethod
      });
      await storage.updateTransactionStatus(transaction.id, status, gatewayResponse);
      res.json({
        transaction_id: transaction.referenceId,
        status,
        amount: transaction.amount,
        currency: transaction.currency,
        processed_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
