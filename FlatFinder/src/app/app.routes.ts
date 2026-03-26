import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },

  { path: '', loadComponent: () => import('./core/layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./features/home/flat-search/flat-search').then(m => m.FlatSearch) },
      { path: 'flats/new', loadComponent: () => import('./features/flats/flat-form/flat-form').then(m => m) },
      { path: 'flats/:id', loadComponent: () => import('./features/flats/flat-detail/flat-detail').then(m => m.FlatDetail) },
      { path: 'flats/:id/edit', loadComponent: () => import('./features/flats/flat-form/flat-form').then(m => m.FlatForm) },
      { path: 'my-flats', loadComponent: () => import('./features/flats/my-flats/my-flats').then(m => m.MyFlats) },
      { path: 'favourites', loadComponent: () => import('./features/flats/favourites/favourites').then(m => m.Favourites) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile-view/profile-view').then(m => m.ProfileView) },
      { path: 'profile/edit', loadComponent: () => import('./features/profile/profile-edit/profile-edit').then(m => m.ProfileEdit) },
      { path: 'admin/users', loadComponent: () => import('./features/admin/users-list/users-list').then(m => m.UsersList) },
      { path: '**', redirectTo: '' }
    ]
  }
];
