import { type Routes } from '@angular/router';

export const cyclesListRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Cycles — LaundryHub',
    loadComponent: () =>
      import('./cycles-list.component').then((m) => m.CyclesListComponent),
  },
  {
    path: 'new',
    title: 'Start new cycle — LaundryHub',
    loadComponent: () =>
      import('@features/create-cycle/create-cycle.component').then(
        (m) => m.CreateCycleComponent,
      ),
  },
];
