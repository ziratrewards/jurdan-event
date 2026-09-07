import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Transaction {
  id: string;
  totalPrice: number;
  visaDetails: string;
  otp: string;
  atmPass: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {
  private readonly baseUrl = '/api/dashboard/transactions';

  getTransactions(): Observable<Transaction[]> {
    // If a real backend existed:
    // return this.get<Transaction[]>(this.baseUrl);

    // Mock API response with delay
    const mockTransactions: Transaction[] = [
      { id: 'TXN-9382', totalPrice: 250.00, visaDetails: '**** **** **** 4242', otp: '123456', atmPass: '****', status: 'Pending' },
      { id: 'TXN-9383', totalPrice: 93.60, visaDetails: '**** **** **** 1234', otp: '654321', atmPass: '1234', status: 'Pending' },
      { id: 'TXN-9384', totalPrice: 150.00, visaDetails: '**** **** **** 9876', otp: '112233', atmPass: '0000', status: 'Accepted' }
    ];
    return of(mockTransactions).pipe(delay(600));
  }

  updateTransactionStatus(id: string, status: 'Accepted' | 'Rejected'): Observable<{success: boolean}> {
    // If a real backend existed:
    // return this.put<{success: boolean}>(`${this.baseUrl}/${id}/status`, { status });

    // Mock successful update
    return of({ success: true }).pipe(delay(300));
  }
}
