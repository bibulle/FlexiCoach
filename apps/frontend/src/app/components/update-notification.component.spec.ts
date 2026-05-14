import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateNotificationComponent } from './update-notification.component';
import { SwUpdateService } from '../services/sw-update.service';
import { BehaviorSubject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideAnimations } from '@angular/platform-browser/animations';
import { safeDetectChanges } from '../../test-utils';

describe('UpdateNotificationComponent', () => {
  let component: UpdateNotificationComponent;
  let fixture: ComponentFixture<UpdateNotificationComponent>;
  let mockSwUpdateService: any;
  let updateAvailableSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    updateAvailableSubject = new BehaviorSubject<boolean>(false);

    mockSwUpdateService = {
      updateAvailable$: updateAvailableSubject.asObservable(),
      applyUpdate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UpdateNotificationComponent],
      providers: [
        { provide: SwUpdateService, useValue: mockSwUpdateService },
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateNotificationComponent);
    component = fixture.componentInstance;
    safeDetectChanges(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with show set to false', () => {
    expect(component.show).toBe(false);
  });

  it('should subscribe to updateAvailable$ on init', () => {
    expect(component.show).toBe(false);
  });

  it('should show notification when update is available', () => {
    updateAvailableSubject.next(true);
    safeDetectChanges(fixture);

    expect(component.show).toBe(true);
  });

  it('should hide notification when update is not available', () => {
    updateAvailableSubject.next(true);
    safeDetectChanges(fixture);
    expect(component.show).toBe(true);

    updateAvailableSubject.next(false);
    safeDetectChanges(fixture);
    expect(component.show).toBe(false);
  });

  it('should display notification element when show is true', () => {
    component.show = true;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const notification = compiled.querySelector('.update-notification');
    expect(notification).toBeTruthy();
  });

  it('should not display notification element when show is false', () => {
    component.show = false;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const notification = compiled.querySelector('.update-notification');
    expect(notification).toBeFalsy();
  });

  it('should display update message', () => {
    component.show = true;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const message = compiled.querySelector('.update-message');
    expect(message?.textContent?.trim()).toBe('Nouvelle version disponible');
  });

  it('should display update icon', () => {
    component.show = true;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('system_update');
  });

  it('should display update button', () => {
    component.show = true;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button?.textContent?.trim()).toBe('Mettre à jour');
  });

  it('should call applyUpdate when clicking update button', () => {
    component.show = true;
    safeDetectChanges(fixture);

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(mockSwUpdateService.applyUpdate).toHaveBeenCalled();
  });

  it('should call applyUpdate through component method', () => {
    component.update();

    expect(mockSwUpdateService.applyUpdate).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = vi.spyOn(component['subscription']!, 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should handle multiple update availability changes', () => {
    expect(component.show).toBe(false);

    updateAvailableSubject.next(true);
    safeDetectChanges(fixture);
    expect(component.show).toBe(true);

    updateAvailableSubject.next(false);
    safeDetectChanges(fixture);
    expect(component.show).toBe(false);

    updateAvailableSubject.next(true);
    safeDetectChanges(fixture);
    expect(component.show).toBe(true);
  });

  it('should trigger change detection when updateAvailable$ emits', () => {
    const cdrSpy = vi.spyOn(component['cdr'], 'markForCheck');

    updateAvailableSubject.next(true);

    expect(cdrSpy).toHaveBeenCalled();
  });
});
