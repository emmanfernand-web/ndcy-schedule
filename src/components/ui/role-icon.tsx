import {
  AudioWaveform,
  Drum,
  Guitar,
  Keyboard,
  Mic,
  MicVocal,
  Music,
  type LucideIcon,
} from 'lucide-react';
import type { MemberRole } from '@/types/database';

const ICONS: Record<MemberRole, LucideIcon> = {
  Gitar: Guitar,
  Bass: AudioWaveform,
  Drum: Drum,
  'Lead Keys': Keyboard,
  Filler: Music,
  WL: Mic,
  Singers: MicVocal,
};

export function RoleIcon({
  role,
  className = 'h-5 w-5',
}: {
  role: MemberRole;
  className?: string;
}) {
  const Icon = ICONS[role];
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
