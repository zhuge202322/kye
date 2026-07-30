import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

import { validateContent } from './content-domain.mjs';

function hydrateOrder(row) {
  return {
    id: row.id,
    contractNumber: row.contract_number,
    status: row.status,
    progress: row.progress,
    note: row.note,
    updatedAt: row.updated_at,
  };
}

export function createSqliteContentStore({ databasePath, legacyJsonPath, getDefaultContent }) {
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.pragma('synchronous = NORMAL');
  database.pragma('busy_timeout = 5000');
  database.exec(`
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      contract_number TEXT NOT NULL COLLATE NOCASE UNIQUE,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL CHECK (progress BETWEEN 0 AND 100),
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_orders_contract_number ON orders(contract_number COLLATE NOCASE);
  `);

  const readSite = database.prepare('SELECT content_json FROM site_content WHERE id = 1');
  const readOrders = database.prepare('SELECT id, contract_number, status, progress, note, updated_at FROM orders ORDER BY position ASC');
  const readOrder = database.prepare('SELECT id, contract_number, status, progress, note, updated_at FROM orders WHERE contract_number = ? COLLATE NOCASE');
  const upsertSite = database.prepare(`
    INSERT INTO site_content (id, content_json, updated_at) VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET content_json = excluded.content_json, updated_at = excluded.updated_at
  `);
  const clearOrders = database.prepare('DELETE FROM orders');
  const insertOrder = database.prepare(`
    INSERT INTO orders (id, contract_number, status, progress, note, updated_at, position)
    VALUES (@id, @contractNumber, @status, @progress, @note, @updatedAt, @position)
  `);

  const persist = database.transaction((content) => {
    const siteContent = structuredClone(content);
    delete siteContent.orders;
    upsertSite.run(JSON.stringify(siteContent), content.updatedAt || new Date().toISOString());
    clearOrders.run();
    content.orders.forEach((order, position) => insertOrder.run({ ...order, position }));
  });

  let initialization;
  function initialize() {
    if (!initialization) {
      initialization = (async () => {
        if (readSite.get()) return;
        let seed;
        if (legacyJsonPath && existsSync(legacyJsonPath)) {
          seed = JSON.parse(readFileSync(legacyJsonPath, 'utf8'));
        } else {
          seed = await getDefaultContent();
        }
        seed.orders ??= [];
        const validation = validateContent(seed);
        if (!validation.ok) throw new Error(`Initial content is invalid: ${validation.errors.join(' ')}`);
        persist(seed);
      })();
    }
    return initialization;
  }

  return {
    async readContent() {
      await initialize();
      const siteRow = readSite.get();
      if (!siteRow) throw new Error('Site content has not been initialized.');
      return { ...JSON.parse(siteRow.content_json), orders: readOrders.all().map(hydrateOrder) };
    },

    async writeContent(content) {
      await initialize();
      const validation = validateContent(content);
      if (!validation.ok) throw new Error(validation.errors.join(' '));
      const next = { ...structuredClone(content), version: 1, updatedAt: new Date().toISOString() };
      persist(next);
      return next;
    },

    async findOrderByContractNumber(contractNumber) {
      await initialize();
      const normalized = String(contractNumber ?? '').trim();
      if (!normalized) return null;
      const row = readOrder.get(normalized);
      return row ? hydrateOrder(row) : null;
    },

    close() {
      database.close();
    },
  };
}
