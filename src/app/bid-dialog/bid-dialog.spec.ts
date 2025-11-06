import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidDialog } from './bid-dialog';

describe('BidDialog', () => {
  let component: BidDialog;
  let fixture: ComponentFixture<BidDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
