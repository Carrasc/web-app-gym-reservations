import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/bookings';

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.endpoint);
  }

  reserve(bookingId: number): Observable<{ bookingId: number; reservedAt: string }> {
    return of({ bookingId, reservedAt: new Date().toISOString() }).pipe(delay(400));
  }
}
