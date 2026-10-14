# Day-09 | Facility Inspection Dashboard

A responsive facility-operations dashboard built with Angular standalone components and TypeScript, integrated with the Day-08 Laravel REST API. The UI is designed around real facility and inspection data from the API rather than local mock records.

## Project structure

```text
Day-09/
├── angular-app/       Angular standalone frontend
├── api-integration/   Verified API contract and CORS notes
└── README.md
```

## Requirements

- Node.js and npm (checked here: Node.js `v24.21.0`, npm `11.19.0`)
- Angular CLI `22.2.2` is available via `npx`; it was not installed globally
- Day-08 Laravel backend configured with its database and running at `http://127.0.0.1:8000`
- CORS configured in the Day-08 API for the Angular origin as described in [API integration](api-integration/README.md)

## Run the application

In PowerShell, from the existing `Day-09` folder:

```powershell
cd .\angular-app
npm install
npm start
```

Open `http://localhost:4200`. The app expects the API at `http://127.0.0.1:8000/api`.

To compile a production build:

```powershell
cd .\angular-app
npm run build
```

No global Angular CLI install is required; npm scripts use the project's local CLI after `npm install`.

## Run and test API integration

In a second PowerShell terminal, start the existing Day-08 Laravel backend. Adjust the path if your Desktop directory differs:

```powershell
cd "$HOME\OneDrive\Desktop\Day-08\laravel-api"
php artisan serve --host=127.0.0.1 --port=8000
```

Verify the resources independently:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/facilities
Invoke-RestMethod http://127.0.0.1:8000/api/inspections
```

Then open the dashboard at `http://localhost:4200`. Check the browser Network panel for the facility and inspection GET calls. Submit a new inspection with a valid facility and the actual `user_id` from the Day-08 `users` database table; successful creation returns HTTP 201 and the app navigates to the inspection log. You can also test the POST directly with a real facility/user pair:

```powershell
$payload = @{
  facility_id = 1
  user_id = 2
  inspection_date = (Get-Date -Format 'yyyy-MM-dd')
  condition_status = 'good'
  findings = 'Routine visual and safety checks completed.'
  remarks = 'Created from the Day-09 integration test.'
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/inspections -ContentType 'application/json' -Body $payload
```

Replace IDs with existing records in your database. The Day-08 seeder shows example values but does not guarantee IDs in an already populated database.

## Implemented

- Angular standalone pages and route titles for Dashboard, Facilities, Facility Details, Inspections, and New Inspection
- Typed facility, inspection, inspector, and Laravel paginator interfaces
- Angular Router route parameters and facility-specific inspection history
- Dependency-injected API service using `HttpClient`, typed Observables, `forkJoin`, and RxJS subscriptions
- Live dashboard metrics and recent activity, with loading, empty, retry, and API error states
- Facility search, condition filtering, sorting, and record details
- Inspection condition filtering and list, including related facility/user data returned by Laravel
- Reactive inspection form with required field, minimum length, numeric ID, pending submission, and API validation handling
- Responsive layout for desktop and mobile viewports

## Known integration requirements

- The Day-08 source has no users endpoint. The required inspector ID must be entered and must exist in the database.
- The checked Day-08 source has no `config/cors.php` and no explicit CORS configuration. Browser API calls from port 4200 will need an allowed-origin CORS configuration if the currently installed middleware settings do not permit them. Instructions are in [api-integration/README.md](api-integration/README.md).
- The dashboard and facilities page request up to 100 records; client-side facility filtering and sorting operate on that returned set. Laravel's paginator metadata is preserved and server-side filtering parameters are implemented.
- API integration is source-verified but requires the Day-08 server/database and browser CORS setup to be running locally for live testing.
