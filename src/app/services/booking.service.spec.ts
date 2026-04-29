import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Booking } from '../models/booking.model';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request the bookings endpoint and return typed bookings', () => {
    const fakeBookings: Booking[] = [
      {
        id: 1,
        className: 'Yoga',
        instructor: 'Laura Gómez',
        schedule: 'Lunes 18:00',
        availableSpots: 10,
      },
    ];

    let received: Booking[] | undefined;
    service.getBookings().subscribe((bookings) => (received = bookings));

    const req = httpMock.expectOne('/api/bookings');
    expect(req.request.method).toBe('GET');
    req.flush(fakeBookings);

    expect(received).toEqual(fakeBookings);
  });

  it('should resolve a reservation with the given id', (done) => {
    service.reserve(42).subscribe((response) => {
      expect(response.bookingId).toBe(42);
      expect(response.reservedAt).toBeTruthy();
      done();
    });
  });
});
