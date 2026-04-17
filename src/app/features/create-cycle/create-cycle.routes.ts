import { type Routes } from '@angular/router';

export const createCycleRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Start new cycle — LaundryHub',
    loadComponent: () =>
      import('./create-cycle.component').then((m) => m.CreateCycleComponent),
  },
];
