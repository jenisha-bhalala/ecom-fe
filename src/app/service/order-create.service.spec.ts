import { TestBed } from '@angular/core/testing';

import { OrderCreateService } from './order-create.service';

describe('OrderCreateService', () => {
  let service: OrderCreateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderCreateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
