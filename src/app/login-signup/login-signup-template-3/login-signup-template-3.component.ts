import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-signup-template-3',
  templateUrl: './login-signup-template-3.component.html',
  styleUrls: ['./login-signup-template-3.component.scss'],
  imports: [IonicModule, FormsModule],
})
export class LoginSignupTemplate3Component {
  public email = '';
  public password = '';
}
