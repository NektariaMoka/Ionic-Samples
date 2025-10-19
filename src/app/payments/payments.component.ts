import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  imports: [IonicModule, RouterModule],
  standalone: true
})
export class PaymentsComponent {
  constructor() {}
}
