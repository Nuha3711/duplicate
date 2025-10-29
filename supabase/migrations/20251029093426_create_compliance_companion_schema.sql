/*
  # Compliance Companion Database Schema

  ## Overview
  This migration creates the complete database schema for the Compliance Companion 
  academic compliance tracking system for faculty members.

  ## New Tables

  ### 1. `faculty_profiles`
  Stores faculty member information and profile details
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - Faculty email
  - `full_name` (text) - Faculty full name
  - `college_name` (text) - Associated college/university
  - `years_experience` (integer) - Years of teaching experience
  - `profile_picture_url` (text) - URL to profile picture
  - `research_publications` (jsonb) - Array of publication objects
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `courses`
  Stores course information and compliance metrics
  - `id` (uuid, primary key) - Unique course identifier
  - `faculty_id` (uuid, foreign key) - References faculty_profiles
  - `course_name` (text) - Name of the course
  - `course_code` (text) - Course code/number
  - `semester` (text) - Current semester
  - `attendance_percentage` (numeric) - Current attendance rate
  - `syllabus_percentage` (numeric) - Syllabus coverage percentage
  - `compliance_percentage` (numeric) - Overall compliance score
  - `status` (text) - Status: 'compliant', 'pending', 'at-risk'
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `attendance_records`
  Stores detailed attendance modification history
  - `id` (uuid, primary key) - Unique record identifier
  - `course_id` (uuid, foreign key) - References courses
  - `previous_percentage` (numeric) - Attendance before modification
  - `new_percentage` (numeric) - Updated attendance percentage
  - `reason` (text) - Reason for modification
  - `modified_by` (uuid) - Faculty member who made the change
  - `modified_at` (timestamptz) - Timestamp of modification

  ### 4. `csv_uploads`
  Tracks CSV file upload history
  - `id` (uuid, primary key) - Unique upload identifier
  - `faculty_id` (uuid, foreign key) - References faculty_profiles
  - `course_id` (uuid, foreign key) - References courses
  - `file_name` (text) - Original filename
  - `file_type` (text) - Type: 'attendance' or 'syllabus'
  - `status` (text) - Status: 'success', 'failed', 'processing'
  - `error_message` (text) - Error details if failed
  - `uploaded_at` (timestamptz) - Upload timestamp

  ### 5. `reminders`
  Stores automated compliance reminders
  - `id` (uuid, primary key) - Unique reminder identifier
  - `faculty_id` (uuid, foreign key) - References faculty_profiles
  - `course_id` (uuid, foreign key) - References courses
  - `message` (text) - Reminder message content
  - `tone` (text) - Tone: 'gentle', 'formal', 'escalation'
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. `announcements`
  Stores faculty announcements for students
  - `id` (uuid, primary key) - Unique announcement identifier
  - `faculty_id` (uuid, foreign key) - References faculty_profiles
  - `course_id` (uuid, foreign key) - References courses (nullable)
  - `title` (text) - Announcement title
  - `content` (text) - Announcement content
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Faculty can only access their own data
  - Authenticated users required for all operations
  - Policies enforce data isolation by faculty_id
*/

-- Create faculty_profiles table
CREATE TABLE IF NOT EXISTS faculty_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  college_name text DEFAULT 'University',
  years_experience integer DEFAULT 0,
  profile_picture_url text,
  research_publications jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faculty_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view own profile"
  ON faculty_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Faculty can update own profile"
  ON faculty_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Faculty can insert own profile"
  ON faculty_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  course_code text NOT NULL,
  semester text DEFAULT 'Fall 2025',
  attendance_percentage numeric(5,2) DEFAULT 0,
  syllabus_percentage numeric(5,2) DEFAULT 0,
  compliance_percentage numeric(5,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('compliant', 'pending', 'at-risk')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view own courses"
  ON courses FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert own courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can delete own courses"
  ON courses FOR DELETE
  TO authenticated
  USING (faculty_id = auth.uid());

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  previous_percentage numeric(5,2) NOT NULL,
  new_percentage numeric(5,2) NOT NULL,
  reason text NOT NULL,
  modified_by uuid NOT NULL REFERENCES faculty_profiles(id),
  modified_at timestamptz DEFAULT now()
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view own attendance records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = attendance_records.course_id
      AND courses.faculty_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can insert own attendance records"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (
    modified_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_id
      AND courses.faculty_id = auth.uid()
    )
  );

-- Create csv_uploads table
CREATE TABLE IF NOT EXISTS csv_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('attendance', 'syllabus')),
  status text DEFAULT 'processing' CHECK (status IN ('success', 'failed', 'processing')),
  error_message text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view own uploads"
  ON csv_uploads FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert own uploads"
  ON csv_uploads FOR INSERT
  TO authenticated
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own uploads"
  ON csv_uploads FOR UPDATE
  TO authenticated
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  message text NOT NULL,
  tone text DEFAULT 'gentle' CHECK (tone IN ('gentle', 'formal', 'escalation')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (faculty_id = auth.uid());

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view own announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can insert own announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can update own announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty can delete own announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (faculty_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_course_id ON attendance_records(course_id);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_faculty_id ON csv_uploads(faculty_id);
CREATE INDEX IF NOT EXISTS idx_reminders_faculty_id ON reminders(faculty_id);
CREATE INDEX IF NOT EXISTS idx_reminders_is_read ON reminders(is_read);
CREATE INDEX IF NOT EXISTS idx_announcements_faculty_id ON announcements(faculty_id);

-- Create function to automatically update compliance percentage
CREATE OR REPLACE FUNCTION update_compliance_percentage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.compliance_percentage := (NEW.attendance_percentage + NEW.syllabus_percentage) / 2;
  
  IF NEW.compliance_percentage >= 75 THEN
    NEW.status := 'compliant';
  ELSIF NEW.compliance_percentage >= 50 THEN
    NEW.status := 'pending';
  ELSE
    NEW.status := 'at-risk';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_compliance_on_insert
  BEFORE INSERT ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_percentage();

CREATE TRIGGER calculate_compliance_on_update
  BEFORE UPDATE ON courses
  FOR EACH ROW
  WHEN (OLD.attendance_percentage IS DISTINCT FROM NEW.attendance_percentage 
    OR OLD.syllabus_percentage IS DISTINCT FROM NEW.syllabus_percentage)
  EXECUTE FUNCTION update_compliance_percentage();

-- Create function to auto-generate reminders when compliance drops
CREATE OR REPLACE FUNCTION generate_compliance_reminder()
RETURNS TRIGGER AS $$
DECLARE
  reminder_message text;
  reminder_tone text;
BEGIN
  IF NEW.compliance_percentage < 75 AND (OLD.compliance_percentage IS NULL OR OLD.compliance_percentage >= 75) THEN
    IF NEW.compliance_percentage < 50 THEN
      reminder_tone := 'escalation';
      reminder_message := 'URGENT: Compliance for ' || NEW.course_name || ' has dropped to ' || 
                         ROUND(NEW.compliance_percentage, 1) || '%. Immediate action required.';
    ELSIF NEW.compliance_percentage < 65 THEN
      reminder_tone := 'formal';
      reminder_message := 'Attention: Compliance for ' || NEW.course_name || ' is at ' || 
                         ROUND(NEW.compliance_percentage, 1) || '%. Please review and update.';
    ELSE
      reminder_tone := 'gentle';
      reminder_message := 'Reminder: Compliance for ' || NEW.course_name || ' has decreased to ' || 
                         ROUND(NEW.compliance_percentage, 1) || '%. Consider updating records.';
    END IF;
    
    INSERT INTO reminders (faculty_id, course_id, message, tone)
    VALUES (NEW.faculty_id, NEW.id, reminder_message, reminder_tone);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_reminders
  AFTER INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION generate_compliance_reminder();