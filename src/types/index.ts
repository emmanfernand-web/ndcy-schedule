// Custom UI types for component props

// Custom UI types for component props

import type {
  MemberRole,
  MonthlyPeriod,
  Member,
  Songlist,
  ScheduleEventWithAssignments,
  Availability,
} from './database';

// --- Instrument / Role selector ---


// --- Instrument / Role selector ---

export interface Instrument {
  id: MemberRole;
  label: string;
}

// --- Role Selector component props ---

export interface RoleSelectorProps {
  selectedRole: MemberRole | null;
  onSelect: (role: MemberRole) => void;
}

// --- Name Grid component props ---

export interface NameGridProps {
  role: MemberRole;
  selectedMemberId: string | null;
  onSelect: (memberId: string) => void;
}

// --- Schedule Section component props ---

export interface ScheduleSectionProps {
  memberId: string;
  memberName: string;
  period: MonthlyPeriod;
}

// --- Schedule Matrix View props ---

export interface ScheduleMatrixViewProps {
  events: ScheduleEventWithAssignments[];
}

// --- Song List View props ---

export interface SongListViewProps {
  songs: Songlist[];
}

// --- Songlist Form props ---

export interface SonglistFormProps {
  monthYear: string;
  initialSongs: Songlist[];
}

// --- Matrix Editor props ---

export interface MatrixEditorProps {
  monthYear: string;
  events: ScheduleEventWithAssignments[];
  availableMembers: Member[];
  availabilities?: Availability[];
}

// --- Dress Code Editor props ---

export interface DressCodeEditorProps {
  events: ScheduleEventWithAssignments[];
  onUpdate: (eventId: string, dresscode: string) => Promise<void>;
}

// --- Export Button props ---

export interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

// --- Toast / notification state ---

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// --- API response helpers ---

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
