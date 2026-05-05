/**
 * Aggiunge il campo "accettato" alla collection users e imposta le API rules
 *
 * Uso:
 *   npx tsx scripts/setup-accettato.ts <pb-url> <admin-email> <admin-password>
 */

const [,, pbUrl = 'http://77.42.127.29:8090', adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error('Uso: npx tsx scripts/setup-accettato.ts <url> <admin-email> <admin-password>');
  process.exit(1);
}

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

  // Leggi la collection users corrente
  const collRes = await fetch(`${pbUrl}/api/collections/users`, { headers });
  if (!collRes.ok) {
    console.error('Lettura collection fallita:', await collRes.text());
    process.exit(1);
  }
  const coll = await collRes.json() as { schema: unknown[] };

  // Controlla se accettato esiste già
  const schema = coll.schema || [];
  const hasAccettato = (schema as { name: string }[]).some(f => f.name === 'accettato');

  const newSchema = hasAccettato
    ? schema
    : [...schema, { name: 'accettato', type: 'bool', required: false, options: {} }];

  // Aggiorna collection con campo + API rules
  const patchRes = await fetch(`${pbUrl}/api/collections/users`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      schema: newSchema,
      listRule: '@request.auth.username = "gabbadmin"',
      viewRule: '@request.auth.username = "gabbadmin"',
      createRule: '',
      updateRule: '@request.auth.username = "gabbadmin"',
      deleteRule: '@request.auth.username = "gabbadmin"',
    }),
  });

  if (!patchRes.ok) {
    console.error('Aggiornamento collection fallito:', await patchRes.text());
    process.exit(1);
  }
  console.log('✓ Campo "accettato" e regole API aggiornate');

  // Imposta accettato: true su gabbadmin
  const usersRes = await fetch(`${pbUrl}/api/collections/users/records`, { headers });
  if (usersRes.ok) {
    const { items } = await usersRes.json() as { items: { id: string; username: string }[] };
    const admin = items.find(u => u.username === 'gabbadmin');
    if (admin) {
      await fetch(`${pbUrl}/api/collections/users/records/${admin.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ accettato: true }),
      });
      console.log('✓ gabbadmin impostato come accettato');
    }
  }

  console.log('\n✓ Completato!');
}

main().catch(err => { console.error(err); process.exit(1); });
