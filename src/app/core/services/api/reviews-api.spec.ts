import { TestBed } from '@angular/core/testing';

import { ReviewsApi } from './reviews-api';

describe('ReviewsApi', () => {
  let service: ReviewsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
