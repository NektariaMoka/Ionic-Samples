import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../environments/environment';
import package_info from '../../package.json';
import { BeginnerMenu } from '../models/menu';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonicModule, NgClass, RouterLink, NgForOf, NgIf],
})
export class AppComponent {
  cap_v: string;
  expandMenu(title: string) {
    if (this.showChildren === title) {
      this.showChildren = '';
    } else {
      this.showChildren = title;
    }
  }

  ang_v: string;
  showChildren: string | undefined | null | HTMLTitleElement | SVGTitleElement;
  public startupMenu: Array<any>;
  appVersion: string;
  public proMenu: Array<any>;
  public beginnerMenu: Array<BeginnerMenu>;
  public sidemenuLayout1: Array<any>;
  public sidemenu = 1;
  constructor() {
    this.ang_v = String(package_info.dependencies['@angular/core']).includes(
      '^',
    )
      ? String(package_info.dependencies['@angular/core']).replace('^', '')
      : String(package_info.dependencies['@angular/core']).replace('~', '');
    this.cap_v = String(package_info.dependencies['@capacitor/core']).replace(
      '^',
      '',
    );
    this.startupMenu = environment.STARTUP_SIDEMENU;
    this.appVersion = package_info.version;
    this.proMenu = environment.PRO_SIDEMENU;
    this.startupMenu = environment.STARTUP_SIDEMENU;
    this.beginnerMenu = environment.BEGINNER_SIDEMENU;
    this.sidemenuLayout1 = environment.SIDEMENU_LAYOUTS;
  }

  redirectPage(option: any) {}

  showSidemenu(index: number) {
    this.sidemenu = index + 1;
  }

  gotoAppVerison() {}

  logout() {}
}
