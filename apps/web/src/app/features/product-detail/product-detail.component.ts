import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductDetail } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Sticky Top Navigation Bar -->
    <nav class="bg-[#120e0a] text-[#f5f1ea] px-4 py-3 sticky top-0 z-40 flex items-center justify-between border-b border-[#2b241c] shadow-sm">
      <a routerLink="/" class="flex items-center gap-1.5 text-xs font-semibold text-[#dfb743] hover:text-white transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Catalogue
      </a>

      <!-- Share Action Button -->
      <button 
        (click)="shareProduct()"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#261e15] border border-[#4a3920] text-xs font-medium text-[#dfb743] hover:bg-[#382b1d] active:scale-95 transition"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
        </svg>
        <span>{{ copyNotice() || 'Share Piece' }}</span>
      </button>
    </nav>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 py-6">
      @if (isLoading()) {
        <div class="space-y-4 animate-pulse">
          <div class="w-full aspect-[4/5] bg-stone-200 rounded-2xl"></div>
          <div class="h-6 bg-stone-200 rounded w-2/3"></div>
          <div class="h-4 bg-stone-200 rounded w-1/3"></div>
          <div class="h-20 bg-stone-200 rounded"></div>
        </div>
      }

      @if (!isLoading() && product(); as item) {
        <div class="animate-fade-in flex flex-col gap-6">

          <!-- Image Carousel & Preview -->
          <div class="bg-white rounded-3xl p-3 border border-stone-200/90 shadow-sm overflow-hidden">
            <div class="relative w-full aspect-[4/5] sm:aspect-square bg-stone-100 rounded-2xl overflow-hidden">
              <img 
                [src]="activeImage() || item.images[0]?.image_url" 
                [alt]="item.name"
                class="w-full h-full object-cover transition-opacity duration-300"
              />
              <span class="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-xs text-amber-200 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                {{ item.category }}
              </span>
            </div>

            <!-- Thumbnail Selector (If multiple images) -->
            @if (item.images.length > 1) {
              <div class="flex gap-2.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
                @for (img of item.images; track img.image_url) {
                  <button 
                    (click)="setActiveImage(img.image_url)"
                    [class.ring-2]="activeImage() === img.image_url"
                    class="ring-amber-600 rounded-xl overflow-hidden w-16 h-16 flex-shrink-0 border border-stone-200 active:scale-95 transition"
                  >
                    <img [src]="img.image_url" [alt]="img.alt_text" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Product Details Header -->
          <div class="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Item Code: {{ item.slug }}
                </span>
                <span class="text-xs px-2.5 py-0.5 bg-stone-100 text-stone-600 rounded-full font-medium">
                  Public Catalogue
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1 leading-snug">
                {{ item.name }}
              </h1>
            </div>

            <div class="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-wider text-amber-900 font-semibold">Price Indication</p>
                <p class="text-lg font-serif font-bold text-amber-950">{{ item.price_indicator || 'Price Upon Request' }}</p>
              </div>
              <span class="text-[11px] text-amber-800 italic">Approx. estimate</span>
            </div>

            <div class="pt-2">
              <h2 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Description</h2>
              <p class="text-sm text-stone-700 leading-relaxed">{{ item.description || item.summary }}</p>
            </div>
          </div>

          <!-- Structured Specifications Table -->
          @if (item.attributes.length > 0) {
            <div class="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm">
              <h2 class="font-serif text-xl font-bold text-stone-900 mb-4 border-b border-stone-100 pb-2">
                Detailed Specifications
              </h2>
              <dl class="divide-y divide-stone-100 text-sm">
                @for (attr of item.attributes; track attr.label) {
                  <div class="py-2.5 flex justify-between gap-4">
                    <dt class="text-stone-500 font-medium">{{ attr.label }}</dt>
                    <dd class="text-stone-900 font-semibold text-right">{{ attr.value }}</dd>
                  </div>
                }
              </dl>
            </div>
          }

        </div>
      }

      <!-- Error / Not Found State -->
      @if (!isLoading() && errorMsg()) {
        <div class="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          <h2 class="text-xl font-serif font-bold text-stone-800">Jewellery Item Not Found</h2>
          <p class="text-xs text-stone-500 mt-2">{{ errorMsg() }}</p>
          <a routerLink="/" class="mt-4 inline-block px-5 py-2.5 bg-stone-900 text-stone-100 text-xs rounded-xl font-semibold">
            Return to Catalogue
          </a>
        </div>
      }
    </main>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product = signal<ProductDetail | null>(null);
  activeImage = signal<string>('');
  isLoading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);
  copyNotice = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const identifier = params.get('identifier');
      if (identifier) {
        this.loadProduct(identifier);
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.productService.getProductByIdentifier(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.product.set(res.data);
          if (res.data.images && res.data.images.length > 0) {
            this.activeImage.set(res.data.images[0].image_url);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set('This jewellery piece may have been removed or does not exist.');
        this.isLoading.set(false);
      }
    });
  }

  setActiveImage(url: string): void {
    this.activeImage.set(url);
  }

  shareProduct(): void {
    const p = this.product();
    if (!p) return;

    const shareData = {
      title: `${p.name} | Aura Jewels`,
      text: p.summary,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.copyNotice.set('Link Copied! ✓');
        setTimeout(() => this.copyNotice.set(null), 2500);
      });
    }
  }
}
