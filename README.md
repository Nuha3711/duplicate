# Compliance Companion

A modern, professional academic compliance dashboard for faculty members to track attendance, syllabus progress, and compliance data.

## Features

### Authentication
- Secure email/password authentication with Supabase
- Faculty profile creation and management
- Persistent session management

### Dashboard
- Personalized greeting with real-time compliance metrics
- Visual donut chart showing compliance status distribution
- Three key metric cards: Attendance, Syllabus Coverage, and Overall Compliance
- Recent courses list with color-coded status indicators
- Automated compliance calculation

### Courses Management
- Grid layout of all courses with detailed metrics
- Color-coded progress bars and status badges
- Real-time attendance modification with reason tracking
- Modal interface for updating attendance records
- Automatic compliance recalculation on updates

### CSV Upload
- Upload attendance and syllabus CSV files
- Real-time CSV validation and parsing
- Automatic percentage calculation from uploaded data
- Upload history with success/failure tracking
- Support for multiple CSV formats

### Reminders System
- Automated reminder generation when compliance drops below 75%
- Three tone levels: Gentle, Formal, and Escalation
- Filter reminders by All, Unread, or Read
- Mark individual or all reminders as read
- Real-time notification updates

### Reports & Analytics
- Summary dashboard with average metrics
- Course overview table with all compliance data
- Export to CSV (summary format)
- Export to Text/PDF (detailed report format)
- Comprehensive compliance breakdown

### Faculty Profile
- Editable profile information
- Research publications management
- Years of experience tracking
- Secure logout functionality
- Profile picture placeholder with initials

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom blue theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

The application uses the following tables:
- `faculty_profiles` - Faculty member information
- `courses` - Course data and compliance metrics
- `attendance_records` - Attendance modification history
- `csv_uploads` - Upload history and validation results
- `reminders` - Automated compliance reminders
- `announcements` - Faculty announcements for students

## Design Features

- Modern blue gradient theme
- Smooth animations and transitions
- Hover effects on interactive elements
- Responsive layout with sidebar navigation
- Professional typography using Inter font
- Shadow and depth effects for visual hierarchy
- Color-coded status indicators

## CSV Format Requirements

Your CSV files should contain a column named one of the following:
- `percentage`
- `percent`
- `value`

The system will automatically calculate the average of all numeric values in this column.

Example CSV:
```
student_id,percentage
001,85.5
002,92.0
003,78.5
```

## Automated Features

- Compliance percentage calculated as average of attendance and syllabus
- Automatic status assignment (Compliant, Pending, At-Risk)
- Reminder generation when compliance drops below 75%
- Real-time updates across all pages
- Secure row-level security policies

## Getting Started

1. Ensure your `.env` file has Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Security

- Row Level Security (RLS) enabled on all tables
- Faculty can only access their own data
- Secure authentication with Supabase
- Encrypted data storage
- No exposed credentials in frontend code
