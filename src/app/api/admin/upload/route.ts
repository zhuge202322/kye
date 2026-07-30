import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { isAdminAuthenticated, unauthorized } from '@/lib/admin-server.mjs';
import { sanitizeFilename, validateImageSignature, validateUpload } from '@/lib/content-domain.mjs';
import { resolveUploadDirectory } from '@/lib/upload-storage.mjs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return Response.json({ error: '请选择图片。' }, { status: 400 });
  const result = validateUpload(file);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!validateImageSignature(bytes, file.type)) {
    return Response.json({ error: '图片内容与文件格式不匹配，已拒绝上传。' }, { status: 400 });
  }

  const filename = sanitizeFilename(file.name);
  const uploadDirectory = resolveUploadDirectory();
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), bytes);
  return Response.json({ url: `/uploads/${filename}` });
}
