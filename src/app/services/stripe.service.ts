import { Injectable } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';

@Injectable()
export class StripeService {
  async pay(amount = 1999) {
    // 1) Fetch PaymentSheet data from your Node server
    const resp = await fetch('http://localhost:4242/paymentsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'usd',
        customerEmail: 'user@example.com',
      }),
    });
    const data = await resp.json();

    // 2) Create the PaymentSheet
    await Stripe.createPaymentSheet({
      paymentIntentClientSecret: data.paymentIntentClientSecret,
      customerEphemeralKeySecret: data.ephemeralKeySecret,
      customerId: data.customerId,
      // optional UI config
      merchantDisplayName: 'My Shop',
    });

    // 3) Present the PaymentSheet
    const result = await Stripe.presentPaymentSheet();
    if (result.paymentResult) {
      // success
      return 'Sucess';
    } else return 'Failed';
  }
}
