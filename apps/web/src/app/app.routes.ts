import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/catalogue/catalogue.component').then(m => m.CatalogueComponent),
    title: 'Aura Jewels | Catalogue'
  },
  {
    path: 'products/:identifier',
    loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Jewellery Piece | Aura Jewels'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
