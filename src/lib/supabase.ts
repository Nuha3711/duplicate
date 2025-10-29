import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FacultyProfile {
  id: string;
  email: string;
  full_name: string;
  college_name: string;
  years_experience: number;
  profile_picture_url?: string;
  research_publications: Array<{
    title: string;
    year: number;
    journal?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  faculty_id: string;
  course_name: string;
  course_code: string;
  semester: string;
  attendance_percentage: number;
  syllabus_percentage: number;
  compliance_percentage: number;
  status: 'compliant' | 'pending' | 'at-risk';
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  course_id: string;
  previous_percentage: number;
  new_percentage: number;
  reason: string;
  modified_by: string;
  modified_at: string;
}

export interface CSVUpload {
  id: string;
  faculty_id: string;
  course_id?: string;
  file_name: string;
  file_type: 'attendance' | 'syllabus';
  status: 'success' | 'failed' | 'processing';
  error_message?: string;
  uploaded_at: string;
}

export interface Reminder {
  id: string;
  faculty_id: string;
  course_id?: string;
  message: string;
  tone: 'gentle' | 'formal' | 'escalation';
  is_read: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  faculty_id: string;
  course_id?: string;
  title: string;
  content: string;
  created_at: string;
}
