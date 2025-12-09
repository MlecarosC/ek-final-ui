import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/inicio', 
    pathMatch: 'full' 
  },
  { 
    path: 'inicio', 
    loadComponent: () => import('./pages/inicio/inicio.component')
      .then(m => m.InicioComponent)
  },
  { 
    path: 'nosotros', 
    loadComponent: () => import('./pages/nosotros/nosotros.component')
      .then(m => m.NosotrosComponent)
  },
  { 
    path: '**', 
    redirectTo: '/inicio' 
  }
];
