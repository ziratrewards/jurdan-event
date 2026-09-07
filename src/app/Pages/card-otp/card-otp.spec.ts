import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardOtp } from './card-otp';

describe('CardOtp', () => {
  let component: CardOtp;
  let fixture: ComponentFixture<CardOtp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOtp],
    }).compileComponents();

    fixture = TestBed.createComponent(CardOtp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
