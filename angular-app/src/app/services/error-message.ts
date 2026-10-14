import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Could not reach the Laravel API. Check that it is running at 127.0.0.1:8000 and allows this app through CORS.';
    if (error.status === 422) {
      const messages = Object.values(error.error?.errors ?? {}).flat();
      return messages.length ? messages.join(' ') : error.error?.message ?? 'The API rejected one or more fields.';
    }
    if (error.status === 404) return 'This record was not found. It may have been removed.';
    return error.error?.message ?? `The API request failed (${error.status}).`;
  }
  return 'Something unexpected happened while loading this page.';
}
