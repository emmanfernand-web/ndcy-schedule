// Database types matching the Supabase PostgreSQL schema

export interface MonthlyPeriod {
  id: string;
  month_year: string; // e.g., '2024-10'
  label: string; // e.g., 'October 2024'
  is_active: boolean;
}

export type MemberRole =
  | 'Gitar'
  | 'Bass'
  | 'Drum'
  | 'Lead Keys'
  | 'Filler'
  | 'WL'
  | 'Singers';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  is_probation: boolean;
  is_active: boolean;
}

export interface Availability {
  id: string;
  member_id: string;
  month_year: string;
  cp_dates: string[]; // Array of date strings, e.g., ['2024-10-05', '2024-10-06']
  lw_dates: string[];
}

export type ServiceLocation = 'CP' | 'LW';

export interface ScheduleEvent {
  id: string;
  month_year: string;
  week_number: number;
  location: ServiceLocation;
  service_date: string; // ISO date string
  sub_service: string; // e.g., 'Pagi', 'Siang', 'Malam'
  dresscode: string;
}

export interface ScheduleAssignment {
  id: string;
  event_id: string;
  member_id: string;
  role: MemberRole;
}

export type SongCategory = 'P' | 'W' | 'P/W';

export interface Songlist {
  id: string;
  month_year: string;
  weekend_dates: string; // e.g., 'Oct 5-6'
  song_title: string;
  song_by: string;
  category: SongCategory;
  sequencer_key: string; // e.g., 'C', 'D', 'Am'
  suggested_key_male: string;
  suggested_key_female: string;
  order_index: number;
  is_highlighted: boolean;
}

// Joined types for rich queries
export interface ScheduleAssignmentWithMember extends ScheduleAssignment {
  members: Member;
}

export interface ScheduleEventWithAssignments extends ScheduleEvent {
  schedule_assignments: ScheduleAssignmentWithMember[];
}

export interface AvailabilityWithMember extends Availability {
  members: Member;
}
