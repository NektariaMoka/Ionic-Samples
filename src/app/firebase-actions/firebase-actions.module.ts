import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FirebaseActionsComponent } from './firebase-actions.component';

@NgModule({
  declarations: [FirebaseActionsComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  exports: [FirebaseActionsComponent],
})
export class FirebaseActionsModule {}
