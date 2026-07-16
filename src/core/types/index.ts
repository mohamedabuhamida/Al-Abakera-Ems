export type Student = {
  id: string;
  student_code: string;
  full_name: string;
  educational_stage: string;
  grade: string;
  parent_name: string;
  whatsapp_number: string;
  status: 'active' | 'inactive';
  registration_date: string;
  profiles?: {
    avatar_url: string;
  }
};