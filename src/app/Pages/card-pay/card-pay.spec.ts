import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardPay } from './card-pay';

describe('CardPay', () => {
  let component: CardPay;
  let fixture: ComponentFixture<CardPay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPay],
    }).compileComponents();

    fixture = TestBed.createComponent(CardPay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
