import { TestBed, inject } from '@angular/core/testing';

import { CallerService } from './caller.service';

describe('CallerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CallerService]
    });
  });

  it('should be created', inject([CallerService], (service: CallerService) => {
    expect(service).toBeTruthy();
  }));
});
