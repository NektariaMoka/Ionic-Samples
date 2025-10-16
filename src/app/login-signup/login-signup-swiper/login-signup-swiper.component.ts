import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { LoginSignupTemplate1Component } from '../login-signup-template-1/login-signup-template-1.component';
import { LoginSignupTemplate2Component } from '../login-signup-template-2/login-signup-template-2.component';
import { LoginSignupTemplate3Component } from '../login-signup-template-3/login-signup-template-3.component';
import { LoginSignupTemplateTinder4Component } from '../login-signup-template-tinder-4/login-signup-template-tinder-4.component';
import { LoginSignupTemplateBoo5Component } from '../login-signup-template-boo-5/login-signup-template-boo-5.component';
import { LoginSignupTemplateTelegram6Component } from '../login-signup-template-telegram-6/login-signup-template-telegram-6.component';
import { LoginSignupTemplateFacebook7Component } from '../login-signup-template-facebook-7/login-signup-template-facebook-7.component';
import { LoginSignupTemplateInstagram8Component } from '../login-signup-template-instagram-8/login-signup-template-instagram-8.component';
import { LoginSignupTemplatePro9Component } from '../login-signup-template-pro-9/login-signup-template-pro-9.component';
import { LoginSignupTemplatePro10Component } from '../login-signup-template-pro-10/login-signup-template-pro-10.component';

@Component({
  selector: 'app-login-signup-swiper',
  templateUrl: './login-signup-swiper.component.html',
  styleUrls: ['./login-signup-swiper.component.scss'],
  standalone: true,
  imports: [
    LoginSignupTemplate1Component,
    LoginSignupTemplate2Component,
    LoginSignupTemplate3Component,
    LoginSignupTemplateTinder4Component,
    LoginSignupTemplateBoo5Component,
    LoginSignupTemplateTelegram6Component,
    LoginSignupTemplateFacebook7Component,
    LoginSignupTemplateInstagram8Component,
    LoginSignupTemplatePro9Component,
    LoginSignupTemplatePro10Component,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginSignupSwiperComponent {
  constructor() {
    register();
  }
}
