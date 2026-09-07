import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooesChair } from './chooes-chair';

describe('ChooesChair', () => {
  let component: ChooesChair;
  let fixture: ComponentFixture<ChooesChair>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooesChair],
    }).compileComponents();

    fixture = TestBed.createComponent(ChooesChair);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
