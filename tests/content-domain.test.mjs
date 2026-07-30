import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCategory,
  deleteCategory,
  createProduct,
  deleteProduct,
  updateSiteSettings,
  validateContent,
  validateUpload,
  validateImageSignature,
} from '../src/lib/content-domain.mjs';
import { createSessionToken, verifySessionToken } from '../src/lib/admin-auth.mjs';

const baseContent = {
  version: 1,
  site: { name: 'Lan Chuang Fasteners', logo: '/img/logo.jpg', email: 'info@example.com' },
  categories: [{ id: 'bolt', name: 'Bolt', image: '/img/bolt.jpg' }],
  products: [{ id: 'hex-bolt', categoryId: 'bolt', name: 'Hex Bolt', thumbnail: '/img/hex.jpg', descriptionHtml: '<p>Strong</p>' }],
  contacts: [{ id: 'sales', name: 'Sales', displayNumber: '+86 1000', whatsappNumber: '861000' }],
  socials: [{ id: 'facebook', label: 'Facebook', url: '' }],
  images: [{ id: 'home.hero.1', group: 'Home', label: 'Hero 1', url: '/img/hero.jpg' }],
};

const clone = () => structuredClone(baseContent);

test('validates a complete content document', () => {
  assert.equal(validateContent(clone()).ok, true);
  const invalid = clone();
  invalid.site.name = '';
  assert.equal(validateContent(invalid).ok, false);
});

test('content validation rejects unsafe links and duplicate identifiers', () => {
  const unsafe = clone();
  unsafe.socials[0].url = 'javascript:alert(1)';
  assert.equal(validateContent(unsafe).ok, false);

  const duplicate = clone();
  duplicate.categories.push({ ...duplicate.categories[0] });
  assert.equal(validateContent(duplicate).ok, false);
});

test('category CRUD rejects duplicate names and categories still in use', () => {
  const withNut = createCategory(clone(), { name: 'Nut', image: '/img/nut.jpg' });
  assert.equal(withNut.categories.length, 2);
  assert.throws(() => createCategory(withNut, { name: ' nut ' }), /already exists/i);
  assert.throws(() => deleteCategory(withNut, 'bolt'), /used by/i);
  assert.equal(deleteCategory(withNut, withNut.categories[1].id).categories.length, 1);
});

test('product CRUD requires an existing category', () => {
  assert.throws(
    () => createProduct(clone(), { categoryId: 'missing', name: 'Bad', thumbnail: '', descriptionHtml: '' }),
    /category/i,
  );
  const created = createProduct(clone(), { categoryId: 'bolt', name: 'Carriage Bolt', thumbnail: '/img/c.jpg', descriptionHtml: '' });
  assert.equal(created.products.length, 2);
  assert.equal(deleteProduct(created, created.products[1].id).products.length, 1);
});

test('site settings update keeps unrelated content', () => {
  const updated = updateSiteSettings(clone(), { name: 'New Name', logo: '/uploads/logo.webp', email: 'sales@example.com' });
  assert.equal(updated.site.name, 'New Name');
  assert.equal(updated.products.length, 1);
});

test('upload validation only allows safe raster images under 8 MB', () => {
  assert.equal(validateUpload({ name: 'factory photo.webp', type: 'image/webp', size: 1024 }).ok, true);
  assert.equal(validateUpload({ name: 'payload.svg', type: 'image/svg+xml', size: 1024 }).ok, false);
  assert.equal(validateUpload({ name: 'photo.jpg.exe', type: 'application/octet-stream', size: 1024 }).ok, false);
  assert.equal(validateUpload({ name: 'large.png', type: 'image/png', size: 9 * 1024 * 1024 }).ok, false);
});

test('uploaded bytes must match a supported raster image signature', () => {
  assert.equal(validateImageSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png'), true);
  assert.equal(validateImageSignature(Buffer.from('MZ executable'), 'image/png'), false);
  assert.equal(validateImageSignature(Buffer.from('<svg></svg>'), 'image/svg+xml'), false);
});

test('admin session tokens are signed and expire', () => {
  const token = createSessionToken('secret', 1_000, 5_000);
  assert.equal(verifySessionToken(token, 'secret', 5_999), true);
  assert.equal(verifySessionToken(token, 'wrong', 5_999), false);
  assert.equal(verifySessionToken(token, 'secret', 6_001), false);
  assert.equal(verifySessionToken(`${token}x`, 'secret', 5_999), false);
});
