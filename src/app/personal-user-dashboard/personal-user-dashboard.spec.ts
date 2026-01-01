import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalUserDashboard } from './personal-user-dashboard';

describe('PersonalUserDashboard', () => {
  let component: PersonalUserDashboard;
  let fixture: ComponentFixture<PersonalUserDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalUserDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalUserDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
