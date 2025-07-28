import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

export function provideAppIcons() {
  addIcons(allIcons);
  addIcons({
    'logo-telegram': 'assets/socialShare/telegram.svg',
    'logo-tinder': 'assets/socialShare/tinder.svg',
    'logo-boo': 'assets/socialShare/boo.svg',
  });
}
