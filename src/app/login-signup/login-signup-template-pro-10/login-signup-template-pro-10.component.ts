import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-signup-template-pro-10',
  templateUrl: './login-signup-template-pro-10.component.html',
  styleUrls: ['./login-signup-template-pro-10.component.scss'],
  imports: [IonicModule, FormsModule],
})
export class LoginSignupTemplatePro10Component {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor() {}

  onLogin() {
    console.log('Login attempted with:', {
      email: this.email,
      password: this.password,
    });
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
  }

  onSignUp() {
    console.log('Sign up clicked');
  }

  onSocialLogin(provider: string) {
    console.log(`${provider} login clicked`);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onBiometricLogin() {
    console.log('Biometric login clicked');
  }
}
