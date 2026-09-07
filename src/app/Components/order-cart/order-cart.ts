import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { OrderCartService } from '../../Core/services/order-cart.service';

@Component({
  selector: 'app-order-cart',
  imports: [CommonModule],
  templateUrl: './order-cart.html',
  styleUrl: './order-cart.css',
})
export class OrderCart {

  @Output()
  close = new EventEmitter<void>();

  @Output()
  checkout = new EventEmitter<void>();

  constructor(
    private readonly orderCartService: OrderCartService
  ) {}

  get items() {
    return this.orderCartService.getItems();
  }

  get totalTickets(): number {
    return this.orderCartService.getTotalTickets();
  }

  get totalPrice(): number {
    return this.orderCartService.getTotalPrice();
  }

  removeItem(id: string): void {
    this.orderCartService.removeItem(id);
  }

  proceedToCheckout(): void {
    this.checkout.emit();
  }

  closeCart(): void {
    this.close.emit();
  }
}