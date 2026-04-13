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
    path: 'historico',
    loadComponent: () =>
      import('./features/historico/historico.component').then(m => m.HistoricoComponent)
  },
  {
    path: 'graficos',
    loadComponent: () =>
      import('./features/graficos/graficos.component').then(m => m.GraficosComponent)
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
