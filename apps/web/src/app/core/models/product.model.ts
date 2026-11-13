export interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  category: string;
  summary: string;
  price_indicator: string | null;
  cover_image_url: string;
  cover_image_alt: string;
}

export interface ProductAttribute {
  label: string;
  value: string;
  display_order: number;
}

export interface ProductImage {
  image_url: string;
  alt_text: string;
  is_cover: number;
  display_order: number;
}

export interface ProductDetail {
  id: number;
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  price_indicator: string | null;
  created_at: string;
  attributes: ProductAttribute[];
  images: ProductImage[];
}

export interface ProductListResponse {
  success: boolean;
  data: {
    items: ProductSummary[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}
