import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable()
export class GlobalService {
  private toastController = inject(ToastController);
  checkEmail(email: string) {
    if (email) {
      const patternEmail =
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
      return email.search(patternEmail) != -1;
    } else {
      return false;
    }
  }

  async presentToast(message: string, position: any, duration: number) {
    const toast = await this.toastController.create({
      message,
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Close clicked');
          },
        },
      ],
      position,
      duration,
    });
    toast.present();
  }
}
