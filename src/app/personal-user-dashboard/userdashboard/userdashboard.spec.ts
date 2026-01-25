import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userdashboard } from './userdashboard';

describe('Userdashboard', () => {
  let component: Userdashboard;
  let fixture: ComponentFixture<Userdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
