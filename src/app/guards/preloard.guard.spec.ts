import { TestBed, async, inject } from '@angular/core/testing';

import { PreloardGuard } from './preloard.guard';

describe('PreloardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreloardGuard]
    });
  });

  it('should ...', inject([PreloardGuard], (guard: PreloardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
