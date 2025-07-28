import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login-signup',
    loadChildren: () => import('./login-signup/login-signup.module').then(m=>m.LoginSignupModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
