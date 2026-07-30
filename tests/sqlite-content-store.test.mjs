import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { createSqliteContentStore } from '../src/lib/sqlite-content-store.mjs';

function fixture() {
  return {
    version: 1,
    updatedAt: null,
    site: { name: 'Lan Chuang', logo: '/logo.jpg', email: 'info@example.com' },
    categories: [{ id: 'bolt', name: 'Bolt', image: '/bolt.jpg' }],
    products: [{ id: 'hex', categoryId: 'bolt', name: 'Hex Bolt', thumbnail: '/hex.jpg', descriptionHtml: '' }],
    contacts: [{ id: 'sales', name: 'Sales', displayNumber: '+86 1000', whatsappNumber: '861000' }],
    socials: [{ id: 'facebook', label: 'Facebook', url: '' }],
    images: [{ id: 'home.hero.1', group: 'Home', label: 'Hero', url: '/hero.jpg' }],
    orders: [{ id: 'order-1', contractNumber: 'LC-2026-001', status: 'in_production', progress: 40, note: 'In production', updatedAt: '2026-07-30T00:00:00.000Z' }],
  };
}

test('SQLite store persists site content and orders across reopen', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'kye-sqlite-'));
  const databasePath = path.join(directory, 'content.sqlite');
  try {
    const first = createSqliteContentStore({ databasePath, getDefaultContent: async () => fixture() });
    const initial = await first.readContent();
    assert.equal(initial.orders[0].contractNumber, 'LC-2026-001');

    initial.site.name = 'Updated Site';
    initial.orders[0].progress = 75;
    await first.writeContent(initial);
    first.close();

    const second = createSqliteContentStore({ databasePath, getDefaultContent: async () => { throw new Error('must not reseed'); } });
    const persisted = await second.readContent();
    assert.equal(persisted.site.name, 'Updated Site');
    assert.equal(persisted.orders[0].progress, 75);
    assert.equal((await second.findOrderByContractNumber(' lc-2026-001 '))?.status, 'in_production');
    second.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('SQLite store imports a legacy JSON content file on first start', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'kye-sqlite-migrate-'));
  const databasePath = path.join(directory, 'content.sqlite');
  const legacyJsonPath = path.join(directory, 'site-content.json');
  try {
    const legacy = fixture();
    legacy.site.name = 'Imported Legacy Site';
    await writeFile(legacyJsonPath, JSON.stringify(legacy), 'utf8');

    const store = createSqliteContentStore({ databasePath, legacyJsonPath, getDefaultContent: async () => fixture() });
    const imported = await store.readContent();
    assert.equal(imported.site.name, 'Imported Legacy Site');
    assert.equal(imported.orders.length, 1);
    store.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
