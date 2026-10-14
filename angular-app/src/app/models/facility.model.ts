export type FacilityCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface Facility {
  id: number;
  name: string;
  location: string;
  facility_type: string;
  condition_status: FacilityCondition;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}
