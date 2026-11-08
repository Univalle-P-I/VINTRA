const configuredUrl = process.env.VITE_API_URL;

if (!configuredUrl) {
  throw new Error('Configura VITE_API_URL con la URL pública de la API.');
}

const baseUrl = new URL(configuredUrl);
const allowsHttp = process.env.ALLOW_INSECURE_HTTP === 'true';
if (baseUrl.protocol !== 'https:' && !(allowsHttp && baseUrl.protocol === 'http:')) {
  throw new Error('VITE_API_URL debe usar HTTPS salvo en staging con ALLOW_INSECURE_HTTP=true.');
}

const base = baseUrl.toString().replace(/\/+$/, '');
const checks = [
  { path: '/health', valid: (body) => body.status === 'ok' },
  {
    path: '/health/db',
    valid: (body) => body.status === 'ok' && body.database === 'connected',
  },
];

await Promise.all(
  checks.map(async ({ path, valid }) => {
    const response = await fetch(`${base}${path}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`La API devolvió HTTP ${response.status} en ${path}.`);
    }

    const body = await response.json();
    if (!valid(body)) {
      throw new Error(`La respuesta de ${path} no coincide con el contrato esperado.`);
    }
  }),
);

console.log('API y PostgreSQL públicos responden correctamente.');
