import React, { useEffect, useState } from 'react';
import { supabase, Course } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, TrendingUp, Users, BookOpen } from 'lucide-react';

export const Reports: React.FC = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgAttendance = courses.length > 0
    ? courses.reduce((sum, c) => sum + Number(c.attendance_percentage), 0) / courses.length
    : 0;

  const avgSyllabus = courses.length > 0
    ? courses.reduce((sum, c) => sum + Number(c.syllabus_percentage), 0) / courses.length
    : 0;

  const avgCompliance = courses.length > 0
    ? courses.reduce((sum, c) => sum + Number(c.compliance_percentage), 0) / courses.length
    : 0;

  const exportToCSV = () => {
    const headers = ['Course Name', 'Course Code', 'Semester', 'Attendance %', 'Syllabus %', 'Compliance %', 'Status'];
    const rows = courses.map(c => [
      c.course_name,
      c.course_code,
      c.semester,
      c.attendance_percentage,
      c.syllabus_percentage,
      c.compliance_percentage,
      c.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    const report = `
COMPLIANCE COMPANION - ACADEMIC COMPLIANCE REPORT
Generated: ${new Date().toLocaleString()}
Faculty: ${profile?.full_name || 'N/A'}
College: ${profile?.college_name || 'N/A'}

========================================
SUMMARY STATISTICS
========================================
Total Courses: ${courses.length}
Average Attendance: ${avgAttendance.toFixed(2)}%
Average Syllabus Coverage: ${avgSyllabus.toFixed(2)}%
Overall Compliance: ${avgCompliance.toFixed(2)}%

========================================
COURSE DETAILS
========================================

${courses.map((course, index) => `
${index + 1}. ${course.course_name} (${course.course_code})
   Semester: ${course.semester}
   Attendance: ${Number(course.attendance_percentage).toFixed(2)}%
   Syllabus Coverage: ${Number(course.syllabus_percentage).toFixed(2)}%
   Overall Compliance: ${Number(course.compliance_percentage).toFixed(2)}%
   Status: ${course.status.toUpperCase()}
   Last Updated: ${new Date(course.updated_at).toLocaleString()}
`).join('\n')}

========================================
COMPLIANCE STATUS BREAKDOWN
========================================
Compliant Courses: ${courses.filter(c => c.status === 'compliant').length}
Pending Courses: ${courses.filter(c => c.status === 'pending').length}
At-Risk Courses: ${courses.filter(c => c.status === 'at-risk').length}

========================================
RECOMMENDATIONS
========================================
${avgCompliance < 75 ? '- Consider reviewing and updating course records for low-compliance courses\n- Upload recent attendance and syllabus data\n- Address at-risk courses immediately' : '- Maintain current compliance levels\n- Continue regular updates to course records\n- Monitor any courses approaching compliance thresholds'}

Report End
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          icon={Users}
          title="Average Attendance"
          value={`${avgAttendance.toFixed(1)}%`}
          color="from-blue-500 to-blue-600"
        />
        <SummaryCard
          icon={BookOpen}
          title="Average Syllabus"
          value={`${avgSyllabus.toFixed(1)}%`}
          color="from-blue-600 to-blue-700"
        />
        <SummaryCard
          icon={TrendingUp}
          title="Overall Compliance"
          value={`${avgCompliance.toFixed(1)}%`}
          color="from-blue-700 to-blue-800"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Export Options</h2>
          <FileText className="w-8 h-8 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Download className="w-5 h-5" />
            Export as CSV (Summary)
          </button>

          <button
            onClick={exportToText}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Download className="w-5 h-5" />
            Export as Text (Detailed)
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Reports include all course data, compliance metrics, and status information
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">Upload course data to generate reports</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold rounded-tl-lg">Course</th>
                  <th className="px-6 py-4 text-left font-semibold">Code</th>
                  <th className="px-6 py-4 text-left font-semibold">Semester</th>
                  <th className="px-6 py-4 text-center font-semibold">Attendance</th>
                  <th className="px-6 py-4 text-center font-semibold">Syllabus</th>
                  <th className="px-6 py-4 text-center font-semibold">Compliance</th>
                  <th className="px-6 py-4 text-center font-semibold rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr
                    key={course.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{course.course_name}</td>
                    <td className="px-6 py-4 text-gray-700">{course.course_code}</td>
                    <td className="px-6 py-4 text-gray-700">{course.semester}</td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-600">
                      {Number(course.attendance_percentage).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-purple-600">
                      {Number(course.syllabus_percentage).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-green-600">
                      {Number(course.compliance_percentage).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={course.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  value: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
    <div className={`bg-gradient-to-br ${color} p-4 rounded-xl shadow-md inline-block mb-4`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = {
    compliant: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'at-risk': 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status as keyof typeof colors]}`}>
      {status === 'at-risk' ? 'At Risk' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
