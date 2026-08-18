const baseUrl = process.env.QA_BASE_URL || process.env.E2E_BASE_URL || 'http://localhost:3000';
const requireRuntimeMetadata = process.env.REQUIRE_RUNTIME_METADATA === '1';

function mask(value) {
  if (!value || typeof value !== 'string') return null;
  if (value.length <= 10) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 6)}***${value.slice(-4)}`;
}

async function http(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: {
      'cache-control': 'no-cache',
    },
  });

  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}

  return {
    status: response.status,
    ok: response.ok,
    text,
    json,
  };
}

async function firstOk(paths) {
  const responses = [];

  for (const pathname of paths) {
    const response = await http(pathname);
    responses.push({ pathname, response });
    if (response.ok && response.text.includes('GanaConMerito')) {
      return { pathname, response, responses };
    }
  }

  return { pathname: paths[0], response: responses[0]?.response, responses };
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractBuildMetadata(html) {
  const commitMatch =
    html.match(/Commit desplegado:\s*<code>([^<]+)<\/code>/i) ||
    html.match(/Build<\/strong>:\s*<code>([^<]+)<\/code>/i);
  const buildTimeMatch =
    html.match(/Build time:\s*<code>([^<]+)<\/code>/i) ||
    html.match(/Built at<\/strong>:\s*<code>([^<]+)<\/code>/i);

  return {
    commit: commitMatch?.[1]?.trim() || null,
    buildTime: buildTimeMatch?.[1]?.trim() || null,
  };
}

(async function main() {
  const runtimePage = await firstOk(['/login', '/home']);
  const login = runtimePage.response;
  ensure(login?.ok, `GET /login o /home falló. Status inicial: ${login?.status ?? 'sin respuesta'}.`);
  ensure(login.text.includes('GanaConMerito'), `El runtime no devolvió la marca esperada en ${runtimePage.pathname}.`);

  const metadata = extractBuildMetadata(login.text);
  ensure(metadata.commit, `No se encontró commit visible en ${runtimePage.pathname}.`);
  ensure(metadata.buildTime, `No se encontró buildTime visible en ${runtimePage.pathname}.`);

  if (requireRuntimeMetadata) {
    ensure(metadata.commit !== 'unknown', 'El commit visible quedó en "unknown".');
    ensure(metadata.buildTime !== 'unknown', 'El buildTime visible quedó en "unknown".');
  }

  const publicConfig = await http('/api/auth/public-config');
  ensure(publicConfig.ok, `GET /api/auth/public-config falló con status ${publicConfig.status}.`);
  ensure(publicConfig.json?.supabaseUrl, 'La ruta /api/auth/public-config no devolvió supabaseUrl.');
  ensure(publicConfig.json?.supabaseAnonKey, 'La ruta /api/auth/public-config no devolvió supabaseAnonKey.');

  const result = {
    ok: true,
    baseUrl,
    checks: {
      login: {
        pathname: runtimePage.pathname,
        status: login.status,
        commit: metadata.commit,
        buildTime: metadata.buildTime,
      },
      publicConfig: {
        status: publicConfig.status,
        supabaseUrlHost: (() => {
          try {
            return new URL(publicConfig.json.supabaseUrl).host;
          } catch {
            return null;
          }
        })(),
        supabaseAnonKeyMasked: mask(publicConfig.json.supabaseAnonKey),
      },
    },
  };

  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    baseUrl,
    error: error.message,
  }, null, 2));
  process.exit(1);
});
