import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';
import { GlobalService } from '../../services/global.services';
import { environment } from '../../../environments/environment';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { FormsModule } from '@angular/forms';
import {
  DatePipe,
  DecimalPipe,
  NgForOf,
  NgIf,
  TitleCasePipe,
} from '@angular/common';
@Component({
  selector: 'app-stripe-pay',
  templateUrl: './stripe-pay.component.html',
  styleUrls: ['./stripe-pay.component.scss'],
  imports: [
    IonicModule,
    FormsModule,
    DecimalPipe,
    DatePipe,
    TitleCasePipe,
    NgIf,
    NgForOf,
  ],
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
  public paymentHistory: any[] = [];
  public isLoading: boolean = false;

  constructor() {
    this.paymentAmount = 100;
    this.currency = 'USD';
    this.currencyIcon = '$';
    this.cardDetails = {};
    this.GROUP_SEPARATOR = ' ';
    this.paymentHistory = [];
    this.isLoading = false;

    this.initializeStripe();
    this.loadPaymentHistory();
  }

  private initializeStripe() {
    Stripe.initialize({
      publishableKey: environment.STRIPE_SK,
    });

    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      console.log('Payment completed');
      this.addToPaymentHistory({
        amount: this.paymentAmount,
        currency: this.currency,
        status: 'completed',
        timestamp: new Date(),
        method: 'card',
      });
      this.globalService.presentToast(
        'Payment completed successfully',
        'bottom',
        2000,
      );
    });
  }

  private loadPaymentHistory() {
    // Load from localStorage or API
    const saved = localStorage.getItem('paymentHistory');
    if (saved) {
      this.paymentHistory = JSON.parse(saved);
    }
  }

  private addToPaymentHistory(payment: any) {
    this.paymentHistory.unshift(payment);
    // Keep only last 10 payments
    if (this.paymentHistory.length > 10) {
      this.paymentHistory = this.paymentHistory.slice(0, 10);
    }
    localStorage.setItem('paymentHistory', JSON.stringify(this.paymentHistory));
  }
  onCurrencyChange() {
    // Update currency icon based on selected currency
    switch (this.currency) {
      case 'USD':
        this.currencyIcon = '$';
        break;
      case 'EUR':
        this.currencyIcon = '€';
        break;
      case 'GBP':
        this.currencyIcon = '£';
        break;
      case 'CAD':
        this.currencyIcon = 'C$';
        break;
      default:
        this.currencyIcon = '$';
    }
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

  async handleApplePay() {
    try {
      this.globalService.presentToast(
        'Apple Pay not available on this device',
        'bottom',
        2000,
      );
      // In a real implementation, you would check for Apple Pay availability
      // and use the appropriate Stripe Apple Pay methods
    } catch (error) {
      console.error('Apple Pay error:', error);
    }
  }

  async handleGooglePay() {
    try {
      this.globalService.presentToast(
        'Google Pay not available on this device',
        'bottom',
        2000,
      );
      // In a real implementation, you would check for Google Pay availability
      // and use the appropriate Stripe Google Pay methods
    } catch (error) {
      console.error('Google Pay error:', error);
    }
  }

  async createPaymentSheet() {
    if (this.paymentAmount <= 0) {
      this.globalService.presentToast(
        'Please enter a valid amount',
        'bottom',
        2000,
      );
      return;
    }

    this.isLoading = true;

    try {
      this.globalService.presentToast('Creating payment...', 'bottom', 1000);

      const options = {
        url: 'http://localhost:4242/paymentsheet',
        headers: { 'Content-Type': 'application/json' },
        data: {
          amount: this.paymentAmount * 100, // Convert to cents
          currency: this.currency.toLowerCase(),
          customerEmail: 'user@example.com',
        },
      };

      const response: HttpResponse = await CapacitorHttp.request({
        ...options,
        method: 'POST',
      });

      if (response.status !== 200) {
        throw new Error(`Server error: ${response.status}`);
      }

      console.log('Payment sheet response:', response.data);

      await Stripe.createPaymentSheet({
        paymentIntentClientSecret: response.data.paymentIntentClientSecret,
        customerEphemeralKeySecret: response.data.ephemeralKeySecret,
        customerId: response.data.customerId,
        merchantDisplayName: 'Capacitor Full App',
      });

      await this.presentPaymentSheet();
    } catch (error) {
      console.error('Error creating payment sheet:', error);
      this.globalService.presentToast(
        'Error creating payment. Please try again.',
        'bottom',
        3000,
      );
    } finally {
      this.isLoading = false;
    }
  }
  async presentPaymentSheet() {
    try {
      console.log('Presenting payment sheet');
      const result = await Stripe.presentPaymentSheet();

      if (result.paymentResult) {
        console.log('Payment successful:', result);
        this.globalService.presentToast(
          'Payment completed successfully!',
          'bottom',
          3000,
        );
      } else {
        console.log('Payment failed or cancelled:', result);
        this.globalService.presentToast(
          'Payment was cancelled or failed',
          'bottom',
          3000,
        );
      }
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      this.globalService.presentToast(
        'Error processing payment. Please try again.',
        'bottom',
        3000,
      );
    }
  }
}
