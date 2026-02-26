import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Helpsupport } from './helpsupport';

describe('Helpsupport', () => {
  let component: Helpsupport;
  let fixture: ComponentFixture<Helpsupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Helpsupport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Helpsupport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
