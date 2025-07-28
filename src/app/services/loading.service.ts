import { inject, Injectable } from '@angular/core';
import {
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private currentLoading: HTMLIonLoadingElement | null = null;
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  constructor() {}

  async showLoading(
    message: string = 'Please wait...',
    duration?: number,
  ): Promise<void> {
    // Dismiss any existing loading
    if (this.currentLoading) {
      await this.currentLoading.dismiss();
    }

    this.currentLoading = await this.loadingController.create({
      message,
      duration,
      spinner: 'crescent',
      cssClass: 'custom-loading',
    });

    await this.currentLoading.present();
  }

  async hideLoading(): Promise<void> {
    if (this.currentLoading) {
      await this.currentLoading.dismiss();
      this.currentLoading = null;
    }
  }

  async showToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3000,
    position: 'top' | 'middle' | 'bottom' = 'bottom',
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      color: this.getToastColor(type),
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
      ],
      cssClass: `toast-${type}`,
    });

    await toast.present();
  }

  async showAlert(
    title: string,
    message: string,
    buttons: string[] = ['OK'],
  ): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message,
      buttons,
      cssClass: 'custom-alert',
    });

    await alert.present();
  }

  async showConfirmAlert(
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: title,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: confirmText,
            handler: () => resolve(true),
          },
        ],
        cssClass: 'custom-confirm-alert',
      });

      await alert.present();
    });
  }

  async showInputAlert(
    title: string,
    message: string,
    placeholder: string = '',
    inputType: 'text' | 'email' | 'password' | 'number' = 'text',
  ): Promise<string | null> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: title,
        message,
        inputs: [
          {
            name: 'input',
            type: inputType,
            placeholder,
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => resolve(null),
          },
          {
            text: 'OK',
            handler: (data) => resolve(data.input || null),
          },
        ],
        cssClass: 'custom-input-alert',
      });

      await alert.present();
    });
  }

  private getToastColor(
    type: 'success' | 'error' | 'warning' | 'info',
  ): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'primary';
    }
  }
}
