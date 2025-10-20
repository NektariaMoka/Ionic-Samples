import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export const PaymentsRoutes = [
  {
    path: '',
    loadComponent: () =>
      import('./payments.component').then(c => c.PaymentsComponent),
  },
  {
    path: 'stripe',
    loadComponent: () =>
      import('./stripe-pay/stripe-pay.component').then(
        c => c.StripePayComponent
      ),
  },
  {
    path: 'web-pay',
    loadComponent: () =>
      import('./web-pay/web-pay.component').then(c => c.WebPayComponent),
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(PaymentsRoutes)],
})
export class PaymentsModule {}
