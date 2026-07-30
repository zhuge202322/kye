import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/admin-auth.mjs';
import { adminPassword, isAdminAuthenticated, SESSION_COOKIE, sessionSecret } from '@/lib/admin-server.mjs';

export async function GET() {
  return Response.json({ authenticated: await isAdminAuthenticated(), configured: Boolean(adminPassword() && sessionSecret()) });
}

export async function POST(request: Request) {
  const configuredPassword = adminPassword();
  const secret = sessionSecret();
  if (!configuredPassword || !secret) return Response.json({ error: '后台密码尚未配置。' }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  if (body.password !== configuredPassword) return Response.json({ error: '密码不正确。' }, { status: 401 });

  (await cookies()).set(SESSION_COOKIE, createSessionToken(secret), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 8 * 60 * 60,
  });
  return Response.json({ authenticated: true });
}

export async function DELETE() {
  (await cookies()).set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return Response.json({ authenticated: false });
}
