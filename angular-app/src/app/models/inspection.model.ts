import { Facility, FacilityCondition } from './facility.model';

export interface Inspector {
  id: number;
  name: string;
  email?: string;
}

export interface Inspection {
  id: number;
  facility_id: number;
  user_id: number;
  inspection_date: string;
  condition_status: FacilityCondition;
  findings: string;
  remarks: string | null;
  facility?: Facility;
  user?: Inspector;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInspection {
  facility_id: number;
  user_id: number;
  inspection_date: string;
  condition_status: FacilityCondition;
  findings: string;
  remarks: string | null;
}
