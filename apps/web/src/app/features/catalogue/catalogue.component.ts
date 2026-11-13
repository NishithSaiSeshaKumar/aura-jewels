import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductSummary } from '../../core/models/product.model';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Hero / Header -->
    <header class="bg-[#120e0a] text-[#f5f1ea] px-4 pt-8 pb-6 border-b border-[#2b241c] sticky top-0 z-30 shadow-md">
      <div class="max-w-4xl mx-auto flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-serif tracking-wide text-[#dfb743]">AURA JEWELS</h1>
            <p class="text-xs text-[#a39887] tracking-wider uppercase">Artisanal Fine Jewellery Collection</p>
          </div>
          <div class="text-right">
            <span class="inline-block px-2.5 py-1 text-[11px] font-semibold bg-[#261e15] text-[#d6b76c] border border-[#4a3920] rounded-full">
              Read-Only Showcase
            </span>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative mt-2">
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search gold, kundan, chokers, solitaires..."
            class="w-full bg-[#1e1711] text-[#f5f1ea] placeholder-[#7d7364] px-4 py-2.5 pl-10 rounded-xl text-sm border border-[#3b3023] focus:outline-none focus:border-[#c59b27] transition"
          />
          <svg class="w-4 h-4 text-[#8a7f6f] absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          @if (searchQuery()) {
            <button 
              (click)="clearSearch()" 
              class="absolute right-3 top-2.5 text-xs text-[#a39887] hover:text-white px-1.5 py-0.5 rounded-full bg-[#2c2217]"
            >
              ✕
            </button>
          }
        </div>

        <!-- Category Horizontal Filter Chips -->
        <div class="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs no-scrollbar">
          @for (cat of categories(); track cat) {
            <button 
              (click)="selectCategory(cat)"
              [class.bg-[#c59b27]]="selectedCategory() === cat"
              [class.text-[#120e0a]]="selectedCategory() === cat"
              [class.font-bold]="selectedCategory() === cat"
              [class.bg-[#1e1711]]="selectedCategory() !== cat"
              [class.text-[#c4b9a8]]="selectedCategory() !== cat"
              class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all border border-[#362b1e] hover:border-[#c59b27]"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      
      <!-- Loading State -->
      @if (isLoading() && products().length === 0) {
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm animate-pulse">
              <div class="w-full aspect-[4/5] bg-stone-200"></div>
              <div class="p-3.5 space-y-2">
                <div class="h-3 bg-stone-200 rounded w-1/3"></div>
                <div class="h-4 bg-stone-200 rounded w-3/4"></div>
                <div class="h-3 bg-stone-200 rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && products().length === 0) {
        <div class="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm my-4">
          <div class="w-16 h-16 mx-auto mb-3 text-stone-400 bg-stone-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-serif font-bold text-stone-800">No Jewellery Found</h3>
          <p class="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            We couldn't find any piece matching your current filter criteria.
          </p>
          <button 
            (click)="resetFilters()" 
            class="mt-4 px-4 py-2 bg-stone-900 text-stone-100 text-xs rounded-xl font-medium tracking-wide"
          >
            Reset Filters
          </button>
        </div>
      }

      <!-- Product Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
        @for (product of products(); track product.id) {
          <a 
            [routerLink]="['/products', product.slug]"
            class="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col active:scale-[0.985]"
          >
            <!-- Card Image -->
            <div class="relative w-full aspect-[4/5] bg-stone-100 overflow-hidden">
              <img 
                [src]="product.cover_image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80'" 
                [alt]="product.cover_image_alt"
                loading="lazy"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span class="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-[10px] text-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider font-medium">
                {{ product.category }}
              </span>
            </div>

            <!-- Card Details -->
            <div class="p-3.5 flex flex-col flex-grow justify-between">
              <div>
                <h2 class="font-serif text-base font-bold text-stone-900 line-clamp-1 leading-snug group-hover:text-amber-800 transition-colors">
                  {{ product.name }}
                </h2>
                <p class="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {{ product.summary }}
                </p>
              </div>

              <div class="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                <span class="text-xs font-semibold text-amber-900">
                  {{ product.price_indicator || 'Available' }}
                </span>
                <span class="text-[11px] font-medium text-stone-400 group-hover:text-stone-900 flex items-center gap-0.5">
                  View →
                </span>
              </div>
            </div>
          </a>
        }
      </div>

      <!-- Load More Button -->
      @if (hasMore() && !isLoading()) {
        <div class="text-center mt-8">
          <button 
            (click)="loadMore()"
            class="px-6 py-2.5 bg-white border border-stone-300 rounded-full text-xs font-semibold text-stone-800 shadow-sm hover:bg-stone-50 active:scale-95 transition"
          >
            Load More Products
          </button>
        </div>
      }
      
      @if (isLoading() && products().length > 0) {
        <div class="text-center py-4 text-xs text-stone-400 font-medium">
          Loading more items...
        </div>
      }

    </main>

    <!-- Footer -->
    <footer class="mt-12 py-8 bg-[#120e0a] text-center text-xs text-[#7d7364] border-t border-[#2b241c]">
      <p class="font-serif text-sm text-[#bca377]">Aura Jewels Showcase</p>
      <p class="mt-1">Handcrafted with care. For viewing and showcase inquiries only.</p>
    </footer>
  `
})
export class CatalogueComponent implements OnInit {
  private productService = inject(ProductService);

  categories = signal<string[]>(['All']);
  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  products = signal<ProductSummary[]>([]);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(false);
  currentOffset = signal<number>(0);
  pageSize = 18;

  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchProducts(true);
  }

  fetchCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(['All', ...res.data]);
        }
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  fetchProducts(reset: boolean = false): void {
    this.isLoading.set(true);
    const offset = reset ? 0 : this.currentOffset();

    this.productService.getProducts({
      category: this.selectedCategory(),
      search: this.searchQuery(),
      limit: this.pageSize,
      offset: offset
    }).subscribe({
      next: (res) => {
        if (res.success) {
          if (reset) {
            this.products.set(res.data.items);
            this.currentOffset.set(res.data.items.length);
          } else {
            this.products.update(prev => [...prev, ...res.data.items]);
            this.currentOffset.update(prev => prev + res.data.items.length);
          }
          this.hasMore.set(res.data.pagination.hasMore);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.isLoading.set(false);
      }
    });
  }

  selectCategory(cat: string): void {
    if (this.selectedCategory() !== cat) {
      this.selectedCategory.set(cat);
      this.fetchProducts(true);
    }
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.fetchProducts(true);
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.fetchProducts(true);
  }

  resetFilters(): void {
    this.selectedCategory.set('All');
    this.searchQuery.set('');
    this.fetchProducts(true);
  }

  loadMore(): void {
    if (!this.isLoading() && this.hasMore()) {
      this.fetchProducts(false);
    }
  }
}
