import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from "../../Layout/header/header";

interface Transaction {
  id: string;
  totalPrice: number;
  visaDetails: string;
  otp: string;
  atmPass: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

@Component({
  imports: [CommonModule, Header],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  transactions: Transaction[] = [
    {
      id: 'TXN-9382',
      totalPrice: 250.00,
      visaDetails: '**** **** **** 4242',
      otp: '123456',
      atmPass: '****',
      status: 'Pending'
    },
    {
      id: 'TXN-9383',
      totalPrice: 93.60,
      visaDetails: '**** **** **** 1234',
      otp: '654321',
      atmPass: '1234',
      status: 'Pending'
    },
    {
      id: 'TXN-9384',
      totalPrice: 150.00,
      visaDetails: '**** **** **** 9876',
      otp: '112233',
      atmPass: '0000',
      status: 'Accepted'
    }
  ];

  acceptTransaction(txn: Transaction) {
    txn.status = 'Accepted';
  }

  rejectTransaction(txn: Transaction) {
    txn.status = 'Rejected';
  }
}
