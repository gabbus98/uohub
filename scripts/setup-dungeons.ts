/**
 * Crea le collection "dungeons" e "dungeon_runs" su PocketBase.
 *
 * Uso:
 *   npx tsx scripts/setup-dungeons.ts <url> <superadmin-email> <superadmin-password>
 *
 * Esempio:
 *   npx tsx scripts/setup-dungeons.ts http://77.42.127.29:8090 admin@example.com secret
 *
 * Nota: usa le credenziali superadmin di PocketBase, non quelle dell'utente del sito.
 */

const [,, remoteUrl = 'http://77.42.127.29:8090', email, password] = process.argv;

if (!email || !password) {
  console.error('Uso: npx tsx scripts/setup-dungeons.ts <url> <email> <password>');
  process.exit(1);
}

async function authenticate(baseUrl: string, em: string, pw: string): Promise<string> {
  for (const endpoint of [
    `${baseUrl}/api/collections/_superusers/auth-with-password`,
    `${baseUrl}/api/admins/auth-with-password`,
  ]) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: em, password: pw, email: em }),
    });
    if (res.ok) {
      const data = await res.json() as { token: string };
      return data.token;
    }
  }
  throw new Error(`Auth fallita su ${baseUrl}`);
}

function toLegacySchema(schema: Record<string, unknown>) {
  const fields = schema['fields'];
  if (!Array.isArray(fields)) return schema;

  const { fields: _, ...rest } = schema;
  return {
    ...rest,
    schema: fields.map(field => ({ ...(field as Record<string, unknown>), options: {} })),
  };
}

async function createCollection(
  baseUrl: string,
  headers: Record<string, string>,
  schema: Record<string, unknown>,
) {
  const modernRes = await fetch(`${baseUrl}/api/collections`, {
    method: 'POST', headers,
    body: JSON.stringify(schema),
  });

  if (modernRes.ok) return modernRes;

  const legacyRes = await fetch(`${baseUrl}/api/collections`, {
    method: 'POST', headers,
    body: JSON.stringify(toLegacySchema(schema)),
  });

  return legacyRes.ok ? legacyRes : modernRes;
}

async function ensureCollection(
  baseUrl: string,
  token: string,
  schema: Record<string, unknown>,
) {
  const name = schema.name as string;
  const headers = { 'Content-Type': 'application/json', Authorization: token };

  const check = await fetch(`${baseUrl}/api/collections/${name}`, { headers });
  if (check.ok) {
    console.log(`Collection "${name}" gia esistente - salto`);
    return;
  }

  console.log(`Creazione collection "${name}"...`);
  const res = await createCollection(baseUrl, headers, schema);

  if (!res.ok) {
    const text = await res.text();
    console.error(`Errore creazione "${name}":`, text);
    process.exit(1);
  }
  console.log(`Collection "${name}" creata`);
}

async function main() {
  console.log(`Autenticazione su ${remoteUrl}...`);
  const token = await authenticate(remoteUrl, email, password);
  console.log('Autenticato\n');

  const authRule = "@request.auth.id != ''";

  await ensureCollection(remoteUrl, token, {
    name: 'dungeons',
    type: 'base',
    listRule: '', viewRule: '',
    createRule: authRule, updateRule: authRule, deleteRule: authRule,
    fields: [
      { name: 'nome', type: 'text', required: true },
      { name: 'descrizione', type: 'text', required: false },
      { name: 'difficolta', type: 'number', required: false },
      { name: 'bauli', type: 'json', required: false },
      { name: 'posizione_mappa', type: 'text', required: false },
      { name: 'screenshot', type: 'text', required: false },
      { name: 'protezione_elementale', type: 'text', required: false },
      { name: 'note', type: 'text', required: false },
    ],
  });

  await ensureCollection(remoteUrl, token, {
    name: 'dungeon_runs',
    type: 'base',
    listRule: '', viewRule: '',
    createRule: authRule, updateRule: authRule, deleteRule: authRule,
    fields: [
      { name: 'dungeon_nome', type: 'text', required: true },
      { name: 'monete', type: 'number', required: false },
      { name: 'pelli', type: 'json', required: false },
      { name: 'tempo', type: 'number', required: false },
      { name: 'pg_count', type: 'number', required: false },
      { name: 'partecipanti', type: 'json', required: false },
      { name: 'data', type: 'text', required: false },
    ],
  });

  console.log('\nSetup completato. Puoi ora usare le funzionalita dungeon dal sito.');
}

main().catch(err => { console.error(err); process.exit(1); });
