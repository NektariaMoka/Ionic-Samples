import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';
import { GlobalService } from '../../services/global.services';
import { environment } from '../../../environments/environment';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-stripe-pay',
  templateUrl: './stripe-pay.component.html',
  styleUrls: ['./stripe-pay.component.scss'],
  imports: [IonicModule],
  providers: [GlobalService],
})
export class StripePayComponent {
  private globalService = inject(GlobalService);
  public paymentAmount: number;
  public currency: string;
  public currencyIcon: string;
  public cardDetails: any;
  public cardNumber: any;
  public GROUP_SEPARATOR: string;

  constructor() {
    this.paymentAmount = 100;
    this.currency = 'USD';
    this.currencyIcon = '$';
    this.cardDetails = {};
    this.GROUP_SEPARATOR = ' ';
    Stripe.initialize({
      publishableKey: environment.STRIPE_SK,
    });
    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      console.log('Payment completed');
      this.globalService.presentToast(
        'Payment completed succesfully',
        'bottom',
        2000,
      );
    });
  }
  // @ts-ignore
  format(valString: any) {
    if (!valString) {
      return '';
    }
    const valueString = valString
      .replace(/\W/gi, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
    if (valueString.length > 19) {
      this.cardNumber = this.cardNumber.slice(0, 19);
    } else {
      this.cardNumber = valueString;
    }
  }

  async createPaymentSheet() {
    /**
     * Connect to your backend endpoint, and get every key.
     */
    const options = {
      url: 'http://localhost:4242/paymentsheet',
      headers: { 'Content-Type': 'application/json' },
      data: { amount: this.paymentAmount, currency: this.currency },
    };

    const response: HttpResponse = await CapacitorHttp.request({
      ...options,
      method: 'POST',
    });
    console.log(response);

    Stripe.createPaymentSheet({
      paymentIntentClientSecret: response.data.paymentIntent,
      customerEphemeralKeySecret: response.data.ephemeralKey,
      customerId: response.data.customer,
      merchantDisplayName: 'Capacitor Full App',
    }).then(() => {
      this.presentPaymentSheet();
    });
  }
  presentPaymentSheet() {
    console.log('Present payment sheet');
    Stripe.presentPaymentSheet().then((result) => {
      console.log(result);
    });
  }
}
