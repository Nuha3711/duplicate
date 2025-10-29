import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Building2, Calendar, BookOpen, Edit2, LogOut, X, Plus } from 'lucide-react';

interface Publication {
  title: string;
  year: number;
  journal?: string;
}

export const Profile: React.FC = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setCollegeName(profile.college_name);
      setYearsExperience(profile.years_experience);
      setPublications(profile.research_publications || []);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        college_name: collegeName,
        years_experience: yearsExperience,
        research_publications: publications,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

  const addPublication = () => {
    setPublications([...publications, { title: '', year: new Date().getFullYear(), journal: '' }]);
  };

  const updatePublication = (index: number, field: keyof Publication, value: string | number) => {
    const updated = [...publications];
    updated[index] = { ...updated[index], [field]: value };
    setPublications(updated);
  };

  const removePublication = (index: number) => {
    setPublications(publications.filter((_, i) => i !== index));
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Profile</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-700"></div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-bold">
              {profile.full_name.charAt(0)}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College/University
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Research Publications
                  </label>
                  <button
                    onClick={addPublication}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Publication
                  </button>
                </div>

                <div className="space-y-3">
                  {publications.map((pub, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Publication {index + 1}</span>
                        <button
                          onClick={() => removePublication(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Publication Title"
                        value={pub.title}
                        onChange={(e) => updatePublication(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Year"
                          value={pub.year}
                          onChange={(e) => updatePublication(index, 'year', parseInt(e.target.value) || 2024)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Journal (optional)"
                          value={pub.journal || ''}
                          onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  {publications.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No publications added yet</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h2>
                <div className="space-y-2">
                  <InfoRow icon={Mail} label="Email" value={profile.email} />
                  <InfoRow icon={Building2} label="College" value={profile.college_name} />
                  <InfoRow icon={Calendar} label="Experience" value={`${profile.years_experience} years`} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Research Publications</h3>
                </div>

                {publications.length === 0 ? (
                  <p className="text-gray-600 italic">No publications added yet</p>
                ) : (
                  <div className="space-y-3">
                    {publications.map((pub, index) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-1">{pub.title}</h4>
                        <p className="text-sm text-gray-700">
                          {pub.year}
                          {pub.journal && ` - ${pub.journal}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-2">Account Information</h3>
        <p className="text-blue-100">
          Your account is active and secure. All your data is encrypted and stored safely.
        </p>
      </div>
    </div>
  );
};

interface InfoRowProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-5 h-5 text-blue-600" />
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);
