import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveUploadDirectory } from '../src/lib/upload-storage.mjs';

test('upload directory uses the configured persistent path', () => {
  assert.equal(resolveUploadDirectory('/var/lib/kye/uploads', '/app'), '/var/lib/kye/uploads');
});

test('upload directory falls back to public/uploads for local development', () => {
  assert.match(resolveUploadDirectory('', 'D:/project'), /public[\\/]uploads$/);
});
