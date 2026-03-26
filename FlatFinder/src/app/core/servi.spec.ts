import { TestBed } from '@angular/core/testing';

import { Servi } from './servi';

describe('Servi', () => {
  let service: Servi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Servi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
