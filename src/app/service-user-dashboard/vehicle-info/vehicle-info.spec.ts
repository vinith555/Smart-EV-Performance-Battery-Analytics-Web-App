import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleInfo } from './vehicle-info';

describe('VehicleInfo', () => {
  let component: VehicleInfo;
  let fixture: ComponentFixture<VehicleInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
