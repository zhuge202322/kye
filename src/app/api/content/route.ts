import { readContent } from '@/lib/content-store.mjs';
import { toPublicContent } from '@/lib/content-domain.mjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await readContent();
  return Response.json(toPublicContent(content), { headers: { 'Cache-Control': 'no-store' } });
}
