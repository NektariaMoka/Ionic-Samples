import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../environments/environment';
import { BeginnerMenu } from '../models/menu';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonicModule, NgClass, RouterLink, NgOptimizedImage],
})
export class AppComponent {
  showChildren: string | undefined | null | HTMLTitleElement | SVGTitleElement;
  expandMenu(title: string) {
    if (this.showChildren === title) {
      this.showChildren = '';
    } else {
      this.showChildren = title;
    }
  }
  public beginnerMenu: Array<BeginnerMenu> = [];
  redirectPage() {}
}
