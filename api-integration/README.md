# API integration

The Angular client calls the Day-08 Laravel API at `http://127.0.0.1:8000/api`. The integration is implemented in `angular-app/src/app/services/facility-api.service.ts` using Angular `HttpClient`, typed Observables, and query parameters. Laravel pagination responses are read from the `data` array and pagination fields, not treated as plain arrays.

## Verified Day-08 endpoints

These routes are registered with Laravel `Route::apiResource` in `routes/api.php`:

| Method | Endpoint | Observed response / behavior |
| --- | --- | --- |
| GET | `/facilities` | Laravel paginator with `data`, `current_page`, `last_page`, `per_page`, `total`, and links/URLs. Defaults to 15 records, ordered by ascending `id`. Supports `search`, `condition_status`, `per_page`, and Laravel's `page`. |
| GET | `/facilities/{id}` | One facility object. |
| POST | `/facilities` | Creates a facility; returns its object with HTTP 201. Required: `name`, `location`, `facility_type`, `condition_status`; optional: `description`. Condition is one of `excellent`, `good`, `fair`, `poor`, `critical`. |
| GET | `/inspections` | Laravel paginator. Each row is eager-loaded with `facility` and `user`. Supports `facility_id`, `user_id`, `condition_status`, `inspection_date`, `search`, `per_page`, and `page`. Ordered newest inspection date first. |
| GET | `/inspections/{id}` | One inspection object eager-loaded with `facility` and `user`. |
| POST | `/inspections` | Creates an inspection; returns the inspection with its `facility` and `user` relations and HTTP 201. Required: `facility_id`, `user_id`, `inspection_date`, `condition_status`, `findings`; optional: `remarks`. |

The facility browser loads up to 100 records and filters/sorts those returned records in the client. For larger installations, use the Laravel `search`, `condition_status`, and `page` query parameters directly; the current UI does not implement page navigation. API validation errors use Laravel's validation response (HTTP 422 with `message` and field `errors`). DELETE/PUT/PATCH routes are registered by Laravel but are not used by this dashboard.

## Inspection user ID

Day-08 has no users API route. Its inspection POST validation requires an existing `user_id`, so the form requests that ID from the operator and reports Laravel errors if it does not exist. The checked-in Day-08 `UserSeeder` uses example inspector IDs 2 and 5, but existing database contents can change IDs. Confirm the actual ID in the Day-08 `users` table; this project deliberately does not assume one.

## CORS

The checked Day-08 source registers API routes but has no `config/cors.php` and does not explicitly configure CORS in `bootstrap/app.php`. The `HandleCors` middleware is included in Laravel's global middleware stack, but origins/paths must be configured so that the browser can call the API from the Angular dev server. Keep the Laravel backend unchanged unless you choose to configure it separately. In a local copy of Day-08, publish or add Laravel's CORS configuration with settings equivalent to:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:4200', 'http://127.0.0.1:4200'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

Then clear Laravel's cached configuration (`php artisan config:clear`) and restart `php artisan serve`. This app sends no cookies or authentication credentials. Do not use `*` origins for a credentialed API.

## Troubleshooting

- Start Day-08 at `http://127.0.0.1:8000` and verify `http://127.0.0.1:8000/api/facilities` returns JSON before opening the Angular app.
- A red API message saying it cannot reach Laravel usually means the server is stopped, the port differs, or CORS blocks the browser request.
- HTTP 422 means Laravel rejected the submitted fields. Check the field errors in the response, especially `user_id` and facility existence.
- Empty states are rendered when valid paginator responses contain an empty `data` array.
- Client-side sorting/search covers only the facilities currently loaded (up to 100); backend search and condition filters are available in the service for API-driven filtering.

## Contract source

Routes and payload shapes were checked in Day-08 `laravel-api/routes/api.php`, `app/Http/Controllers/FacilityController.php`, `app/Http/Controllers/InspectionController.php`, both Eloquent models, and the user/facility/inspection seeders. Day-08 files were only read; they are not changed by this project.
