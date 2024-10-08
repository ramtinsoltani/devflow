import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '@devflow/services';
import { catchError, throwError } from 'rxjs';

/** Intercepts all HTTP responses and creates error notifications when requests fail. */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      notifications.create({ type: 'error', message: error.error.message });

      return throwError(() => error);

    })
  );

};
