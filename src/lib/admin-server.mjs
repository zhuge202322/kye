import { cookies } from 'next/headers';

import { verifySessionToken } from './admin-auth.mjs';

export const SESSION_COOKIE = 'kye_admin_session';

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

export function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, sessionSecret());
}

export function unauthorized() {
  return Response.json({ error: '请先登录后台。' }, { status: 401 });
}
