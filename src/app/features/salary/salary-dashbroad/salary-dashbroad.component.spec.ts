import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryDashbroadComponent } from './salary-dashbroad.component';

describe('SalaryDashbroadComponent', () => {
  let component: SalaryDashbroadComponent;
  let fixture: ComponentFixture<SalaryDashbroadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryDashbroadComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SalaryDashbroadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
