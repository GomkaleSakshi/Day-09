import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Facility, FacilityCondition } from '../models/facility.model';
import { FacilityApiService } from '../services/facility-api.service';
import { apiErrorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-heading"><div><div class="eyebrow">YOUR ESTATE <span class="eyebrow-line"></span> {{ facilities.length }} RECORDS</div><h1>Facilities</h1><p class="subhead">Find a place, check its condition, and get into the details.</p></div></section>
    <section class="panel directory-panel">
      <div class="directory-toolbar"><label class="search-box"><span>⌕</span><input type="search" [(ngModel)]="search" (ngModelChange)="applyFilters()" placeholder="Search name, location, type…" aria-label="Search facilities"><kbd>⌘ K</kbd></label><div class="toolbar-controls"><label class="sr-only" for="condition-filter">Condition</label><select id="condition-filter" [(ngModel)]="condition" (ngModelChange)="applyFilters()"><option value="">All conditions</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option><option value="critical">Critical</option></select><label class="sr-only" for="sort-field">Sort facilities</label><select id="sort-field" [(ngModel)]="sortField" (ngModelChange)="sortFacilities()"><option value="name">Name A–Z</option><option value="condition_status">Condition</option><option value="location">Location</option></select><button class="icon-button" type="button" (click)="toggleDirection()" [attr.aria-label]="ascending ? 'Sort descending' : 'Sort ascending'">{{ ascending ? '↑' : '↓' }}</button></div></div>
      @if (loading) { <div class="loading-state"><span class="spinner"></span> Loading facilities…</div> }
      @if (error) { <div class="alert alert-error" role="alert">{{ error }} <button class="text-button" (click)="load()">Retry</button></div> }
      @if (!loading && !error && visibleFacilities.length) {
        <div class="table-wrap"><table><thead><tr><th>FACILITY</th><th>TYPE</th><th>LOCATION</th><th>CONDITION</th><th><span class="sr-only">Details</span></th></tr></thead><tbody>
          @for (facility of visibleFacilities; track facility.id) { <tr><td><a class="table-name" [routerLink]="['/facilities', facility.id]">{{ facility.name }}<small>ID-{{ facility.id.toString().padStart(3, '0') }}</small></a></td><td>{{ facility.facility_type }}</td><td>{{ facility.location }}</td><td><span class="condition-badge" [class]="'condition-badge condition-' + facility.condition_status">{{ facility.condition_status }}</span></td><td><a class="table-arrow" [routerLink]="['/facilities', facility.id]" [attr.aria-label]="'Open ' + facility.name">↗</a></td></tr> }
        </tbody></table></div>
        <div class="table-footer"><span>Showing <strong>{{ visibleFacilities.length }}</strong> of <strong>{{ total }}</strong> facilities</span><span>Ordered by {{ sortLabel }}</span></div>
      } @else if (!loading && !error) { <div class="empty-state directory-empty"><span class="empty-icon">⌕</span><strong>{{ facilities.length ? 'No matches found' : 'No facilities in the API' }}</strong><span>{{ facilities.length ? 'Try changing the search or condition filter.' : 'Add a facility through the Laravel API to get started.' }}</span><button *ngIf="search || condition" class="text-button" (click)="resetFilters()">Clear filters</button></div> }
    </section>
  `
})
export class FacilitiesPage implements OnInit {
  private readonly api = inject(FacilityApiService);
  facilities: Facility[] = [];
  visibleFacilities: Facility[] = [];
  total = 0;
  search = '';
  condition = '';
  sortField: 'name' | 'condition_status' | 'location' = 'name';
  ascending = true;
  loading = true;
  error = '';

  get sortLabel(): string { return this.sortField === 'condition_status' ? 'condition' : this.sortField; }
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getFacilities({ perPage: 100 }).subscribe({
      next: (page) => { this.facilities = page.data; this.total = page.total; this.applyFilters(); this.loading = false; },
      error: (error: unknown) => { this.error = apiErrorMessage(error); this.loading = false; }
    });
  }

  applyFilters(): void {
    const query = this.search.trim().toLocaleLowerCase();
    this.visibleFacilities = this.facilities.filter((facility) => {
      const searchable = `${facility.name} ${facility.location} ${facility.facility_type}`.toLocaleLowerCase();
      return (!query || searchable.includes(query)) && (!this.condition || facility.condition_status === this.condition);
    });
    this.sortFacilities();
  }

  sortFacilities(): void {
    this.visibleFacilities.sort((left, right) => {
      const first = left[this.sortField];
      const second = right[this.sortField];
      return String(first).localeCompare(String(second)) * (this.ascending ? 1 : -1);
    });
  }

  toggleDirection(): void { this.ascending = !this.ascending; this.sortFacilities(); }
  resetFilters(): void { this.search = ''; this.condition = ''; this.applyFilters(); }
}
