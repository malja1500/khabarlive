/**
 * db.ts — Legacy compatibility shim.
 * All data is now stored in SQLite via database.ts
 * This file is kept so old imports do not break during migration.
 */
export * from "./database";
