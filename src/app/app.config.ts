import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { mockBookingsInterceptor } from './interceptors/mock-bookings.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([mockBookingsInterceptor]))],
};
