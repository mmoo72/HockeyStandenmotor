const BASE = 'https://app.hockeyweerelt.nl';

async function sha1Hex(input) {
  const buf = await globalThis.crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function sanitizePath(p) {
  return p.replace(/[^a-zA-Z0-9\-/]+/g, '');
}

async function getDevice() {
  const uuid = crypto.randomUUID();
  const res = await globalThis.fetch(`${BASE}/device/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ uuid, os: 'Node' }),
  });
  if (!res.ok) throw new Error(`device/register failed: ${res.status}`);
  const data = await res.json();
  return { uuid, token: data.token };
}

async function hapiFetch(path) {
  const device = await getDevice();
  const ts = Math.floor(Date.now() / 1000).toString();
  const sig = await sha1Hex(`${ts}${sanitizePath(path)}${device.uuid.split('').reverse().join('')}`);
  const res = await globalThis.fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-HAPI-Authorization': device.token,
      'X-HAPI-Timestamp': ts,
      'X-HAPI-Signature': sig,
      'X-HAPI-Version': '7',
    },
  });
  const ct = res.headers.get('content-type') || '';
  let body;
  try {
    if (ct.includes('application/json')) body = await res.json();
    else body = await res.text();
  } catch (e) {
    body = await res.text();
  }
  return { status: res.status, ok: res.ok, body };
}

(async () => {
  try {
    const result = await hapiFetch('/poules/182651');
    console.log('STATUS', result.status);
    console.log('OK', result.ok);
    console.log('BODY', typeof result.body === 'string' ? result.body.slice(0, 2000) : JSON.stringify(result.body, null, 2));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
