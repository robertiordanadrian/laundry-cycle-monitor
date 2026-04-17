import { type Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'cycles',
  },
  {
    path: 'cycles',
    loadChildren: () =>
      import('@features/cycles-list/cycles-list.routes').then((m) => m.cyclesListRoutes),
  },
  {
    path: '**',
    redirectTo: 'cycles',
  },
];
