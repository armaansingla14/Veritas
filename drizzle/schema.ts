import { sqliteTable, text, real, integer, blob } from "drizzle-orm/sqlite-core";

// Reports table for civic issue reporting
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  type: text("type", {
    enum: ["pothole", "noise", "parking", "graffiti", "streetlight", "sidewalk", "other"],
  }).notNull(),
  description: text("description").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  photoUrl: text("photo_url"),
  status: text("status", {
    enum: ["new", "acknowledged", "in_progress", "resolved"],
  }).notNull().default("new"),
  severity: text("severity", {
    enum: ["low", "medium", "high"],
  }).notNull().default("medium"),
  suggestedDepartment: text("suggested_department"),
  triageExplanation: text("triage_explanation"),
  triageTitle: text("triage_title"),
  sessionId: text("session_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Documents table for RAG
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  embedding: blob("embedding", { mode: "json" }).$type<number[]>(),
});

// Audit log for trust layer
export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actionType: text("action_type", { enum: ["qa", "report"] }).notNull(),
  payload: text("payload").notNull(), // JSON string
  prevHash: text("prev_hash"),
  hash: text("hash").notNull(),
  solanaTxSignature: text("solana_tx_signature"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Type exports
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
