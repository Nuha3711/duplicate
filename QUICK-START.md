# Quick Start Guide - Compliance Companion

Get started with Compliance Companion in just a few minutes!

## Step 1: First Time Setup

Your Supabase database is already configured and ready to use. The application is live and running.

## Step 2: Create Your Account

1. Open the application
2. Click "Don't have an account? Sign up"
3. Enter your information:
   - Full Name (e.g., Dr. John Smith)
   - Email Address
   - Password (minimum 6 characters)
4. Click "Create Account"

## Step 3: Complete Your Profile

1. Navigate to the Profile page (bottom of sidebar)
2. Click "Edit Profile"
3. Update your information:
   - College/University name
   - Years of experience
   - Research publications (optional)
4. Click "Save Changes"

## Step 4: Upload Your First Course

1. Go to the "Upload CSV" page
2. Fill in course details:
   - Course Name (e.g., Data Structures)
   - Course Code (e.g., CS-301)
   - Semester
3. Upload CSV files:
   - Attendance CSV (contains student attendance percentages)
   - Syllabus CSV (contains topic coverage percentages)
4. Click "Upload and Create Course"

**Tip:** Use the sample CSV files included in the project to test the upload feature!

## Step 5: Explore the Dashboard

After uploading courses, your dashboard will show:
- Overall compliance percentage
- Average attendance and syllabus coverage
- Visual donut chart of course status
- Recent courses list

## Step 6: Manage Your Courses

1. Go to the "Courses" page
2. View all your courses with detailed metrics
3. Click "Modify Attendance" on any course to update records
4. Enter new percentage and reason for the change

## Step 7: Monitor Reminders

1. Navigate to "Reminders" page
2. View automated compliance alerts
3. Filter by All, Unread, or Read
4. Mark reminders as read when addressed

Reminders are automatically generated when:
- Compliance drops below 75% (Gentle reminder)
- Compliance drops below 65% (Formal notice)
- Compliance drops below 50% (Escalation)

## Step 8: Generate Reports

1. Go to the "Reports" page
2. View summary statistics
3. Export data:
   - CSV format for spreadsheet analysis
   - Text format for detailed reports
4. Share reports with administrators

## Key Features to Try

### Dashboard
- Real-time compliance metrics
- Visual status indicators
- Quick course overview

### Course Management
- Detailed progress tracking
- Attendance modification with reason tracking
- Automatic compliance calculation

### CSV Upload
- Easy batch data import
- Real-time validation
- Upload history tracking

### Reminders
- Automated alert generation
- Three tone levels based on severity
- Easy management with filters

### Reports
- Comprehensive data export
- Multiple format options
- Professional report generation

### Profile
- Personal information management
- Publication tracking
- Secure logout

## Tips for Success

1. **Regular Updates**: Upload attendance and syllabus data weekly
2. **Monitor Compliance**: Check dashboard daily for status changes
3. **Address Reminders**: Act on alerts promptly
4. **Keep Records**: Use the modify attendance feature to document changes
5. **Export Reports**: Generate monthly reports for administration

## CSV File Format

Your CSV files need a column named one of:
- `percentage`
- `percent`
- `value`

Example:
```csv
student_id,percentage
001,85.5
002,92.0
003,78.5
```

See `CSV-FORMAT-GUIDE.md` for detailed format information.

## Compliance Calculation

- **Attendance %** - Average from attendance CSV
- **Syllabus %** - Average from syllabus CSV
- **Compliance %** - Average of attendance and syllabus

Status Assignment:
- **Compliant** - 75% or higher
- **Pending** - 50% to 74%
- **At-Risk** - Below 50%

## Navigation

Use the sidebar to access:
1. Dashboard - Overview and metrics
2. Courses - Detailed course management
3. Upload CSV - Add new courses
4. Reminders - Compliance alerts
5. Reports - Data export
6. Profile - Account settings

## Need Help?

- Check `README.md` for detailed documentation
- Review `CSV-FORMAT-GUIDE.md` for upload help
- Use sample CSV files for testing
- All data is automatically saved and synced

## Security

- Your data is encrypted and secure
- Only you can access your courses and data
- Logout using the button in Profile page
- Sessions are persistent across browser restarts

---

**Welcome to Compliance Companion!**
Track your academic compliance with ease and confidence.
