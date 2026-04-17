import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonListComponent } from './skeleton-list.component';

describe('SkeletonListComponent', () => {
  let fixture: ComponentFixture<SkeletonListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SkeletonListComponent] });
    fixture = TestBed.createComponent(SkeletonListComponent);
  });

  it('renders the requested number of skeleton rows', () => {
    fixture.componentRef.setInput('count', 5);
    fixture.detectChanges();

    const items: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.skeleton-list__item'),
    );
    expect(items.length).toBe(5);
  });

  it('clamps count to at least 1 when given 0 or negative', () => {
    fixture.componentRef.setInput('count', 0);
    fixture.detectChanges();

    const items: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.skeleton-list__item'),
    );
    expect(items.length).toBe(1);
  });

  it('sets aria-busy=true for assistive tech', () => {
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-busy')).toBe('true');
  });
});
