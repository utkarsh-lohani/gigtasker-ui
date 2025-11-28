import {TestBed} from '@angular/core/testing';

import {ReferenceDataApi} from './reference-data-api';

describe('ReferenceDataApi', () => {
  let service: ReferenceDataApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferenceDataApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
