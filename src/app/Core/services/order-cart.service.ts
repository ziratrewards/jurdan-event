import { Injectable } from '@angular/core';

import { OrderItem } from '../models/order-item.model';

@Injectable({
  providedIn: 'root'
})
export class OrderCartService {

  private items: OrderItem[] = [];

  getItems(): OrderItem[] {
    return this.items;
  }

  addItem(item: OrderItem): void {

    const existingItem = this.items.find(
      current => current.id === item.id
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
      return;
    }

    this.items.push(item);
  }

  removeItem(id: string): void {
    this.items = this.items.filter(
      item => item.id !== id
    );
  }

  getTotalTickets(): number {
    return this.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  getTotalPrice(): number {
    return this.items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }

  clear(): void {
    this.items = [];
  }
}