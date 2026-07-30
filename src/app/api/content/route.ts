import { readContent } from '@/lib/content-store.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await readContent();
  return Response.json(content, { headers: { 'Cache-Control': 'no-store' } });
}
