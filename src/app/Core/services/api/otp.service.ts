import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtpService extends BaseApiService {
  submitOtp(otp: string, user_id: string): Observable<any> {
    return this.post<any>(`/api/otp/create`, { otp, user_id });
  }
}
