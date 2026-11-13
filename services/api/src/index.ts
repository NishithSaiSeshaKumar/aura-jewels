import { AutoRouter, cors } from 'itty-router';

export interface Env {
  DB: D1Database;
}

const { preflight, corsify } = cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
});

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

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

  // Get total count
  const countSql = `SELECT COUNT(*) as total FROM products p ${whereSql}`;
  const countStmt = env.DB.prepare(countSql).bind(...params);
  const countResult: any = await countStmt.first();
  const total = countResult ? countResult.total : 0;

  // Get products with cover image
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
      'Cache-Control': 'public, max-age=60, s-maxage=300'
    }
  });
});

// GET /api/products/:identifier (Lookup by slug or id)
router.get('/api/products/:identifier', async (request, env: Env) => {
  const { identifier } = request.params;

  if (!identifier) {
    return Response.json({ success: false, error: 'Identifier required' }, { status: 400 });
  }

  // Lookup product
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

  // Lookup attributes
  const attrQuery = `
    SELECT label, value, display_order 
    FROM product_attributes 
    WHERE product_id = ? 
    ORDER BY display_order ASC, id ASC
  `;
  const { results: attributes } = await env.DB.prepare(attrQuery).bind(product.id).all();

  // Lookup images
  const imgQuery = `
    SELECT image_url, alt_text, is_cover, display_order 
    FROM product_images 
    WHERE product_id = ? 
    ORDER BY is_cover DESC, display_order ASC, id ASC
  `;
  const { results: images } = await env.DB.prepare(imgQuery).bind(product.id).all();

  return Response.json({
    success: true,
    data: {
      ...product,
      attributes,
      images
    }
  }, {
    headers: {
      'Cache-Control': 'public, max-age=120, s-maxage=600'
    }
  });
});

// 404 Handler
router.all('*', () => Response.json({ success: false, error: 'Endpoint not found' }, { status: 404 }));

export default {
  fetch: (request: Request, env: Env) => router.fetch(request, env)
};
