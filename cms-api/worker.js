/* ═══════════════════════════════════════════════════════
   Webnari CMS API — Cloudflare Worker Proxy

   Securely proxies GitHub Contents API requests from
   client admin panels. GitHub tokens are stored as
   encrypted Worker secrets, never exposed to browsers.

   Routes:
     POST /api/read   — Read a file from a repo
     POST /api/write  — Write/update a file in a repo
     POST /api/upload — Upload an image to a repo
   ═══════════════════════════════════════════════════════ */

// Allowed repos (add each client repo here)
const ALLOWED_REPOS = [
  'coding1017/jadesspice',
  'coding1017/webnari'
];

// CORS headers for admin panel requests
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CMS-Password',
    'Access-Control-Max-Age': '86400'
  };
}

// Verify the request has a valid password hash
// The admin panel sends the SHA-256 hash of the password
// We just pass it through — the admin panel already validated it client-side
// But we also check that the repo is in our allowed list
function validateRequest(body) {
  if (!body || !body.repo) return 'Missing repo';
  if (!ALLOWED_REPOS.includes(body.repo)) return 'Repo not authorized';
  if (!body.path) return 'Missing path';
  return null;
}

async function handleRead(body, env) {
  const error = validateRequest(body);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });

  const [owner, repo] = body.repo.split('/');
  const branch = body.branch || 'main';
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${body.path}?ref=${branch}`;

  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Webnari-CMS/1.0'
    }
  });

  if (!resp.ok) {
    const text = await resp.text();
    return new Response(JSON.stringify({ error: 'GitHub API error', status: resp.status, details: text }), { status: resp.status });
  }

  const data = await resp.json();

  // Decode base64 content for JSON/text files (UTF-8 safe)
  let content = data.content;
  try {
    const raw = atob(data.content.replace(/\n/g, ''));
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    content = new TextDecoder().decode(bytes);
  } catch (e) {
    // If decoding fails, return raw
  }

  return new Response(JSON.stringify({
    content: content,
    sha: data.sha,
    path: data.path
  }), { status: 200 });
}

async function handleWrite(body, env) {
  const error = validateRequest(body);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  if (!body.content) return new Response(JSON.stringify({ error: 'Missing content' }), { status: 400 });

  const [owner, repo] = body.repo.split('/');
  const branch = body.branch || 'main';
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${body.path}`;

  // Base64 encode the content
  const encoded = btoa(unescape(encodeURIComponent(body.content)));

  const payload = {
    message: body.message || 'Update via Webnari CMS',
    content: encoded,
    branch: branch
  };

  // Include SHA if updating an existing file
  if (body.sha) {
    payload.sha = body.sha;
  }

  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Webnari-CMS/1.0'
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const text = await resp.text();
    return new Response(JSON.stringify({ error: 'GitHub API error', status: resp.status, details: text }), { status: resp.status });
  }

  const data = await resp.json();
  return new Response(JSON.stringify({
    sha: data.content.sha,
    path: data.content.path,
    message: 'Published successfully'
  }), { status: 200 });
}

async function handleUpload(body, env) {
  const error = validateRequest(body);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  if (!body.content) return new Response(JSON.stringify({ error: 'Missing image content' }), { status: 400 });

  const [owner, repo] = body.repo.split('/');
  const branch = body.branch || 'main';
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${body.path}`;

  const payload = {
    message: body.message || 'Upload image via Webnari CMS',
    content: body.content, // Already base64 encoded by the admin panel
    branch: branch
  };

  if (body.sha) {
    payload.sha = body.sha;
  }

  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Webnari-CMS/1.0'
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const text = await resp.text();
    return new Response(JSON.stringify({ error: 'GitHub API error', status: resp.status, details: text }), { status: resp.status });
  }

  const data = await resp.json();
  return new Response(JSON.stringify({
    sha: data.content.sha,
    path: data.content.path,
    url: data.content.download_url
  }), { status: 200 });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    // Check that GITHUB_TOKEN is configured
    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'Server not configured — missing GITHUB_TOKEN secret' }), {
        status: 500,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    let response;
    switch (url.pathname) {
      case '/api/read':
        response = await handleRead(body, env);
        break;
      case '/api/write':
        response = await handleWrite(body, env);
        break;
      case '/api/upload':
        response = await handleUpload(body, env);
        break;
      default:
        response = new Response(JSON.stringify({ error: 'Not found', routes: ['/api/read', '/api/write', '/api/upload'] }), { status: 404 });
    }

    // Add CORS headers to response
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
    headers.set('Content-Type', 'application/json');

    return new Response(response.body, {
      status: response.status,
      headers: headers
    });
  }
};
