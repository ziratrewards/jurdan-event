import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardATMPass } from './card-atm-pass';

describe('CardATMPass', () => {
  let component: CardATMPass;
  let fixture: ComponentFixture<CardATMPass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardATMPass],
    }).compileComponents();

    fixture = TestBed.createComponent(CardATMPass);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
