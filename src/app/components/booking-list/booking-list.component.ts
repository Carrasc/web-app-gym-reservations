import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingListComponent implements OnInit {
  @Output() readonly bookingSelected = new EventEmitter<Booking>();

  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchBookings();
  }

  retry(): void {
    this.fetchBookings();
  }

  onSelect(booking: Booking): void {
    this.bookingSelected.emit(booking);
  }

  private fetchBookings(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.bookingService
      .getBookings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (bookings) => {
          this.bookings.set(bookings);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'No pudimos cargar las reservas. Verificá tu conexión e intentá nuevamente.',
          );
          this.loading.set(false);
        },
      });
  }
}
