import sqlite3 from "sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "tradevision_ai.db");

let db: sqlite3.Database;

export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
      else {
        console.log("Connected to SQLite database");
        createTables()
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
}

function createTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Predictions table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS predictions (
          id TEXT PRIMARY KEY,
          timestamp DATETIME,
          pair TEXT,
          timeframe TEXT,
          current_price REAL,
          candle_number INTEGER,
          bias TEXT,
          confidence INTEGER,
          bullish_score INTEGER,
          bearish_score INTEGER,
          evidence_json TEXT,
          explanation TEXT,
          supporting_evidence_json TEXT,
          conflicting_evidence_json TEXT,
          data_status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) reject(err);
        }
      );

      // Prediction results table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS prediction_results (
          id TEXT PRIMARY KEY,
          prediction_id TEXT,
          actual_bias TEXT,
          correct BOOLEAN,
          actual_candle_json TEXT,
          recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prediction_id) REFERENCES predictions(id)
        )
      `,
        (err) => {
          if (err) reject(err);
        }
      );

      // Paper trades table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS paper_trades (
          id TEXT PRIMARY KEY,
          prediction_id TEXT,
          pair TEXT,
          direction TEXT,
          quantity INTEGER,
          entry_price REAL,
          entry_time DATETIME,
          exit_price REAL,
          exit_time DATETIME,
          stop_loss REAL,
          take_profit REAL,
          profit_loss REAL,
          status TEXT,
          exit_reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prediction_id) REFERENCES predictions(id)
        )
      `,
        (err) => {
          if (err) reject(err);
        }
      );

      // Candle cache table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS candle_cache (
          id TEXT PRIMARY KEY,
          pair TEXT,
          timeframe TEXT,
          timestamp DATETIME,
          open REAL,
          high REAL,
          low REAL,
          close REAL,
          volume INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(pair, timeframe, timestamp)
        )
      `,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
}

export function getDatabase(): sqlite3.Database {
  return db;
}

export function runQuery(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery(query: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(query: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
