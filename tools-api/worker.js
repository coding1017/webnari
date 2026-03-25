// ═══════════════════════════════════════════════════════════════
// Webnari AI Tools API — Cloudflare Worker
// Routes: /api/tools/review-response, /api/tools/seo-content,
//         /api/tools/generate-site
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPTS = {
  'review-response': `You are a reputation manager for local service businesses. Your job is to draft professional, authentic review responses.

RULES:
- Reference specific details from the review — never sound generic or robotic
- Keep responses 2-4 sentences
- For positive reviews (4-5 stars): thank them warmly, highlight something specific they mentioned, invite them back
- For negative reviews (1-3 stars): empathize first, address their specific concern, offer a resolution path, take it offline with a phone number
- Always mention the business name naturally
- Match the requested tone (professional, friendly, or apologetic)
- Do NOT use emojis
- Return ONLY the response text, no quotes, no labels, no explanation`,

  'seo-content': `You are an SEO content specialist for local service businesses. You generate content optimized for local search rankings.

RULES:
- Include city/area names and service keywords naturally — never keyword-stuff
- Match search intent for the target audience
- Use compelling, benefit-driven language
- Follow character limits strictly when specified

When generating META TAGS:
- Title: 50-60 characters, format: "[Service] in [City] | [Business Name]"
- Description: 140-160 characters, include a call-to-action
- Return as JSON: {"title": "...", "description": "...", "keywords": "comma,separated,keywords"}

When generating SERVICE PAGE COPY:
- 300-500 words
- Include H2 headings
- Mention the city/service area 2-3 times naturally
- End with a call-to-action
- Return as plain HTML (h2, p, ul tags)

When generating BLOG POST:
- 500-800 words
- SEO-optimized title + content
- Include the target city naturally
- Return as JSON: {"title": "...", "content": "<html content>"}

When generating SCHEMA MARKUP:
- Valid JSON-LD for LocalBusiness or Service
- Include all provided business details
- Return as a complete <script type="application/ld+json"> block`,

  'generate-site': `You are a website customizer for Webnari, a web agency platform. Given a base HTML template and new client details, you modify the template to create a customized version.

RULES:
- Preserve ALL HTML structure, CSS, animations, JavaScript, and SVG code exactly as-is
- ONLY change these elements:
  1. Business name (in nav, hero, footer, meta tags, schema markup, OG tags)
  2. Phone number (all instances)
  3. CSS color tokens (--yellow/--ice/--blue/--red/etc → new primary color + derived shades)
  4. License number (if provided)
  5. City/service area references
  6. Meta title and description
  7. OG tags (og:title, og:description)
  8. JSON-LD schema markup (business name, phone, address, area)
- Do NOT modify any CSS layout, animations, JavaScript logic, or SVG paths
- Do NOT add or remove HTML sections
- Return the COMPLETE modified HTML document
- No markdown, no code fences, no commentary — just the HTML`
};

function corsHeaders(origin, allowedOrigin) {
  const allowed = !allowedOrigin || allowedOrigin === '*' || origin === allowedOrigin || origin === 'http://localhost:3001';
  return {
    'Access-Control-Allow-Origin': allowed ? (origin || '*') : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Health check
    if (url.pathname === '/api/tools/health') {
      return new Response(JSON.stringify({ status: 'ok', tools: Object.keys(SYSTEM_PROMPTS) }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // Route matching
    const toolMatch = url.pathname.match(/^\/api\/tools\/(review-response|seo-content|generate-site)$/);
    if (!toolMatch || request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Not found. Available: /api/tools/review-response, /api/tools/seo-content, /api/tools/generate-site' }), {
        status: 404, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    const tool = toolMatch[1];
    const systemPrompt = SYSTEM_PROMPTS[tool];

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing "prompt" field' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // Select model — use Haiku for review responses (fast + cheap), Sonnet for the rest
    const model = tool === 'review-response' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-5-20241022';
    const maxTokens = tool === 'generate-site' ? 16000 : 4000;

    // Call Claude API (non-streaming for simplicity)
    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: body.prompt }],
        }),
      });

      if (!claudeRes.ok) {
        const err = await claudeRes.text();
        return new Response(JSON.stringify({ error: 'Claude API error', details: err }), {
          status: 502, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      const result = await claudeRes.json();
      const text = result.content?.[0]?.text || '';

      return new Response(JSON.stringify({
        tool,
        result: text,
        model,
        usage: result.usage,
      }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Worker error', message: err.message }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
  }
};
