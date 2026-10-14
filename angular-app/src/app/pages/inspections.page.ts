import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FacilityCondition } from '../models/facility.model';
import { Inspection } from '../models/inspection.model';
import { FacilityApiService } from '../services/facility-api.service';
import { apiErrorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-heading heading-row"><div><div class="eyebrow">FIELD LOG <span class="eyebrow-line"></span> {{ total }} RECORDS</div><h1>Inspections</h1><p class="subhead">A running record of checks across your facilities.</p></div><a class="button button-dark" routerLink="/inspections/new"><span>＋</span> New inspection</a></section>
    <section class="panel directory-panel"><div class="directory-toolbar"><div class="log-intro">Recent inspection records</div><label class="filter-inline"><span>Condition</span><select [(ngModel)]="condition" (ngModelChange)="load()"><option value="">All</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option><option value="critical">Critical</option></select></label></div>
      @if (loading) { <div class="loading-state"><span class="spinner"></span> Loading inspection records…</div> }
      @if (error) { <div class="alert alert-error" role="alert">{{ error }} <button class="text-button" (click)="load()">Retry</button></div> }
      @if (!loading && !error && inspections.length) { <div class="inspection-table">
        @for (inspection of inspections; track inspection.id) { <article class="inspection-card"><span class="inspection-date"><strong>{{ inspection.inspection_date | date:'dd' }}</strong><small>{{ inspection.inspection_date | date:'MMM yyyy' }}</small></span><div class="inspection-card-main"><div class="inspection-card-heading"><a [routerLink]="['/facilities', inspection.facility_id]">{{ inspection.facility?.name || 'Facility #' + inspection.facility_id }}</a><span class="condition-badge" [class]="'condition-badge condition-' + inspection.condition_status">{{ inspection.condition_status }}</span></div><p>{{ inspection.findings }}</p><small>{{ inspection.remarks || 'No additional remarks' }} <span class="record-divider">·</span> Inspector #{{ inspection.user_id }}</small></div><a class="table-arrow" [routerLink]="['/facilities', inspection.facility_id]" [attr.aria-label]="'Open facility for inspection ' + inspection.id">↗</a></article> }
      </div><div class="table-footer"><span>Showing <strong>{{ inspections.length }}</strong> of <strong>{{ total }}</strong> inspections</span><span>Newest first</span></div> }
      @else if (!loading && !error) { <div class="empty-state directory-empty"><span class="empty-icon">◷</span><strong>No inspections found</strong><span>{{ condition ? 'No records match this condition.' : 'Start your field log with a new inspection.' }}</span><a routerLink="/inspections/new">Create an inspection</a></div> }
    </section>
  `
})
export class InspectionsPage implements OnInit {
  private readonly api = inject(FacilityApiService);
  inspections: Inspection[] = [];
  total = 0;
  condition = '';
  loading = true;
  error = '';

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getInspections({ perPage: 100, condition: this.condition ? this.condition as FacilityCondition : undefined }).subscribe({
      next: (page) => { this.inspections = page.data; this.total = page.total; this.loading = false; },
      error: (error: unknown) => { this.error = apiErrorMessage(error); this.loading = false; }
    });
  }
}
