import React, { useState, useEffect } from 'react';
import { supabase, CSVUpload } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Upload as UploadIcon, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export const Upload: React.FC = () => {
  const { user } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [semester, setSemester] = useState('Fall 2025');
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploads, setUploads] = useState<CSVUpload[]>([]);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('csv_uploads')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const parseCSV = (text: string): number => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or invalid');
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

    if (!headers.includes('percentage') && !headers.includes('percent') && !headers.includes('value')) {
      throw new Error('CSV must contain a "percentage", "percent", or "value" column');
    }

    const percentIndex = headers.findIndex(h =>
      h === 'percentage' || h === 'percent' || h === 'value'
    );

    let total = 0;
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length > percentIndex) {
        const value = parseFloat(values[percentIndex]);
        if (!isNaN(value)) {
          total += value;
          count++;
        }
      }
    }

    if (count === 0) {
      throw new Error('No valid percentage values found in CSV');
    }

    return total / count;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseName.trim() || !courseCode.trim()) {
      setMessage({ type: 'error', text: 'Course name and code are required' });
      return;
    }

    if (!attendanceFile && !syllabusFile) {
      setMessage({ type: 'error', text: 'Please upload at least one CSV file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      let attendancePercentage = 0;
      let syllabusPercentage = 0;

      if (attendanceFile) {
        const text = await attendanceFile.text();
        attendancePercentage = parseCSV(text);
      }

      if (syllabusFile) {
        const text = await syllabusFile.text();
        syllabusPercentage = parseCSV(text);
      }

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          faculty_id: user!.id,
          course_name: courseName.trim(),
          course_code: courseCode.trim(),
          semester: semester,
          attendance_percentage: attendancePercentage,
          syllabus_percentage: syllabusPercentage,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      if (attendanceFile) {
        await supabase.from('csv_uploads').insert({
          faculty_id: user!.id,
          course_id: courseData.id,
          file_name: attendanceFile.name,
          file_type: 'attendance',
          status: 'success',
        });
      }

      if (syllabusFile) {
        await supabase.from('csv_uploads').insert({
          faculty_id: user!.id,
          course_id: courseData.id,
          file_name: syllabusFile.name,
          file_type: 'syllabus',
          status: 'success',
        });
      }

      setMessage({ type: 'success', text: 'Course created and CSV files processed successfully!' });
      setCourseName('');
      setCourseCode('');
      setAttendanceFile(null);
      setSyllabusFile(null);
      await fetchUploads();
    } catch (error: any) {
      console.error('Error processing upload:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to process upload' });

      if (attendanceFile) {
        await supabase.from('csv_uploads').insert({
          faculty_id: user!.id,
          file_name: attendanceFile.name,
          file_type: 'attendance',
          status: 'failed',
          error_message: error.message,
        });
      }

      if (syllabusFile) {
        await supabase.from('csv_uploads').insert({
          faculty_id: user!.id,
          file_name: syllabusFile.name,
          file_type: 'syllabus',
          status: 'failed',
          error_message: error.message,
        });
      }

      await fetchUploads();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Upload CSV Data</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Data Structures"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="CS-301"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            >
              <option>Fall 2025</option>
              <option>Spring 2025</option>
              <option>Summer 2025</option>
              <option>Fall 2024</option>
              <option>Spring 2024</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadBox
              label="Attendance CSV"
              file={attendanceFile}
              onChange={setAttendanceFile}
              accept=".csv"
            />
            <FileUploadBox
              label="Syllabus CSV"
              file={syllabusFile}
              onChange={setSyllabusFile}
              accept=".csv"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>CSV Format:</strong> Your CSV file should contain a column named "percentage", "percent", or "value" with numeric data. The average will be calculated automatically.
            </p>
          </div>

          {message && (
            <div className={`rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {uploading ? 'Processing...' : 'Upload and Create Course'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Upload History</h2>
        <div className="space-y-3">
          {uploads.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No uploads yet</p>
          ) : (
            uploads.map((upload) => (
              <UploadHistoryItem key={upload.id} upload={upload} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface FileUploadBoxProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ label, file, onChange, accept }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
          id={label}
        />
        <label
          htmlFor={label}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          {file ? (
            <>
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm text-gray-700 font-medium">{file.name}</span>
              <span className="text-xs text-gray-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </>
          ) : (
            <>
              <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload</span>
              <span className="text-xs text-gray-500 mt-1">CSV files only</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

const UploadHistoryItem: React.FC<{ upload: CSVUpload }> = ({ upload }) => {
  const statusIcons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    failed: <XCircle className="w-5 h-5 text-red-600" />,
    processing: <Clock className="w-5 h-5 text-yellow-600" />,
  };

  const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    processing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all">
      <div className="flex items-center gap-3 flex-1">
        {statusIcons[upload.status]}
        <div>
          <p className="font-medium text-gray-900">{upload.file_name}</p>
          <p className="text-sm text-gray-600">
            {upload.file_type} - {new Date(upload.uploaded_at).toLocaleDateString()} at{' '}
            {new Date(upload.uploaded_at).toLocaleTimeString()}
          </p>
          {upload.error_message && (
            <p className="text-xs text-red-600 mt-1">{upload.error_message}</p>
          )}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[upload.status]}`}>
        {upload.status}
      </span>
    </div>
  );
};
