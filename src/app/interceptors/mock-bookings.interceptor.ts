import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

import { Booking } from '../models/booking.model';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    className: 'Yoga',
    instructor: 'Laura Gómez',
    schedule: 'Lunes 18:00',
    availableSpots: 10,
  },
  {
    id: 2,
    className: 'Crossfit',
    instructor: 'Martín Pereyra',
    schedule: 'Martes 19:30',
    availableSpots: 6,
  },
  {
    id: 3,
    className: 'Spinning',
    instructor: 'Sofía Méndez',
    schedule: 'Miércoles 08:00',
    availableSpots: 12,
  },
  {
    id: 4,
    className: 'Pilates',
    instructor: 'Camila Ríos',
    schedule: 'Jueves 17:00',
    availableSpots: 0,
  },
  {
    id: 5,
    className: 'Boxeo',
    instructor: 'Diego Álvarez',
    schedule: 'Viernes 20:00',
    availableSpots: 4,
  },
];

export const mockBookingsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url === '/api/bookings') {
    return of(new HttpResponse({ status: 200, body: MOCK_BOOKINGS })).pipe(delay(600));
  }
  return next(req);
};
