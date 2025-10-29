import React, { useEffect, useState } from 'react';
import { supabase, Course } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, TrendingUp, Users, BookOpen } from 'lucide-react';

export const Courses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const openModal = (course: Course) => {
    setSelectedCourse(course);
    setNewAttendance(course.attendance_percentage.toString());
    setReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setNewAttendance('');
    setReason('');
  };

  const handleUpdateAttendance = async () => {
    if (!selectedCourse || !user) return;

    const newPercentage = parseFloat(newAttendance);
    if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
      alert('Please enter a valid percentage between 0 and 100');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for the update');
      return;
    }

    setUpdating(true);

    try {
      const { error: recordError } = await supabase
        .from('attendance_records')
        .insert({
          course_id: selectedCourse.id,
          previous_percentage: selectedCourse.attendance_percentage,
          new_percentage: newPercentage,
          reason: reason.trim(),
          modified_by: user.id,
        });

      if (recordError) throw recordError;

      const { error: updateError } = await supabase
        .from('courses')
        .update({ attendance_percentage: newPercentage })
        .eq('id', selectedCourse.id);

      if (updateError) throw updateError;

      await fetchCourses();
      closeModal();
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Courses & Progress</h1>
        <div className="text-sm text-gray-600">
          Total Courses: <span className="font-bold text-blue-600">{courses.length}</span>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Courses Yet</h2>
          <p className="text-gray-600">Upload CSV data to add your courses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onModify={openModal} />
          ))}
        </div>
      )}

      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Modify Attendance</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-1">{selectedCourse.course_name}</h3>
              <p className="text-sm text-gray-600">{selectedCourse.course_code}</p>
              <p className="text-sm text-gray-700 mt-2">
                Current Attendance: <span className="font-bold text-blue-600">{selectedCourse.attendance_percentage}%</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Attendance Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newAttendance}
                  onChange={(e) => setNewAttendance(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="85.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Update
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                  rows={3}
                  placeholder="e.g., Updated with latest class records..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAttendance}
                disabled={updating}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

interface CourseCardProps {
  course: Course;
  onModify: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onModify }) => {
  const statusColors = {
    compliant: 'from-green-500 to-green-600',
    pending: 'from-yellow-500 to-yellow-600',
    'at-risk': 'from-red-500 to-red-600',
  };

  const statusBadgeColors = {
    compliant: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'at-risk': 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${statusColors[course.status]}`}></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{course.course_name}</h3>
            <p className="text-sm text-gray-600">{course.course_code}</p>
            <p className="text-xs text-gray-500 mt-1">{course.semester}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeColors[course.status]}`}>
            {course.status === 'at-risk' ? 'At Risk' : course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <MetricRow
            icon={Users}
            label="Attendance"
            value={Number(course.attendance_percentage).toFixed(1)}
            color="text-blue-600"
          />
          <MetricRow
            icon={BookOpen}
            label="Syllabus"
            value={Number(course.syllabus_percentage).toFixed(1)}
            color="text-purple-600"
          />
          <MetricRow
            icon={TrendingUp}
            label="Compliance"
            value={Number(course.compliance_percentage).toFixed(1)}
            color="text-green-600"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-bold text-gray-900">{Number(course.compliance_percentage).toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${statusColors[course.status]} transition-all duration-500`}
              style={{ width: `${course.compliance_percentage}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => onModify(course)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
        >
          Modify Attendance
        </button>
      </div>
    </div>
  );
};

interface MetricRowProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className={`font-bold ${color}`}>{value}%</span>
  </div>
);
