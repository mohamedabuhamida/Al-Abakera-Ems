export type Student = {
  id: string;
  student_code: string;
  full_name: string;
  educational_stage: string | null;
  grade: string | null;
  parent_name: string | null;
  whatsapp_number: string | null;
  status: 'active' | 'inactive';
  registration_date: string;
  gender?: string | null;
  school?: string | null;
  address?: string | null;
  active_groups?: number;
  current_balance?: number;
  overdue_count?: number;
  profiles?: {
    avatar_url: string | null;
  }
};
