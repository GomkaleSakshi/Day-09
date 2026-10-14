import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Facility } from '../models/facility.model';
import { Inspection } from '../models/inspection.model';
import { FacilityApiService } from '../services/facility-api.service';
import { apiErrorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a class="back-link" routerLink="/facilities">← All facilities</a>
    @if (loading) { <div class="loading-state"><span class="spinner"></span> Loading facility…</div> }
    @if (error) { <div class="alert alert-error" role="alert">{{ error }} <a routerLink="/facilities">Return to facilities</a></div> }
    @if (facility && !loading) {
      <section class="detail-hero"><div class="detail-topline"><div class="eyebrow">FACILITY RECORD <span class="eyebrow-line"></span> ID-{{ facility.id.toString().padStart(3, '0') }}</div><span class="condition-badge" [class]="'condition-badge condition-' + facility.condition_status">{{ facility.condition_status }}</span></div><h1>{{ facility.name }}</h1><p class="detail-location">⌖ {{ facility.location }}</p></section>
      <div class="detail-grid"><section class="panel detail-info"><div class="section-kicker">FACILITY PROFILE</div><h2>At a glance</h2><dl class="detail-list"><div><dt>Facility type</dt><dd>{{ facility.facility_type }}</dd></div><div><dt>Current condition</dt><dd><span class="condition-dot" [class]="'condition-dot condition-' + facility.condition_status"></span>{{ facility.condition_status | titlecase }}</dd></div><div><dt>Last updated</dt><dd>{{ facility.updated_at ? (facility.updated_at | date:'longDate') : 'Not provided by API' }}</dd></div><div><dt>Description</dt><dd>{{ facility.description || 'No description provided.' }}</dd></div></dl></section>
        <section class="panel detail-history"><div class="panel-heading"><div><div class="section-kicker">FIELD LOG</div><h2>Inspection history</h2></div><a class="button button-small button-dark" [routerLink]="['/inspections/new']" [queryParams]="{ facility: facility.id }">＋ Log visit</a></div>
          @if (history.length) { <div class="inspection-list">@for (entry of history; track entry.id) { <article class="inspection-row"><span class="inspection-date"><strong>{{ entry.inspection_date | date:'dd' }}</strong><small>{{ entry.inspection_date | date:'MMM' }}</small></span><span class="inspection-copy"><strong>{{ entry.condition_status | titlecase }}</strong><small>{{ entry.findings }}</small></span><span class="condition-dot" [class]="'condition-dot condition-' + entry.condition_status"></span></article> }</div> }
          @else { <div class="empty-state"><span class="empty-icon">◷</span><strong>No visits logged</strong><span>There is no inspection history for this facility yet.</span></div> }
        </section></div>
    }
  `
})
export class FacilityDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(FacilityApiService);
  facility: Facility | null = null;
  history: Inspection[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(switchMap((params) => this.api.getFacility(Number(params.get('id'))))).subscribe({
      next: (facility) => {
        this.facility = facility;
        this.loading = false;
        this.api.getInspections({ facilityId: facility.id, perPage: 100 }).subscribe({
          next: (page) => { this.history = page.data; },
          error: (error: unknown) => { this.error = apiErrorMessage(error); }
        });
      },
      error: (error: unknown) => { this.error = apiErrorMessage(error); this.loading = false; }
    });
  }
}
