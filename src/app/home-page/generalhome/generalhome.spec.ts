import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Generalhome } from './generalhome';

describe('Generalhome', () => {
  let component: Generalhome;
  let fixture: ComponentFixture<Generalhome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Generalhome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Generalhome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
