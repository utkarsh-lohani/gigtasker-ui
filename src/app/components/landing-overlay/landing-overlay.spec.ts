import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingOverlay } from './landing-overlay';

describe('LandingOverlay', () => {
  let component: LandingOverlay;
  let fixture: ComponentFixture<LandingOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
