import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { Router } from '@angular/router';
import { AuthCredentials, SignupData } from '../../models/user.interface';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login-signup-template-1',
  templateUrl: './login-signup-template-1.component.html',
  styleUrls: ['./login-signup-template-1.component.scss'],
  imports: [IonicModule, FormsModule, NgIf],
})
export class LoginSignupTemplate1Component {
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  // Form mode
  isSignupMode = false;

  // Form data
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  confirmPassword: string = '';
  agreeToTerms: boolean = false;

  // Form validation
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  generalError: string = '';

  toggleMode() {
    this.isSignupMode = !this.isSignupMode;
    this.clearForm();
    this.clearErrors();
  }

  async signInAnonymously() {
    try {
      await this.loadingService.showLoading('Signing in anonymously...');

      const result = await this.authService.signInAnonymously();

      await this.loadingService.hideLoading();

      if (result.success) {
        await this.loadingService.showToast('Signed in anonymously!');
        this.router.navigate(['/home']);
      } else {
        await this.loadingService.showToast(
          result.error || 'Anonymous sign in failed',
        );
      }
    } catch (error) {
      await this.loadingService.hideLoading();
      await this.loadingService.showToast('An unexpected error occurred');
    }
  }

  async signin() {
    if (!this.validateSigninForm()) {
      return;
    }

    try {
      await this.loadingService.showLoading('Signing in...');

      const credentials: AuthCredentials = {
        email: this.email.trim(),
        password: this.password,
      };

      const result = await this.authService.signin(credentials);

      await this.loadingService.hideLoading();

      if (result.success) {
        await this.loadingService.showToast('Welcome back!');
        this.router.navigate(['/home']);
      } else {
        await this.loadingService.showToast(result.error || 'Sign in failed');
      }
    } catch (error) {
      await this.loadingService.hideLoading();
      await this.loadingService.showToast('An unexpected error occurred');
    }
  }

  async signup() {
    if (!this.validateSignupForm()) {
      return;
    }

    try {
      await this.loadingService.showLoading('Creating account...');

      const signupData: SignupData = {
        email: this.email.trim(),
        password: this.password,
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        confirmPassword: this.confirmPassword,
        agreeToTerms: this.agreeToTerms,
      };

      const result = await this.authService.signup(signupData);

      await this.loadingService.hideLoading();

      if (result.success) {
        await this.loadingService.showToast(
          'Account created! Please check your email for verification.',
        );
        this.router.navigate(['/home']);
      } else {
        await this.loadingService.showToast(result.error || 'Sign up failed');
      }
    } catch (error) {
      await this.loadingService.hideLoading();
      await this.loadingService.showToast('An unexpected error occurred');
    }
  }

  async forgotPassword() {
    if (!this.email.trim()) {
      await this.loadingService.showToast(
        'Please enter your email address first',
      );
      return;
    }

    const confirmed = await this.loadingService.showConfirmAlert(
      'Reset Password',
      `Send password reset email to ${this.email}?`,
    );

    if (!confirmed) return;

    try {
      await this.loadingService.showLoading('Sending reset email...');

      const result = await this.authService.resetPassword(this.email.trim());

      await this.loadingService.hideLoading();

      if (result) {
        await this.loadingService.showToast('Password reset email sent!');
      } else {
        await this.loadingService.showToast(
          result || 'Failed to send reset email',
        );
      }
    } catch (error) {
      await this.loadingService.hideLoading();
      await this.loadingService.showToast('An unexpected error occurred');
    }
  }

  // Utility method for form submission
  onSubmit() {
    if (this.isSignupMode) {
      this.signup();
    } else {
      this.signin();
    }
  }

  private validateSigninForm(): boolean {
    this.clearErrors();
    let isValid = true;

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    }

    return isValid;
  }

  private validateSignupForm(): boolean {
    this.clearErrors();
    let isValid = true;

    if (!this.firstName.trim()) {
      this.generalError = 'First name is required';
      isValid = false;
    }

    if (!this.lastName.trim()) {
      this.generalError = 'Last name is required';
      isValid = false;
    }

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      isValid = false;
    }

    if (!this.agreeToTerms) {
      this.generalError = 'You must agree to the terms and conditions';
      isValid = false;
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private clearForm() {
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.confirmPassword = '';
    this.agreeToTerms = false;
  }

  private clearErrors() {
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.generalError = '';
  }

  // Check if user is authenticated (for navigation)
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
