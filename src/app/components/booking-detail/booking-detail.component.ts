import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';

type ReservationStatus = 'idle' | 'submitting' | 'confirmed' | 'error';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailComponent {
  @Output() readonly back = new EventEmitter<void>();

  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly bookingState = signal<Booking | null>(null);

  readonly status = signal<ReservationStatus>('idle');
  readonly errorMessage = signal<string | null>(null);
  readonly booking = computed(() => this.bookingState());
  readonly isSoldOut = computed(() => (this.bookingState()?.availableSpots ?? 0) <= 0);

  readonly spotsControl = new FormControl<number>(1, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1)],
  });

  @Input({ required: true })
  set selectedBooking(value: Booking) {
    this.bookingState.set(value);
    this.status.set('idle');
    this.errorMessage.set(null);
    const max = Math.max(1, value.availableSpots);
    this.spotsControl.setValidators([Validators.required, Validators.min(1), Validators.max(max)]);
    this.spotsControl.setValue(value.availableSpots > 0 ? 1 : 0, { emitEvent: false });
    this.spotsControl.updateValueAndValidity();
  }

  reserve(): void {
    const booking = this.bookingState();
    if (!booking || this.spotsControl.invalid || this.isSoldOut()) {
      this.spotsControl.markAsTouched();
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set(null);

    this.bookingService
      .reserve(booking.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.status.set('confirmed'),
        error: () => {
          this.status.set('error');
          this.errorMessage.set('No se pudo completar la reserva. Intentá nuevamente.');
        },
      });
  }

  goBack(): void {
    this.back.emit();
  }
}
