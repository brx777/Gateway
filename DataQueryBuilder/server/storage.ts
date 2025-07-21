import {
  users,
  paymentMethods,
  transactions,
  merchants,
  type User,
  type UpsertUser,
  type PaymentMethod,
  type InsertPaymentMethod,
  type Transaction,
  type InsertTransaction,
  type Merchant,
  type InsertMerchant,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Payment method operations
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod & { cardNumber: string }): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<boolean>;

  // Transaction operations
  getTransactions(userId?: string): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByReference(referenceId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string, gatewayResponse?: string): Promise<Transaction | undefined>;

  // Merchant operations
  getMerchants(): Promise<Merchant[]>;
  getMerchant(id: number): Promise<Merchant | undefined>;
  getMerchantByApiKey(apiKey: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Payment method operations
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
  }

  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return paymentMethod;
  }

  async createPaymentMethod(data: InsertPaymentMethod & { cardNumber: string }): Promise<PaymentMethod> {
    const maskedCardNumber = data.cardNumber ? "**** **** **** " + data.cardNumber.slice(-4) : null;
    const paymentMethodData = {
      ...data,
      cardNumber: maskedCardNumber,
      isDefault: false,
    };
    
    const [paymentMethod] = await db
      .insert(paymentMethods)
      .values(paymentMethodData)
      .returning();
    return paymentMethod;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return result.rowCount > 0;
  }

  // Transaction operations
  async getTransactions(userId?: string): Promise<Transaction[]> {
    if (userId) {
      return await db.select().from(transactions).where(eq(transactions.userId, userId));
    }
    return await db.select().from(transactions);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionByReference(referenceId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.referenceId, referenceId));
    return transaction;
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const referenceId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const transactionData = {
      ...data,
      referenceId,
      status: 'pending',
    };

    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, gatewayResponse?: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ 
        status, 
        gatewayResponse,
        updatedAt: new Date()
      })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Merchant operations
  async getMerchants(): Promise<Merchant[]> {
    return await db.select().from(merchants);
  }

  async getMerchant(id: number): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.id, id));
    return merchant;
  }

  async getMerchantByApiKey(apiKey: string): Promise<Merchant | undefined> {
    const [merchant] = await db.select().from(merchants).where(eq(merchants.apiKey, apiKey));
    return merchant;
  }

  async createMerchant(data: InsertMerchant): Promise<Merchant> {
    const apiKey = `pk_${Math.random().toString(36).substr(2, 12)}`;
    const merchantData = {
      ...data,
      apiKey,
      isActive: true,
    };

    const [merchant] = await db
      .insert(merchants)
      .values(merchantData)
      .returning();
    return merchant;
  }
}

export const storage = new DatabaseStorage();