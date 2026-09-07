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
  private readonly baseUrl = '/events';

  getEventDetails(eventId: string): Observable<EventDetails> {
    return this.get<EventDetails>(`${this.baseUrl}/${eventId}`);
  }
}
