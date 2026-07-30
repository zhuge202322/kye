import { isAdminAuthenticated, unauthorized } from '@/lib/admin-server.mjs';
import { readContent, writeContent } from '@/lib/content-store.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  return Response.json(await readContent(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const content = await request.json();
    return Response.json(await writeContent(content));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : '保存失败。' }, { status: 400 });
  }
}
