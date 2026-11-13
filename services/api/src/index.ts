import { AutoRouter, cors } from 'itty-router';

export interface Env {
  DB: D1Database;
  ADMIN_SECRET: string;
}

const { preflight, corsify } = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

// Helper: Verify Admin Secret Header
function isAuthorized(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return Boolean(env.ADMIN_SECRET && token === env.ADMIN_SECRET);
}

// ==========================================
// PUBLIC READ-ONLY ROUTES
// ==========================================

// GET /api/categories
router.get('/api/categories', async (_request, env: Env) => {
  const query = `
    SELECT DISTINCT category 
    FROM products 
    WHERE is_published = 1 
    ORDER BY category ASC
  `;
  const { results } = await env.DB.prepare(query).all();
  const categories = results.map((r: any) => r.category);
  return Response.json({ success: true, data: categories });
});

// GET /api/products?category=...&search=...&limit=20&offset=0
router.get('/api/products', async (request, env: Env) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10), 1), 50);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

  let whereClauses = ['p.is_published = 1'];
  const params: any[] = [];

  if (category && category !== 'All') {
    whereClauses.push('p.category = ?');
    params.push(category);
  }

  if (search && search.trim().length > 0) {
    whereClauses.push('(p.name LIKE ? OR p.summary LIKE ?)');
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM products p ${whereSql}`;
  const countResult: any = await env.DB.prepare(countSql).bind(...params).first();
  const total = countResult ? countResult.total : 0;

  const sql = `
    SELECT 
      p.id, 
      p.slug, 
      p.name, 
      p.category, 
      p.summary, 
      p.price_indicator,
      COALESCE(img.image_url, '') as cover_image_url,
      COALESCE(img.alt_text, p.name) as cover_image_alt
    FROM products p
    LEFT JOIN product_images img ON p.id = img.product_id AND img.is_cover = 1
    ${whereSql}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const { results } = await env.DB.prepare(sql).bind(...params).all();

  return Response.json({
    success: true,
    data: {
      items: results,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + results.length < total
      }
    }
  }, {
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=60'
    }
  });
});

// GET /api/products/:identifier
router.get('/api/products/:identifier', async (request, env: Env) => {
  const { identifier } = request.params;
  if (!identifier) {
    return Response.json({ success: false, error: 'Identifier required' }, { status: 400 });
  }

  const productQuery = `
    SELECT id, slug, name, category, summary, description, price_indicator, created_at
    FROM products
    WHERE (slug = ? OR id = ?) AND is_published = 1
    LIMIT 1
  `;
  const product: any = await env.DB.prepare(productQuery).bind(identifier, identifier).first();

  if (!product) {
    return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  const { results: attributes } = await env.DB.prepare(`
    SELECT label, value, display_order 
    FROM product_attributes 
    WHERE product_id = ? 
    ORDER BY display_order ASC, id ASC
  `).bind(product.id).all();

  const { results: images } = await env.DB.prepare(`
    SELECT image_url, alt_text, is_cover, display_order 
    FROM product_images 
    WHERE product_id = ? 
    ORDER BY is_cover DESC, display_order ASC, id ASC
  `).bind(product.id).all();

  return Response.json({
    success: true,
    data: {
      ...product,
      attributes,
      images
    }
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=120'
    }
  });
});

// ==========================================
// PROTECTED ADMIN ROUTES (Requires ADMIN_SECRET)
// ==========================================

// POST /api/admin/verify (Check passcode before showing form)
router.post('/api/admin/verify', async (request, env: Env) => {
  if (!isAuthorized(request, env)) {
    return Response.json({ success: false, error: 'Invalid passcode' }, { status: 401 });
  }
  return Response.json({ success: true });
});

// POST /api/admin/products (Create new jewellery item)
router.post('/api/admin/products', async (request, env: Env) => {
  if (!isAuthorized(request, env)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body: any = await request.json();
  if (!body.name || !body.category || !body.summary) {
    return Response.json({ success: false, error: 'Name, category, and summary are required' }, { status: 400 });
  }

  const slug = (body.slug && body.slug.trim())
    ? body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    : `aur-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const inserted = await env.DB.prepare(`
      INSERT INTO products (slug, name, category, summary, description, price_indicator, is_published)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      RETURNING id
    `).bind(
      slug,
      body.name.trim(),
      body.category.trim(),
      body.summary.trim(),
      (body.description || '').trim(),
      (body.price_indicator || '').trim()
    ).first<{ id: number }>();

    if (!inserted) {
      return Response.json({ success: false, error: 'Database insert failed' }, { status: 500 });
    }

    const productId = inserted.id;

    // Insert Specifications
    if (Array.isArray(body.attributes)) {
      for (let i = 0; i < body.attributes.length; i++) {
        const attr = body.attributes[i];
        if (attr.label?.trim() && attr.value?.trim()) {
          await env.DB.prepare(`
            INSERT INTO product_attributes (product_id, label, value, display_order)
            VALUES (?, ?, ?, ?)
          `).bind(productId, attr.label.trim(), attr.value.trim(), i + 1).run();
        }
      }
    }

    // Insert Image URLs (First image becomes cover)
    if (Array.isArray(body.images)) {
      for (let i = 0; i < body.images.length; i++) {
        const url = body.images[i];
        if (url && url.trim()) {
          await env.DB.prepare(`
            INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_cover)
            VALUES (?, ?, ?, ?, ?)
          `).bind(productId, url.trim(), body.name.trim(), i + 1, i === 0 ? 1 : 0).run();
        }
      }
    }

    return Response.json({ success: true, data: { id: productId, slug } });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || 'Failed to save item' }, { status: 400 });
  }
});

// DELETE /api/admin/products/:id (Remove a product)
router.delete('/api/admin/products/:id', async (request, env: Env) => {
  if (!isAuthorized(request, env)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = request.params;
  await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  return Response.json({ success: true });
});

router.all('*', () => Response.json({ success: false, error: 'Endpoint not found' }, { status: 404 }));

export default {
  fetch: (request: Request, env: Env) => router.fetch(request, env)
};