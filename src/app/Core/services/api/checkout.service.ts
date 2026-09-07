import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService extends BaseApiService {
  private readonly baseUrl = '/api/checkout';

  submitPayment(paymentData: any): Observable<{success: boolean, transactionId: string}> {
    // If a real backend existed:
    // return this.post<{success: boolean, transactionId: string}>(`${this.baseUrl}/submit`, paymentData);

    // Mock response
    return of({ success: true, transactionId: `TXN-${Math.floor(1000 + Math.random() * 9000)}` }).pipe(delay(800));
  }

  verifyOtp(transactionId: string, otpCode: string): Observable<{success: boolean}> {
    // return this.post<{success: boolean}>(`${this.baseUrl}/verify-otp`, { transactionId, otpCode });
    return of({ success: true }).pipe(delay(800));
  }

  confirmAtmPass(transactionId: string, atmPass: string): Observable<{success: boolean}> {
    // return this.post<{success: boolean}>(`${this.baseUrl}/confirm-atm`, { transactionId, atmPass });
    return of({ success: true }).pipe(delay(800));
  }
}
