import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  { path: '', loadComponent: () => import('./core/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/home/flat-search/flat-search.component').then(m => m.FlatSearchComponent) },
      { path: 'flats/new', loadComponent: () => import('./features/flats/flat-form/flat-form.component').then(m => m.FlatFormComponent) },
      { path: 'flats/:id', loadComponent: () => import('./features/flats/flat-detail/flat-detail.component').then(m => m.FlatDetailComponent) },
      { path: 'flats/:id/edit', loadComponent: () => import('./features/flats/flat-form/flat-form.component').then(m => m.FlatFormComponent) },
      { path: 'my-flats', loadComponent: () => import('./features/flats/my-flats/my-flats.component').then(m => m.MyFlatsComponent) },
      { path: 'favourites', loadComponent: () => import('./features/flats/favourites/favourites.component').then(m => m.FavouritesComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent) },
      { path: 'profile/edit', loadComponent: () => import('./features/profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent) },
      { path: 'admin/users', loadComponent: () => import('./features/admin/users-list/users-list.component').then(m => m.UsersListComponent) },
      { path: '**', redirectTo: '' }
    ]
  }
];
