import { Component, inject } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-signup-template-2',
  templateUrl: './login-signup-template-2.component.html',
  styleUrls: ['./login-signup-template-2.component.scss'],
  imports: [IonicModule],
})
export class LoginSignupTemplate2Component {
  public email = '';
  public password = '';
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  ionViewDidEnter() {
    this.menuCtrl.enable(true, 'start');
    this.menuCtrl.enable(true, 'end');
  }
}
