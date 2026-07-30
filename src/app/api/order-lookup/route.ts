import { findOrderByContractNumber } from '@/lib/content-store.mjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const contractNumber = String(body.contractNumber ?? '').trim();
  if (contractNumber.length < 3 || contractNumber.length > 100) {
    return Response.json({ error: 'Please enter a valid contract number.' }, { status: 400 });
  }

  const order = await findOrderByContractNumber(contractNumber);
  if (!order) return Response.json({ error: 'Order not found.' }, { status: 404 });

  return Response.json({ order }, { headers: { 'Cache-Control': 'no-store' } });
}
