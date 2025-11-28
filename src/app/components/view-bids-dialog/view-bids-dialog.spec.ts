import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ViewBidsDialog} from './view-bids-dialog';

describe('ViewBidsDialog', () => {
  let component: ViewBidsDialog;
  let fixture: ComponentFixture<ViewBidsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBidsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBidsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
