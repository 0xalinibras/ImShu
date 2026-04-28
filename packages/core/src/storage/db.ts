import Database from "bun:sqlite";
import path from "path";
import fs from "fs";

//TODO: get the pathFile from config
const dbPath = path.join(process.cwd(), "data", "tempFiles.db");

// Ensure the data directory exists
fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });

export const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS temps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ext TEXT NOT NULL,
    dirPath TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    expiresAt INTEGER NOT NULL,
    tags TEXT,
    status TEXT NOT NULL
);
`);
