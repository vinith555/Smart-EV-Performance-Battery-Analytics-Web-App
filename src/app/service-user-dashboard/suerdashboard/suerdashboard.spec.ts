import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Suerdashboard } from './suerdashboard';

describe('Suerdashboard', () => {
  let component: Suerdashboard;
  let fixture: ComponentFixture<Suerdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Suerdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Suerdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
