import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface EventDetails {
  id: string;
  name: string;
  date: string;
  time: string;
  availableSeats: any[]; // Mocking seat map data
}

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BaseApiService {
  private readonly baseUrl = '/api/events';

  getEventDetails(eventId: string): Observable<EventDetails> {
    // If a real backend existed:
    // return this.get<EventDetails>(`${this.baseUrl}/${eventId}`);

    // Mock response
    return of({
      id: eventId,
      name: 'AMR DIAB 2026',
      date: 'Fri, Sep 18',
      time: '03:00 PM',
      availableSeats: []
    }).pipe(delay(500));
  }
}
