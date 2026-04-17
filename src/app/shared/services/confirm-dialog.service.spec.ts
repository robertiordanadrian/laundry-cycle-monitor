import { TestBed } from '@angular/core/testing';
import { MatDialog, type MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    TestBed.configureTestingModule({
      providers: [ConfirmDialogService, { provide: MatDialog, useValue: dialog }],
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  const mockRef = (result: boolean | undefined): MatDialogRef<unknown, boolean> =>
    ({ afterClosed: () => of(result) }) as unknown as MatDialogRef<unknown, boolean>;

  it('resolves to true when dialog returns true', async () => {
    dialog.open.and.returnValue(mockRef(true));
    const result = await service.confirm({ title: 'T', message: 'M' });
    expect(result).toBe(true);
  });

  it('resolves to false when dialog returns false', async () => {
    dialog.open.and.returnValue(mockRef(false));
    const result = await service.confirm({ title: 'T', message: 'M' });
    expect(result).toBe(false);
  });

  it('resolves to false when dialog is dismissed (undefined)', async () => {
    dialog.open.and.returnValue(mockRef(undefined));
    const result = await service.confirm({ title: 'T', message: 'M' });
    expect(result).toBe(false);
  });
});
