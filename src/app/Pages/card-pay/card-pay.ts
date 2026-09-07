import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from "../../Layout/header/header";
import { OrderCartService } from '../../Core/services/order-cart.service';

@Component({
  imports: [CommonModule, Header],
  selector: 'app-card-pay',
  styleUrl: './card-pay.css',
  templateUrl: './card-pay.html',
})
export class CardPay {
  private readonly orderCartService = inject(OrderCartService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

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
    this.router.navigate(['/payment/otp']);
  }
}
