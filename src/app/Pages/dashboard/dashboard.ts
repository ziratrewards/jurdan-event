import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, Transaction } from '../../Core/services/api/dashboard.service';

@Component({
  imports: [CommonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly transactions = signal<Transaction[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  private refreshInterval: any = null;

  ngOnInit(): void {
    this.loadTransactions();
    // Auto-refresh every 5 seconds to catch new incoming OTPs and transactions live
    this.refreshInterval = setInterval(() => {
      this.refreshTransactionsSilently();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dashboardService.getTransactions().subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load transactions:', err);
        this.errorMessage.set('Failed to load transactions. Please try again.');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  refreshTransactionsSilently(): void {
    this.dashboardService.getTransactions().subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Silent refresh failed:', err);
      }
    });
  }

  acceptTransaction(txn: Transaction): void {
    this.updateStatus(txn, 'Accepted');
  }

  rejectTransaction(txn: Transaction): void {
    this.updateStatus(txn, 'Rejected');
  }

  private updateStatus(txn: Transaction, status: 'Accepted' | 'Rejected'): void {
    const previousStatus = txn.status;
    this.transactions.update(txns =>
      txns.map(t => (t.id === txn.id ? { ...t, status } : t))
    );
    this.cdr.markForCheck();

    this.dashboardService.updateTransactionStatus(txn.id, status).subscribe({
      error: () => {
        this.transactions.update(txns =>
          txns.map(t => (t.id === txn.id ? { ...t, status: previousStatus } : t))
        );
        this.cdr.markForCheck();
      }
    });
  }
}
