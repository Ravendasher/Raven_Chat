import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Compact message records. Binary media never enters MySQL; only the S3 key,
 * type, size, and message metadata are persisted here.
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: varchar("conversationId", { length: 64 }).notNull(),
  senderKey: varchar("senderKey", { length: 128 }).notNull(),
  kind: mysqlEnum("kind", ["text", "image", "voice"]).notNull(),
  text: text("text"),
  mediaKey: varchar("mediaKey", { length: 512 }),
  mediaName: varchar("mediaName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 128 }),
  byteSize: int("byteSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
