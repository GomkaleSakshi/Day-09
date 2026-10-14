import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard.page';
import { FacilitiesPage } from './pages/facilities.page';
import { FacilityDetailsPage } from './pages/facility-details.page';
import { InspectionsPage } from './pages/inspections.page';
import { NewInspectionPage } from './pages/new-inspection.page';

export const routes: Routes = [
  { path: '', component: DashboardPage, title: 'Overview | Facility Operations' },
  { path: 'facilities', component: FacilitiesPage, title: 'Facilities | Facility Operations' },
  { path: 'facilities/:id', component: FacilityDetailsPage, title: 'Facility details | Facility Operations' },
  { path: 'inspections', component: InspectionsPage, title: 'Inspections | Facility Operations' },
  { path: 'inspections/new', component: NewInspectionPage, title: 'New inspection | Facility Operations' },
  { path: '**', redirectTo: '' }
];
