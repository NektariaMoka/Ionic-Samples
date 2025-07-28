import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-signup-template-pro-9',
  templateUrl: './login-signup-template-pro-9.component.html',
  styleUrls: ['./login-signup-template-pro-9.component.scss'],
  imports: [IonicModule, FormsModule, RouterLink],
})
export class LoginSignupTemplatePro9Component implements OnInit {
  language: any;
  dark: any;
  constructor() {}

  ngOnInit() {}
}
