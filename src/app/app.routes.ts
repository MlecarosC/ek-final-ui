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
    path: 'usuarios', 
    loadComponent: () => import('./pages/usuarios/usuarios.component')
      .then(m => m.UsuariosComponent)
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
