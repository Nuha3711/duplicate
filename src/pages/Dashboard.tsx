import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course } from '../lib/supabase';
import { TrendingUp, Users, BookOpen, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
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

  const compliantCount = courses.filter(c => c.status === 'compliant').length;
  const pendingCount = courses.filter(c => c.status === 'pending').length;
  const atRiskCount = courses.filter(c => c.status === 'at-risk').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Professor'}
        </h1>
        <p className="text-blue-100 text-lg">
          You're <span className="font-bold text-white">{avgCompliance.toFixed(0)}%</span> compliant this semester
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Attendance"
          value={`${avgAttendance.toFixed(1)}%`}
          icon={Users}
          color="from-blue-500 to-blue-600"
          trend={avgAttendance >= 75 ? 'up' : 'down'}
        />
        <MetricCard
          title="Syllabus Coverage"
          value={`${avgSyllabus.toFixed(1)}%`}
          icon={BookOpen}
          color="from-blue-600 to-blue-700"
          trend={avgSyllabus >= 75 ? 'up' : 'down'}
        />
        <MetricCard
          title="Overall Compliance"
          value={`${avgCompliance.toFixed(1)}%`}
          icon={TrendingUp}
          color="from-blue-700 to-blue-800"
          trend={avgCompliance >= 75 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance Overview</h2>
          <div className="flex items-center justify-center">
            <DonutChart
              compliant={compliantCount}
              pending={pendingCount}
              atRisk={atRiskCount}
              total={courses.length}
            />
          </div>
          <div className="mt-6 space-y-3">
            <LegendItem color="bg-green-500" label="Compliant" value={compliantCount} />
            <LegendItem color="bg-yellow-500" label="Pending" value={pendingCount} />
            <LegendItem color="bg-red-500" label="At Risk" value={atRiskCount} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Courses</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No courses yet. Upload CSV data to get started!</p>
              </div>
            ) : (
              courses.slice(0, 6).map((course) => (
                <CourseItem key={course.id} course={course} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  trend: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
    <div className="flex items-center justify-between mb-4">
      <div className={`bg-gradient-to-br ${color} p-3 rounded-xl shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? '↑' : '↓'}
      </div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

interface DonutChartProps {
  compliant: number;
  pending: number;
  atRisk: number;
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ compliant, pending, atRisk, total }) => {
  if (total === 0) {
    return (
      <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No data</span>
      </div>
    );
  }

  const compliantPercent = (compliant / total) * 100;
  const pendingPercent = (pending / total) * 100;
  const atRiskPercent = (atRisk / total) * 100;

  const createConicGradient = () => {
    let gradient = 'conic-gradient(';
    let currentPercent = 0;

    if (compliant > 0) {
      gradient += `#22c55e ${currentPercent}% ${currentPercent + compliantPercent}%`;
      currentPercent += compliantPercent;
    }
    if (pending > 0) {
      gradient += `, #eab308 ${currentPercent}% ${currentPercent + pendingPercent}%`;
      currentPercent += pendingPercent;
    }
    if (atRisk > 0) {
      gradient += `, #ef4444 ${currentPercent}% ${currentPercent + atRiskPercent}%`;
    }

    gradient += ')';
    return gradient;
  };

  return (
    <div className="relative w-48 h-48">
      <div
        className="w-full h-full rounded-full"
        style={{ background: createConicGradient() }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-inner">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-600">Courses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string; value: number }> = ({ color, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded ${color}`}></div>
      <span className="text-gray-700 font-medium">{label}</span>
    </div>
    <span className="text-gray-900 font-bold">{value}</span>
  </div>
);

const CourseItem: React.FC<{ course: Course }> = ({ course }) => {
  const statusColors = {
    compliant: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'at-risk': 'bg-red-100 text-red-800 border-red-300',
  };

  const statusDots = {
    compliant: 'bg-green-500',
    pending: 'bg-yellow-500',
    'at-risk': 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-3 h-3 rounded-full ${statusDots[course.status]} animate-pulse`}></div>
        <div>
          <h3 className="font-semibold text-gray-900">{course.course_name}</h3>
          <p className="text-sm text-gray-600">{course.course_code}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[course.status]}`}>
        {course.status === 'at-risk' ? 'At Risk' : course.status.charAt(0).toUpperCase() + course.status.slice(1)}
      </span>
    </div>
  );
};
