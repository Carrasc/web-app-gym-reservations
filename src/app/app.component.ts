import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { BookingDetailComponent } from './components/booking-detail/booking-detail.component';
import { BookingListComponent } from './components/booking-list/booking-list.component';
import { Booking } from './models/booking.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingListComponent, BookingDetailComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly selectedBooking = signal<Booking | null>(null);

  onBookingSelected(booking: Booking): void {
    this.selectedBooking.set(booking);
  }

  onBackToList(): void {
    this.selectedBooking.set(null);
  }
}
