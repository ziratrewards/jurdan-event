import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected readonly http = inject(HttpClient);

  protected get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  protected post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  protected put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }

  protected patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body);
  }
}
