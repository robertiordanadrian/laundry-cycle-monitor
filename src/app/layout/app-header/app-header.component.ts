import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { MESSAGES } from '@shared/i18n';
import { ThemeService } from '@shared/services';

const THEME_ICONS = Object.freeze({
  auto: 'brightness_auto',
  light: 'light_mode',
  dark: 'dark_mode',
});

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly messages = MESSAGES.app;

  protected readonly themeIcon = computed(() => THEME_ICONS[this.themeService.preference()]);
  protected readonly themeTooltip = computed(
    () => `${this.messages.toggleTheme} — ${this.themeService.preference()}`,
  );
}
