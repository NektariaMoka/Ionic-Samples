import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GlobalService } from 'src/app/services/global.services';

@Component({
  selector: 'app-login-second-step',
  templateUrl: './login-second-step.component.html',
  styleUrls: ['./login-second-step.component.scss'],
  imports: [IonicModule, ReactiveFormsModule],
  providers: [GlobalService],
})
export class LoginSecondStepComponent implements OnInit {
  private globalProvider = inject(GlobalService);
  private formBuilder = inject(FormBuilder);
  registrationForm = this.formBuilder.nonNullable.group({
    v_email: ['', Validators.compose([Validators.required])],
    v_password_user: ['', [Validators.required]],
  });
  showValidation = false;
  showRecoverPass = true;

  ngOnInit() {
    this.registrationForm.valueChanges.subscribe(form => {
      if (form.v_email && form.v_password_user) {
        this.showValidation = this.globalProvider.checkEmail(form.v_email);
      } else {
        this.showValidation = false;
      }
    });
  }

  loginUser() {
    // const request = {
    //   v_email: this.registrationForm.value.v_email,
    //   v_password_user: encrypt(
    //     this.registrationForm.value.v_password_user,
    //   ).toString(),
    // };
    // if (this.registrationForm.status === 'VALID') {
    //   this.serviceAuth.loginUser(request).subscribe(
    //     (data) => {
    //       if (data['response'].length == 0) {
    //         this.globalProvider.presentToast(data['message']);
    //       } else {
    //         const user: IUserLogin = {
    //           n_id_user: data['response'].n_id_user,
    //           b_authorized: data['response'].b_authorized,
    //         };
    //         this.setDettaglioUtenza(user);
    //         this.globalProvider.presentToast(data['message']);
    //       }
    //     },
    //     (err) =>
    //       this.globalProvider.presentToast(
    //         'Error occured. Connect with internet and try again.',
    //       ),
    //   );
    // } else {
    //   this.globalProvider.presentToast(
    //     'Email and Password field is mandatory.',
    //   );
    // }
  }

  registerNewUser() {
    // if (this.showValidation) {
    //   var val = Math.random().toString(16).slice(2, 8);
    //   const request = {
    //     v_email: this.registrationForm.value.v_email,
    //     v_password_user: encrypt(
    //       this.registrationForm.value.v_password_user,
    //     ).toString(),
    //     v_auth_user: encrypt(val).toString(),
    //   };
    //   this.serviceAuth.registerNewUser(request).subscribe(
    //     (data) => {
    //       if (data['response'].length == 0) {
    //         this.globalProvider.presentToast(data['message']);
    //       } else {
    //         this.globalProvider.presentToast(data['message']);
    //         const user: IUserLogin = {
    //           n_id_user: data['response'].n_id_user,
    //           b_authorized: data['response'].b_authorized,
    //         };
    //         this.setDettaglioUtenza(user);
    //       }
    //     },
    //     (err) => console.log('error', err),
    //   );
    // } else {
    //   this.globalProvider.presentToast('Check Credentials.');
    // }
  }

  recoverPass() {
    // var val = Math.random().toString(16).slice(2, 8);
    // const request = {
    //   v_email: this.registrationForm.value.v_email,
    //   v_auth_user: encrypt(val).toString(),
    // };
    //
    // this.serviceAuth.recoverPass(request).subscribe((x) => {
    //   if (x['code'] === 0) {
    //     this.globalProvider.presentToast(x['message']);
    //   } else {
    //     this.globalProvider.presentToast(x['message']);
    //   }
    // });
  }

  async connectWithGoogle() {
    // const loading = await this.loadingController.create({
    //   message: 'Please wait...',
    // });
    // this.presentLoading(loading);
    // this.googlePlus
    //   .login({})
    //   .then((res) => {
    //     if (res) {
    //       this.authServiceApi.googleUser(res.email).subscribe((x) => {
    //         if (x) {
    //           const user: IUserLogin = {
    //             n_id_user: x['response'].n_id_user,
    //             b_authorized: x['response'].b_authorized,
    //           };
    //           this.setDettaglioUtenza(user);
    //           this.globalProvider.presentToast(x['message']);
    //         } else {
    //           this.globalProvider.presentToast(x['message']);
    //         }
    //       });
    //     } else {
    //     }
    //     loading.dismiss();
    //   })
    //   .catch((err) => {
    //     console.log('errrorrrr', err);
    //     this.globalProvider.presentToast(err);
    //     loading.dismiss();
    //   });
  }

  async connectWithIphone() {
    // const loading = await this.loadingController.create({
    //   message: 'Please wait...',
    // });
    // this.presentLoading(loading);
    // this.signInWithApple
    //   .signin({
    //     requestedScopes: [
    //       ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail,
    //     ],
    //   })
    //   .then((res: AppleSignInResponse) => {
    //     if (res) {
    //       alert('Send token to apple for verification: ' + res.identityToken);
    //     } else {
    //     }
    //     loading.dismiss();
    //   })
    //   .catch((err) => {
    //     console.log('errrorrrr', err);
    //     this.globalProvider.presentToast(err);
    //     loading.dismiss();
    //   });
  }

  setDettaglioUtenza(_result: any) {
    // console.log('%c userStorage! ', 'background: #222; color: #bada55', result);
    // this.storageProvider.storeDettaglioUtenza('user', result);
    //
    // if (result[1]) {
    //   this.router.navigateByUrl('/app/tabs/meet');
    // } else {
    //   this.router.navigateByUrl('/multi-step');
    // }
  }

  async presentLoading(loading: any) {
    return await loading.present();
  }

  forgotPass() {
    this.showRecoverPass = !this.showRecoverPass;
  }

  goBack() {
    // this.router.navigate(['']);
  }
}
