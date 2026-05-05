/**
 * Abilita login con username e crea utente admin
 *
 * Uso:
 *   npx tsx scripts/setup-user.ts <pb-url> <admin-email> <admin-password>
 */

const [,, pbUrl = 'http://77.42.127.29:8090', adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error('Uso: npx tsx scripts/setup-user.ts <url> <admin-email> <admin-password>');
  process.exit(1);
}

const NEW_USERNAME = 'gabbadmin';
const NEW_PASSWORD = 'gabbadmin';

async function adminAuth(): Promise<string> {
  for (const endpoint of [
    `${pbUrl}/api/collections/_superusers/auth-with-password`,
    `${pbUrl}/api/admins/auth-with-password`,
  ]) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: adminEmail, email: adminEmail, password: adminPassword }),
    });
    if (res.ok) return ((await res.json()) as { token: string }).token;
  }
  throw new Error('Auth admin fallita');
}

async function main() {
  console.log('Autenticazione admin...');
  const token = await adminAuth();
  const headers = { 'Content-Type': 'application/json', 'Authorization': token };
  console.log('✓ Autenticato');

  // 1. Abilita username auth sulla collection users
  console.log('Abilitazione username auth...');
  const patchRes = await fetch(`${pbUrl}/api/collections/users`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      options: {
        allowUsernameAuth: true,
        allowEmailAuth: false,
        requireEmail: false,
        minPasswordLength: 8,
      }
    }),
  });
  if (!patchRes.ok) {
    console.error('Patch collection fallita:', await patchRes.text());
    process.exit(1);
  }
  console.log('✓ Username auth abilitata');

  // 2. Crea utente
  console.log(`Creazione utente "${NEW_USERNAME}"...`);
  const userRes = await fetch(`${pbUrl}/api/collections/users/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      username: NEW_USERNAME,
      password: NEW_PASSWORD,
      passwordConfirm: NEW_PASSWORD,
      emailVisibility: false,
    }),
  });

  if (userRes.ok) {
    console.log(`✓ Utente "${NEW_USERNAME}" creato`);
  } else {
    const err = await userRes.text();
    if (err.includes('username') && err.includes('unique')) {
      console.log(`⚠ Utente "${NEW_USERNAME}" già esistente`);
    } else {
      console.error('Creazione utente fallita:', err);
      process.exit(1);
    }
  }

  console.log(`\n✓ Fatto! Login con username: ${NEW_USERNAME} / password: ${NEW_PASSWORD}`);
}

main().catch(err => { console.error(err); process.exit(1); });
