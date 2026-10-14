import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Facility, FacilityCondition } from '../models/facility.model';
import { FacilityApiService } from '../services/facility-api.service';
import { apiErrorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <a class="back-link" routerLink="/inspections">← Inspection log</a>
    <section class="page-heading"><div><div class="eyebrow">FIELD LOG <span class="eyebrow-line"></span> NEW RECORD</div><h1>Log an inspection</h1><p class="subhead">Capture the visit while the details are fresh.</p></div></section>
    @if (loadingFacilities) { <div class="loading-state"><span class="spinner"></span> Loading facilities…</div> }
    @if (loadError) { <div class="alert alert-error" role="alert">{{ loadError }} <button class="text-button" (click)="loadFacilities()">Retry</button></div> }
    <form class="panel form-panel" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="form-section-heading"><span class="form-step">01</span><div><h2>Visit details</h2><p>Where and when did the inspection take place?</p></div></div>
      <div class="form-grid"><label class="field field-wide"><span>Facility <b>*</b></span><select formControlName="facility_id"><option value="">Choose a facility</option>@for (facility of facilities; track facility.id) { <option [value]="facility.id">{{ facility.name }} · {{ facility.location }}</option> }</select>@if (showError('facility_id')) { <small class="field-error">Select a facility.</small> }</label>
        <label class="field"><span>Inspection date <b>*</b></span><input type="date" formControlName="inspection_date">@if (showError('inspection_date')) { <small class="field-error">Choose a valid inspection date.</small> }</label>
        <label class="field"><span>Condition found <b>*</b></span><select formControlName="condition_status"><option value="">Choose a condition</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option><option value="critical">Critical</option></select>@if (showError('condition_status')) { <small class="field-error">Select a condition.</small> }</label>
        <label class="field"><span>Inspector user ID <b>*</b></span><input type="number" min="1" step="1" formControlName="user_id" placeholder="Enter the Day-08 user ID">@if (showError('user_id')) { <small class="field-error">Enter a valid numeric user ID from the Laravel users table.</small> }<small class="field-hint">Required by the API. Seeded IDs may differ; verify the actual ID in your database.</small></label>
      </div>
      <div class="form-section-heading form-section-second"><span class="form-step">02</span><div><h2>Findings & notes</h2><p>Describe what you observed on site.</p></div></div>
      <div class="form-grid"><label class="field field-wide"><span>Findings <b>*</b></span><textarea rows="4" formControlName="findings" placeholder="Describe observations, hazards, and items checked…"></textarea>@if (showError('findings')) { <small class="field-error">Add findings for this inspection.</small> }</label><label class="field field-wide"><span>Additional remarks</span><textarea rows="3" formControlName="remarks" placeholder="Follow-up actions or context (optional)"></textarea></label></div>
      @if (submitError) { <div class="alert alert-error form-alert" role="alert">{{ submitError }}</div> }
      <div class="form-actions"><span><b>*</b> Required fields</span><div><a class="button button-quiet" routerLink="/inspections">Cancel</a><button class="button button-dark" type="submit" [disabled]="submitting || loadingFacilities"><span>{{ submitting ? '◌' : '＋' }}</span> {{ submitting ? 'Saving…' : 'Save inspection' }}</button></div></div>
    </form>
  `
})
export class NewInspectionPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(FacilityApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  facilities: Facility[] = [];
  loadingFacilities = true;
  loadError = '';
  submitting = false;
  submitError = '';
  form = this.fb.group({
    facility_id: ['', Validators.required],
    user_id: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
    inspection_date: [new Date().toISOString().slice(0, 10), Validators.required],
    condition_status: ['', Validators.required],
    findings: ['', [Validators.required, Validators.minLength(4)]],
    remarks: ['']
  });

  ngOnInit(): void {
    this.loadFacilities();
    const facility = this.route.snapshot.queryParamMap.get('facility');
    if (facility) this.form.controls.facility_id.setValue(facility);
  }

  loadFacilities(): void {
    this.loadingFacilities = true;
    this.loadError = '';
    this.api.getFacilities({ perPage: 100 }).subscribe({
      next: (page) => { this.facilities = page.data; this.loadingFacilities = false; },
      error: (error: unknown) => { this.loadError = apiErrorMessage(error); this.loadingFacilities = false; }
    });
  }

  showError(control: string): boolean {
    const field = this.form.get(control);
    return Boolean(field?.invalid && (field.dirty || field.touched));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.submitting = true;
    this.submitError = '';
    this.api.createInspection({
      facility_id: Number(value.facility_id),
      user_id: Number(value.user_id),
      inspection_date: value.inspection_date!,
      condition_status: value.condition_status as FacilityCondition,
      findings: value.findings!.trim(),
      remarks: value.remarks?.trim() || null
    }).subscribe({
      next: () => { this.submitting = false; void this.router.navigate(['/inspections']); },
      error: (error: unknown) => { this.submitError = apiErrorMessage(error); this.submitting = false; }
    });
  }
}
