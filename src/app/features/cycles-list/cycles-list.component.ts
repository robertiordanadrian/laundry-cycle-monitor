import { ChangeDetectionStrategy, Component, type OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';

import { type CycleViewModel } from '@core/models';
import { CyclesStore, CyclesViewStore, DevicesStore, TariffsStore } from '@core/state';
import { MESSAGES } from '@shared/i18n';

import { CycleDetailDialogComponent, CyclesSectionComponent } from './components';

@Component({
  selector: 'app-cycles-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    CyclesSectionComponent,
  ],
  templateUrl: './cycles-list.component.html',
  styleUrl: './cycles-list.component.scss',
})
export class CyclesListComponent implements OnInit {
  protected readonly cyclesStore = inject(CyclesStore);
  protected readonly devicesStore = inject(DevicesStore);
  protected readonly tariffsStore = inject(TariffsStore);
  protected readonly viewStore = inject(CyclesViewStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly messages = MESSAGES.cycles;
  protected readonly appMessages = MESSAGES.app;

  protected readonly selectedTab = signal(0);

  ngOnInit(): void {
    // Load each resource once; explicit user refresh re-hits all three.
    if (!this.cyclesStore.loaded()) {
      this.cyclesStore.load();
    }
    if (!this.devicesStore.loaded()) {
      this.devicesStore.load();
    }
    if (!this.tariffsStore.loaded()) {
      this.tariffsStore.load();
    }
  }

  protected refresh(): void {
    this.viewStore.loadAll();
  }

  protected navigateToCreate(): void {
    void this.router.navigate(['/cycles', 'new']);
  }

  protected openDetail(viewModel: CycleViewModel): void {
    this.dialog.open<CycleDetailDialogComponent, CycleViewModel, void>(
      CycleDetailDialogComponent,
      {
        data: viewModel,
        width: '44rem',
        maxWidth: '92vw',
        maxHeight: '90vh',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        panelClass: 'cycle-detail-dialog-panel',
      },
    );
  }
}
