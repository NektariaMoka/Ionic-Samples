import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export const PaymentsRoutes = [
  {
    path: 'stripe',
    loadComponent: () =>
      import('./stripe-pay/stripe-pay.component').then(
        (c) => c.StripePayComponent,
      ),
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(PaymentsRoutes)],
})
export class PaymentsModule {}
