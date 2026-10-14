
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, timeout, finalize } from 'rxjs';
import { Facility, FacilityCondition } from '../models/facility.model';
import { Inspection } from '../models/inspection.model';
import { FacilityApiService } from '../services/facility-api.service';
import { apiErrorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-heading heading-row">
      <div>
        <div class="eyebrow">MONDAY, OCTOBER 12, 2026 <span class="eyebrow-line"></span> LIVE OVERVIEW</div>
        <h1>Facility health</h1>
        <p class="subhead">A clear view of the places your team depends on.</p>
      </div>
      <a class="button button-dark" routerLink="/inspections/new"><span>＋</span> Log an inspection</a>
    </section>

    @if (loading) {
      <div class="loading-state"><span class="spinner"></span> Gathering facility data…</div>
    }

    @if (error) {
      <div class="alert alert-error" role="alert">
        {{ error }}
        <button class="text-button" (click)="load()">Retry</button>
      </div>
    }

    @if (!loading && !error) {
      <section class="metric-grid" aria-label="Facility metrics">
        <article class="metric-card metric-ink">
          <div class="metric-top"><span>REGISTERED FACILITIES</span><span class="metric-glyph">▦</span></div>
          <strong>{{ facilityTotal }}</strong>
          <div class="metric-foot">Across your operational footprint</div>
          <div class="metric-decoration"></div>
        </article>

        <article class="metric-card">
          <div class="metric-top"><span>INSPECTIONS LOGGED</span><span class="metric-glyph green">◷</span></div>
          <strong>{{ inspectionTotal }}</strong>
          <div class="metric-foot">All records in the API</div>
          <div class="metric-rule"></div>
        </article>

        <article class="metric-card">
          <div class="metric-top"><span>NEEDS ATTENTION</span><span class="metric-glyph coral">!</span></div>
          <strong>{{ attentionCount }}</strong>
          <div class="metric-foot">Rated poor or critical</div>
          <div class="metric-rule coral-rule"></div>
        </article>

        <article class="metric-card">
          <div class="metric-top"><span>HEALTH SCORE</span><span class="metric-glyph green">↗</span></div>
          <strong>{{ healthScore }}<small class="metric-percent">%</small></strong>
          <div class="metric-foot">Good or excellent conditions</div>
          <div class="metric-rule"></div>
        </article>
      </section>

      <div class="dashboard-grid">
        <section class="panel facilities-panel">
          <div class="panel-heading">
            <div><div class="section-kicker">PORTFOLIO</div><h2>Facilities to watch</h2></div>
            <a class="quiet-link" routerLink="/facilities">All facilities <span>↗</span></a>
          </div>

          @if (facilities.length) {
            <div class="facility-list">
              @for (facility of facilities.slice(0, 5); track facility.id) {
                <a class="facility-row" [routerLink]="['/facilities', facility.id]">
                  <span [class]="'facility-avatar ' + avatarClass(facility.condition_status)">{{ initials(facility.name) }}</span>
                  <span class="facility-name"><strong>{{ facility.name }}</strong><small>{{ facility.location }}</small></span>
                  <span [class]="'condition-badge condition-' + facility.condition_status">{{ facility.condition_status }}</span>
                  <span class="row-arrow">↗</span>
                </a>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span class="empty-icon">▦</span>
              <strong>No facilities yet</strong>
              <span>When facilities are added to the API, they will appear here.</span>
              <a routerLink="/facilities">View facilities</a>
            </div>
          }
        </section>

        <section class="panel recent-panel">
          <div class="panel-heading">
            <div><div class="section-kicker">FIELD LOG</div><h2>Latest inspections</h2></div>
            <a class="quiet-link" routerLink="/inspections">View log <span>↗</span></a>
          </div>

          @if (inspections.length) {
            <div class="inspection-list">
              @for (inspection of inspections.slice(0, 4); track inspection.id) {
                <article class="inspection-row">
                  <span class="inspection-date">
                    <strong>{{ inspection.inspection_date | date:'dd' }}</strong>
                    <small>{{ inspection.inspection_date | date:'MMM' }}</small>
                  </span>
                  <span class="inspection-copy">
                    <strong>{{ inspection.facility?.name || facilityName(inspection.facility_id) }}</strong>
                    <small>{{ inspection.findings }}</small>
                  </span>
                  <span [class]="'condition-dot condition-' + inspection.condition_status" [attr.aria-label]="inspection.condition_status"></span>
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span class="empty-icon">◷</span>
              <strong>No inspection records</strong>
              <span>The activity log is waiting for its first visit.</span>
              <a routerLink="/inspections/new">Create an inspection</a>
            </div>
          }
        </section>
      </div>

      <section class="attention-strip">
        <span class="attention-mark">!</span>
        <div>
          <strong>{{ attentionCount ? 'A closer look is needed' : 'Your facilities are looking steady' }}</strong>
          <span>{{ attentionCount ? attentionCount + ' facilities are currently rated poor or critical.' : 'No facilities are currently rated poor or critical.' }}</span>
        </div>
        <a routerLink="/facilities">Review portfolio <span>→</span></a>
      </section>
    }
  `
})
export class DashboardPage implements OnInit {
  private readonly api = inject(FacilityApiService);

  facilities: Facility[] = [];
  inspections: Inspection[] = [];
  facilityTotal = 0;
  inspectionTotal = 0;
  loading = true;
  error = '';

  get attentionCount(): number {
    return this.facilities.filter(
      ({ condition_status }) => condition_status === 'poor' || condition_status === 'critical'
    ).length;
  }

  get healthScore(): number {
    if (!this.facilities.length) return 0;

    const healthy = this.facilities.filter(
      ({ condition_status }) => condition_status === 'good' || condition_status === 'excellent'
    ).length;

    return Math.round((healthy / this.facilities.length) * 100);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      facilities: this.api.getFacilities({ perPage: 100 }).pipe(
        timeout({ first: 10000 })
      ),
      inspections: this.api.getInspections({ perPage: 8 }).pipe(
        timeout({ first: 10000 })
      )
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ({ facilities, inspections }) => {
        this.facilities = facilities.data ?? [];
        this.inspections = inspections.data ?? [];
        this.facilityTotal = facilities.total ?? this.facilities.length;
        this.inspectionTotal = inspections.total ?? this.inspections.length;
      },
      error: (error: unknown) => {
        this.error = apiErrorMessage(error);
      }
    });
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  avatarClass(condition: FacilityCondition): string {
    return `avatar-${condition}`;
  }

  facilityName(id: number): string {
    return this.facilities.find((facility) => facility.id === id)?.name ?? `Facility #${id}`;
  }
}
