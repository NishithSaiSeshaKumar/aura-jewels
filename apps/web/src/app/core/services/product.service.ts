import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductDetailResponse, ProductListResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCategories(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/categories`);
  }

  getProducts(params: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Observable<ProductListResponse> {
    let httpParams = new HttpParams();
    if (params.category && params.category !== 'All') {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.offset) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }

    return this.http.get<ProductListResponse>(`${this.apiUrl}/products`, { params: httpParams });
  }

  getProductByIdentifier(identifier: string): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.apiUrl}/products/${identifier}`);
  }
}
