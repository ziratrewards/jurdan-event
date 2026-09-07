import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from "../../Layout/header/header";
import { DashboardService, Transaction } from '../../Core/services/api/dashboard.service';

@Component({
  imports: [CommonModule, Header],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  
  transactions: Transaction[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions() {
    this.isLoading = true;
    this.dashboardService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.isLoading = false;
      }
    });
  }

  acceptTransaction(txn: Transaction) {
    const previousStatus = txn.status;
    txn.status = 'Accepted';
    this.dashboardService.updateTransactionStatus(txn.id, 'Accepted').subscribe({
      error: () => {
        txn.status = previousStatus;
      }
    });
  }

  rejectTransaction(txn: Transaction) {
    const previousStatus = txn.status;
    txn.status = 'Rejected';
    this.dashboardService.updateTransactionStatus(txn.id, 'Rejected').subscribe({
      error: () => {
        txn.status = previousStatus;
      }
    });
  }
}
