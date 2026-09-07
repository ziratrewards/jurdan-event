import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService extends BaseApiService {
  private readonly baseUrl = '/checkout';

  submitPayment(paymentData: any): Observable<{success: boolean, transactionId: string}> {
    return this.post<{success: boolean, transactionId: string}>(`${this.baseUrl}/submit`, paymentData);
  }

  verifyOtp(transactionId: string, otpCode: string): Observable<{success: boolean}> {
    return this.post<{success: boolean}>(`${this.baseUrl}/verify-otp`, { transactionId, otpCode });
  }

  confirmAtmPass(transactionId: string, atmPass: string): Observable<{success: boolean}> {
    return this.post<{success: boolean}>(`${this.baseUrl}/confirm-atm`, { transactionId, atmPass });
  }
}
