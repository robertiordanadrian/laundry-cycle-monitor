import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { type ConfirmDialogInput } from './confirm-dialog.model';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let loader: HarnessLoader;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent, boolean>>;

  const buildConfig = (overrides: Partial<ConfirmDialogInput> = {}): ConfirmDialogInput => ({
    title: 'Are you sure?',
    message: 'This cannot be undone.',
    ...overrides,
  });

  const build = (config: ConfirmDialogInput) => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<ConfirmDialogComponent, boolean>>(
      'MatDialogRef',
      ['close'],
    );
    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: config },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  };

  it('renders title, message and default button labels', () => {
    build(buildConfig());
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Are you sure?');
    expect(host.textContent).toContain('This cannot be undone.');
    expect(host.textContent).toContain('Confirm');
    expect(host.textContent).toContain('Cancel');
  });

  it('honors custom button labels', () => {
    build(buildConfig({ confirmLabel: 'Delete it', cancelLabel: 'Keep' }));
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Delete it');
    expect(host.textContent).toContain('Keep');
  });

  it('closes with true on confirm click', async () => {
    build(buildConfig());
    const confirmBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="confirm-dialog-confirm"]' }),
    );
    await confirmBtn.click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('closes with false on cancel click', async () => {
    build(buildConfig());
    const cancelBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="confirm-dialog-cancel"]' }),
    );
    await cancelBtn.click();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
