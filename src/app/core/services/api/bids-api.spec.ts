import {TestBed} from '@angular/core/testing';

import {BidsApi} from './bids-api';

describe('BidsApi', () => {
  let service: BidsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BidsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
