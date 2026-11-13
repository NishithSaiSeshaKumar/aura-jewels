import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductSummary } from '../../core/models/product.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Top Header -->
    <header class="bg-[#120e0a] text-[#f5f1ea] px-4 py-4 border-b border-[#2b241c] sticky top-0 z-30 shadow-md">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-serif tracking-wide text-[#dfb743]">AURA JEWELS ADMIN</h1>
          <p class="text-[11px] text-[#a39887] uppercase tracking-wider">Catalogue Inventory Manager</p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/" class="text-xs text-[#dfb743] hover:underline">View Live Site →</a>
          @if (isAuthenticated()) {
            <button (click)="logout()" class="text-xs px-3 py-1 rounded-full bg-[#261e15] border border-[#4a3920] text-stone-300 hover:text-white">
              Lock
            </button>
          }
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-8">
      <!-- LOGIN GATE -->
      @if (!isAuthenticated()) {
        <div class="max-w-md mx-auto bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-5">
          <div class="text-center">
            <h2 class="text-2xl font-serif font-bold text-stone-900">Admin Access</h2>
            <p class="text-xs text-stone-500 mt-1">Enter your secret passcode to add or manage jewellery items.</p>
          </div>

          <div class="space-y-3">
            <input
              type="password"
              [(ngModel)]="passcodeInput"
              (keyup.enter)="verifyPasscode()"
              placeholder="Enter Admin Passcode..."
              class="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600"
            />

            @if (authError()) {
              <p class="text-xs text-red-600 font-medium">{{ authError() }}</p>
            }

            <button
              (click)="verifyPasscode()"
              [disabled]="isVerifying()"
              class="w-full py-3 bg-[#120e0a] text-[#dfb743] font-semibold text-sm rounded-xl hover:bg-stone-800 transition disabled:opacity-50"
            >
              {{ isVerifying() ? 'Verifying...' : 'Unlock Catalogue Manager' }}
            </button>
          </div>
        </div>
      }

      <!-- AUTHENTICATED ADMIN DASHBOARD -->
      @if (isAuthenticated()) {
        <div class="space-y-8">
          <!-- Add New Product Form -->
          <section class="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
            <div class="border-b border-stone-100 pb-3">
              <h2 class="text-xl font-serif font-bold text-stone-900">Add New Jewellery Piece</h2>
              <p class="text-xs text-stone-500">Fill in the details below to publish immediately to the public showcase.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-stone-700 mb-1">Product Name *</label>
                <input type="text" [(ngModel)]="form.name" placeholder="e.g. Lakshmi Kasu Mala Necklace"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-stone-700 mb-1">Category *</label>
                <input type="text" [(ngModel)]="form.category" list="category-suggestions" placeholder="e.g. Necklaces, Rings, Bangles"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
                <datalist id="category-suggestions">
                  <option value="Necklaces"></option>
                  <option value="Rings"></option>
                  <option value="Bangles"></option>
                  <option value="Earrings"></option>
                  <option value="Bracelets"></option>
                  <option value="Bridal Sets"></option>
                </datalist>
              </div>

              <div>
                <label class="block text-xs font-semibold text-stone-700 mb-1">Price Indication</label>
                <input type="text" [(ngModel)]="form.price_indicator" placeholder="e.g. ₹1,25,000 Indicative"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-stone-700 mb-1">Item Code / Slug (Optional)</label>
                <input type="text" [(ngModel)]="form.slug" placeholder="Auto-generated if blank (e.g. aur-1050)"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-700 mb-1">Short Summary (Shown on Card) *</label>
              <input type="text" [(ngModel)]="form.summary" placeholder="1-2 sentence highlight shown on the main catalogue grid"
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-700 mb-1">Full Description</label>
              <textarea rows="3" [(ngModel)]="form.description" placeholder="Detailed craftsmanship notes, gemstone details, occasion..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600"></textarea>
            </div>

            <!-- Image URLs -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-semibold text-stone-700">Photo URLs (First photo is the Cover Image)</label>
                <button type="button" (click)="addImageRow()" class="text-xs font-semibold text-amber-800 hover:underline">
                  + Add Another Photo
                </button>
              </div>
              @for (img of form.images; track $index; let i = $index) {
                <div class="flex gap-2">
                  <input type="url" [(ngModel)]="form.images[i]" placeholder="https://... (Direct image URL)"
                    class="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
                  @if (form.images.length > 1) {
                    <button type="button" (click)="removeImageRow(i)" class="px-3 text-xs text-red-600 hover:bg-red-50 rounded-xl">✕</button>
                  }
                </div>
              }
            </div>

            <!-- Specifications -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-semibold text-stone-700">Specifications (Purity, Weight, Stones)</label>
                <button type="button" (click)="addAttributeRow()" class="text-xs font-semibold text-amber-800 hover:underline">
                  + Add Specification
                </button>
              </div>
              @for (attr of form.attributes; track $index; let i = $index) {
                <div class="flex gap-2">
                  <input type="text" [(ngModel)]="attr.label" placeholder="Label (e.g. Gold Purity)"
                    class="w-1/2 px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
                  <input type="text" [(ngModel)]="attr.value" placeholder="Value (e.g. 22K Hallmarked)"
                    class="w-1/2 px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-amber-600" />
                  <button type="button" (click)="removeAttributeRow(i)" class="px-3 text-xs text-red-600 hover:bg-red-50 rounded-xl">✕</button>
                </div>
              }
            </div>

            @if (statusMessage()) {
              <div [class.bg-emerald-50]="statusSuccess()" [class.text-emerald-800]="statusSuccess()"
                   [class.bg-red-50]="!statusSuccess()" [class.text-red-700]="!statusSuccess()"
                   class="p-3 rounded-xl text-xs font-medium">
                {{ statusMessage() }}
              </div>
            }

            <button
              type="button"
              (click)="submitProduct()"
              [disabled]="isSaving()"
              class="w-full py-3.5 bg-[#120e0a] text-[#dfb743] font-semibold text-sm rounded-xl hover:bg-stone-800 transition disabled:opacity-50"
            >
              {{ isSaving() ? 'Saving to Catalogue...' : 'Save & Publish Jewellery Piece' }}
            </button>
          </section>

          <!-- Existing Products List (Quick Delete) -->
          <section class="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h2 class="text-lg font-serif font-bold text-stone-900">Published Catalogue Items ({{ existingProducts().length }})</h2>
            <div class="divide-y divide-stone-100">
              @for (item of existingProducts(); track item.id) {
                <div class="py-3 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <img [src]="item.cover_image_url" class="w-12 h-12 rounded-xl object-cover bg-stone-100 flex-shrink-0" />
                    <div class="truncate">
                      <p class="text-sm font-semibold text-stone-900 truncate">{{ item.name }}</p>
                      <p class="text-xs text-stone-500">{{ item.category }} · {{ item.slug }}</p>
                    </div>
                  </div>
                  <button
                    (click)="deleteProduct(item)"
                    class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </main>
  `
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  passcodeInput = '';
  isAuthenticated = signal(false);
  isVerifying = signal(false);
  authError = signal<string | null>(null);

  isSaving = signal(false);
  statusMessage = signal<string | null>(null);
  statusSuccess = signal(false);
  existingProducts = signal<ProductSummary[]>([]);

  form = {
    name: '',
    category: 'Necklaces',
    price_indicator: '',
    slug: '',
    summary: '',
    description: '',
    images: [''],
    attributes: [
      { label: 'Purity', value: '' },
      { label: 'Gross Weight', value: '' }
    ]
  };

  ngOnInit(): void {
    const saved = sessionStorage.getItem('aura_admin_token');
    if (saved) {
      this.passcodeInput = saved;
      this.isAuthenticated.set(true);
      this.loadExistingProducts();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.passcodeInput.trim()}`
    });
  }

  verifyPasscode(): void {
    if (!this.passcodeInput.trim()) return;
    this.isVerifying.set(true);
    this.authError.set(null);

    this.http.post<{ success: boolean }>(`${this.apiUrl}/admin/verify`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          sessionStorage.setItem('aura_admin_token', this.passcodeInput.trim());
          this.isAuthenticated.set(true);
          this.isVerifying.set(false);
          this.loadExistingProducts();
        },
        error: () => {
          this.authError.set('Incorrect passcode. Please try again.');
          this.isVerifying.set(false);
        }
      });
  }

  logout(): void {
    sessionStorage.removeItem('aura_admin_token');
    this.passcodeInput = '';
    this.isAuthenticated.set(false);
  }

  addImageRow(): void {
    this.form.images.push('');
  }

  removeImageRow(index: number): void {
    this.form.images.splice(index, 1);
  }

  addAttributeRow(): void {
    this.form.attributes.push({ label: '', value: '' });
  }

  removeAttributeRow(index: number): void {
    this.form.attributes.splice(index, 1);
  }

  loadExistingProducts(): void {
    this.http.get<any>(`${this.apiUrl}/products?limit=50`).subscribe({
      next: (res) => {
        if (res.success) {
          this.existingProducts.set(res.data.items);
        }
      }
    });
  }

  submitProduct(): void {
    if (!this.form.name.trim() || !this.form.category.trim() || !this.form.summary.trim()) {
      this.statusSuccess.set(false);
      this.statusMessage.set('Please fill in Product Name, Category, and Short Summary.');
      return;
    }

    this.isSaving.set(true);
    this.statusMessage.set(null);

    this.http.post<any>(`${this.apiUrl}/admin/products`, this.form, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          if (res.success) {
            this.statusSuccess.set(true);
            this.statusMessage.set(`Published "${this.form.name}" (Code: ${res.data.slug})!`);
            this.form = {
              name: '',
              category: this.form.category,
              price_indicator: '',
              slug: '',
              summary: '',
              description: '',
              images: [''],
              attributes: [
                { label: 'Purity', value: '' },
                { label: 'Gross Weight', value: '' }
              ]
            };
            this.loadExistingProducts();
          }
        },
        error: (err) => {
          this.isSaving.set(false);
          this.statusSuccess.set(false);
          this.statusMessage.set(err.error?.error || 'Failed to save item.');
        }
      });
  }

  deleteProduct(item: ProductSummary): void {
    if (!confirm(`Delete "${item.name}" from the catalogue?`)) return;

    this.http.delete(`${this.apiUrl}/admin/products/${item.id}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => this.loadExistingProducts()
      });
  }
}