import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Billing } from './billing';

describe('Billing', () => {
  let component: Billing;
  let fixture: ComponentFixture<Billing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Billing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Billing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
