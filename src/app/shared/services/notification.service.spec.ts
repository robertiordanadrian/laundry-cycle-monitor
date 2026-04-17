import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBar },
        provideNoopAnimations(),
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('opens success with polite politeness and short duration', () => {
    service.success('done');
    const config = snackBar.open.calls.mostRecent().args[2];
    expect(snackBar.open.calls.mostRecent().args[0]).toBe('done');
    expect(config?.politeness).toBe('polite');
    expect(config?.panelClass).toContain('app-snack--success');
  });

  it('opens error with assertive politeness and longer duration', () => {
    service.error('boom');
    const config = snackBar.open.calls.mostRecent().args[2];
    expect(config?.politeness).toBe('assertive');
    expect(config?.duration).toBeGreaterThan(4000);
    expect(config?.panelClass).toContain('app-snack--error');
  });

  it('opens info with info panel class', () => {
    service.info('fyi');
    const config = snackBar.open.calls.mostRecent().args[2];
    expect(config?.panelClass).toContain('app-snack--info');
  });
});
