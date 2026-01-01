import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceUserDashboard } from './service-user-dashboard';

describe('ServiceUserDashboard', () => {
  let component: ServiceUserDashboard;
  let fixture: ComponentFixture<ServiceUserDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceUserDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceUserDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
