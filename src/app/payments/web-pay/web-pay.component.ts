import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../../services/global.services';
import { environment } from '../../../environments/environment';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

declare var Stripe: any;

@Component({
  selector: 'app-web-pay',
  templateUrl: './web-pay.component.html',
  styleUrls: ['./web-pay.component.scss'],
  imports: [IonicModule, FormsModule],
  standalone: true
})
export class WebPayComponent implements OnInit {
  private globalService = inject(GlobalService);
  
  public paymentAmount: number = 100;
  public currency: string = 'USD';
  public currencyIcon: string = '$';
  public isLoading: boolean = false;
  public stripe: any;
  public elements: any;
  public paymentElement: any;
  public clientSecret: string = '';

  constructor() {}

  ngOnInit() {
    this.initializeStripe();
  }

  private async initializeStripe() {
    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe(environment.STRIPE_SK);
    } else {
      console.error('Stripe.js not loaded');
      this.globalService.presentToast('Payment system not available', 'bottom', 2000);
    }
  }

  onCurrencyChange() {
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

  async createPaymentIntent() {
    if (this.paymentAmount <= 0) {
      this.globalService.presentToast('Please enter a valid amount', 'bottom', 2000);
      return;
    }

    this.isLoading = true;

    try {
      const options = {
        url: 'http://localhost:4242/create-payment-intent',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          amount: this.paymentAmount * 100, // Convert to cents
          currency: this.currency.toLowerCase()
        },
      };

      const response: HttpResponse = await CapacitorHttp.request({
        ...options,
        method: 'POST',
      });

      if (response.status !== 200) {
        throw new Error(`Server error: ${response.status}`);
      }

      this.clientSecret = response.data.clientSecret;
      await this.initializePaymentElement();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      this.globalService.presentToast(
        'Error creating payment. Please try again.',
        'bottom',
        3000
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async initializePaymentElement() {
    if (!this.stripe || !this.clientSecret) {
      return;
    }

    this.elements = this.stripe.elements({
      clientSecret: this.clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#0570de',
          colorBackground: '#ffffff',
          colorText: '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Ideal Sans, system-ui, sans-serif',
          spacingUnit: '2px',
          borderRadius: '4px',
        }
      }
    });

    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');

    this.paymentElement.on('change', (event: any) => {
      const displayError = document.getElementById('payment-element-errors');
      if (event.error) {
        if (displayError) {
          displayError.textContent = event.error.message;
        }
      } else {
        if (displayError) {
          displayError.textContent = '';
        }
      }
    });
  }

  async handleSubmit() {
    if (!this.stripe || !this.elements || !this.clientSecret) {
      this.globalService.presentToast('Payment system not ready', 'bottom', 2000);
      return;
    }

    this.isLoading = true;

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/payments/web-pay',
      },
    });

    if (error) {
      console.error('Payment failed:', error);
      this.globalService.presentToast(
        error.message || 'Payment failed. Please try again.',
        'bottom',
        3000
      );
    } else {
      this.globalService.presentToast('Payment successful!', 'bottom', 3000);
    }

    this.isLoading = false;
  }
}