import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Facility, FacilityCondition } from '../models/facility.model';
import { CreateInspection, Inspection } from '../models/inspection.model';
import { LaravelPage } from '../models/api.model';

const API_URL = 'http://127.0.0.1:8000/api';

@Injectable({ providedIn: 'root' })
export class FacilityApiService {
  private readonly http = inject(HttpClient);

  getFacilities(options: { page?: number; perPage?: number; search?: string; condition?: FacilityCondition } = {}): Observable<LaravelPage<Facility>> {
    let params = new HttpParams().set('page', options.page ?? 1).set('per_page', options.perPage ?? 100);
    if (options.search?.trim()) params = params.set('search', options.search.trim());
    if (options.condition) params = params.set('condition_status', options.condition);
    return this.http.get<LaravelPage<Facility>>(`${API_URL}/facilities`, { params });
  }

  getFacility(id: number): Observable<Facility> {
    return this.http.get<Facility>(`${API_URL}/facilities/${id}`);
  }

  getInspections(options: { page?: number; perPage?: number; facilityId?: number; condition?: FacilityCondition } = {}): Observable<LaravelPage<Inspection>> {
    let params = new HttpParams().set('page', options.page ?? 1).set('per_page', options.perPage ?? 100);
    if (options.facilityId) params = params.set('facility_id', options.facilityId);
    if (options.condition) params = params.set('condition_status', options.condition);
    return this.http.get<LaravelPage<Inspection>>(`${API_URL}/inspections`, { params });
  }

  getInspection(id: number): Observable<Inspection> {
    return this.http.get<Inspection>(`${API_URL}/inspections/${id}`);
  }

  createInspection(payload: CreateInspection): Observable<Inspection> {
    return this.http.post<Inspection>(`${API_URL}/inspections`, payload);
  }

}
