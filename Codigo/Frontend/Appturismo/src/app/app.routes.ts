import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./tabs/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'health',
        loadComponent: () => import('./tabs/health/health.page').then(m => m.HealthPage)
      },
      {
        path: 'capture',
        loadComponent: () => import('./tabs/capture/capture.page').then(m => m.CapturePage)
      },
      {
        path: 'stats',
        loadComponent: () => import('./tabs/stats/stats.page').then(m => m.StatsPage)
      },

    {
     path: 'perfil',
      loadComponent: () => import('./tabs/perfil/perfil.page').then(m => m.PerfilPage)
     },

     { path: 'gastronomia',
        loadComponent: () => import('./tabs/gastronomia/gastronomia.page').then(m => m.GastronomiaPage)
      },

      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
