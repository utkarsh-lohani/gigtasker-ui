import { TestBed } from '@angular/core/testing';

import { WalletApi } from './wallet-api';

describe('WalletApi', () => {
  let service: WalletApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
