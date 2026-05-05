/**
 * Copia le creature da PocketBase locale → remoto
 *
 * Uso:
 *   npx tsx scripts/migrate.ts <remote-url> <remote-email> <remote-password>
 *
 * Esempio:
 *   npx tsx scripts/migrate.ts http://77.42.127.29:8090 admin@example.com secret
 *
 * Il PocketBase locale deve girare su http://localhost:8090
 */

const [,, remoteUrl = 'http://77.42.127.29:8090', email, password] = process.argv;
const localUrl = 'http://localhost:8090';

if (!email || !password) {
  console.error('Uso: npx tsx scripts/migrate.ts <remote-url> <remote-email> <remote-password>');
  process.exit(1);
}

async function authenticate(baseUrl: string, em: string, pw: string): Promise<string> {
  // Prova endpoint v0.23+ prima, poi fallback v0.22
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

async function main() {
  // 1. Autenticazione remoto
  console.log(`Autenticazione su remoto ${remoteUrl}...`);
  const remoteToken = await authenticate(remoteUrl, email, password);
  console.log('✓ Autenticato sul remoto');

  // 2. Leggi creature dal locale (senza auth se le regole lo permettono, altrimenti chiedi)
  console.log(`\nLettura creature da ${localUrl}...`);
  let localToken = '';
  try {
    localToken = await authenticate(localUrl, email, password);
    console.log('✓ Autenticato sul locale');
  } catch {
    console.log('⚠ Locale non richiede auth, continuo senza token');
  }

  const localHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  if (localToken) localHeaders['Authorization'] = localToken;

  const fetchRes = await fetch(`${localUrl}/api/collections/creatures/records?perPage=500`, {
    headers: localHeaders,
  });
  if (!fetchRes.ok) {
    console.error('Lettura locale fallita:', await fetchRes.text());
    process.exit(1);
  }
  const { items } = await fetchRes.json() as { items: Record<string, unknown>[] };
  console.log(`✓ Trovate ${items.length} creature`);

  if (!items.length) {
    console.log('Nessuna creatura da migrare.');
    process.exit(0);
  }

  // 3. Assicurati che la collection esista sul remoto
  const remoteHeaders = { 'Content-Type': 'application/json', 'Authorization': remoteToken };
  const text = (name: string, required = false) => ({ name, type: 'text', required, options: {} });
  const schema = [
    text('nome', true),
    { name: 'tipo', type: 'select', required: true, options: { maxSelect: 1, values: ['comune', 'non-comune', 'raro', 'boss', 'tamabile'] } },
    text('icona'), text('dungeon'), text('hp'), text('danno'),
    text('salute'), text('stamina'), text('mana'),
    text('str'), text('dex'), text('int'), text('ar'),
    text('fuoco'), text('freddo'), text('energia'), text('veleno'),
    text('psionico'), text('sacro'), text('malefico'), text('magia'),
    text('drop'), text('strategia'), text('resistenze'),
    { name: 'tamabile', type: 'bool', required: false, options: {} },
  ];

  const collCheck = await fetch(`${remoteUrl}/api/collections/creatures`, { headers: remoteHeaders });
  if (collCheck.ok) {
    console.log('\n⚠ Collection "creatures" già esistente sul remoto — salto creazione');
  } else {
    console.log('\nCreazione collection "creatures" sul remoto...');
    const collRes = await fetch(`${remoteUrl}/api/collections`, {
      method: 'POST', headers: remoteHeaders,
      body: JSON.stringify({ name: 'creatures', type: 'base', schema }),
    });
    if (!collRes.ok) {
      console.error('Creazione collection fallita:', await collRes.text());
      process.exit(1);
    }
    console.log('✓ Collection creata');
  }

  // 4. Importa i record
  console.log(`\nImportazione ${items.length} creature sul remoto...`);
  let ok = 0, fail = 0;
  const skip = new Set(['id', 'collectionId', 'collectionName', 'created', 'updated']);

  for (const c of items) {
    const body: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(c)) {
      if (!skip.has(k)) body[k] = v;
    }

    const res = await fetch(`${remoteUrl}/api/collections/creatures/records`, {
      method: 'POST', headers: remoteHeaders, body: JSON.stringify(body),
    });
    if (res.ok) {
      ok++;
      console.log(`  ✓ ${c['nome']}`);
    } else {
      fail++;
      console.error(`  ✗ ${c['nome']}:`, await res.text());
    }
  }

  console.log(`\n✓ Completato: ${ok} importate, ${fail} errori`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
