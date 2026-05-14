import { ComponentFixture } from '@angular/core/testing';

export function safeDetectChanges(fixture: ComponentFixture<unknown>): void {
  fixture.componentRef.changeDetectorRef.detectChanges();
}
