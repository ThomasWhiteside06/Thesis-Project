import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyBudget } from './monthly-budget';

describe('MonthlyBudget', () => {
  let component: MonthlyBudget;
  let fixture: ComponentFixture<MonthlyBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyBudget],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyBudget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
