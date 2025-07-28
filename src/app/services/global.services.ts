import { Injectable } from '@angular/core';

@Injectable()
export class GlobalService {
  checkEmail(email: string) {
    if (email) {
      let patternEmail =
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
      return email.search(patternEmail) != -1;
    } else {
      return false;
    }
  }
}
