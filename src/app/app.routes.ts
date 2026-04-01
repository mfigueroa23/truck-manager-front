import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'registro',
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'empresas',
    loadComponent: () =>
      import('./features/empresas/empresas.component').then(m => m.EmpresasComponent)
  },
  {
    path: 'conductores',
    loadComponent: () =>
      import('./features/conductores/conductores.component').then(m => m.ConductoresComponent)
  },
  {
    path: 'camiones',
    loadComponent: () =>
      import('./features/camiones/camiones.component').then(m => m.CamionesComponent)
  },
  {
    path: '**',
    redirectTo: 'registro'
  }
];
