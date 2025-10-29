import React, { useEffect, useState } from 'react';
import { supabase, Reminder } from '../lib/supabase';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Filter } from 'lucide-react';

type FilterType = 'all' | 'unread' | 'read';

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('Error marking reminder as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'unread') return !reminder.is_read;
    if (filter === 'read') return reminder.is_read;
    return true;
  });

  const unreadCount = reminders.filter((r) => !r.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reminders & Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-1">
              You have <span className="font-bold text-blue-600">{unreadCount}</span> unread reminder{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Reminders</h2>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : 'Reminders will appear here when compliance drops below 75%'}
              </p>
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-3">About Automated Reminders</h2>
        <div className="space-y-2 text-blue-100">
          <p>Reminders are automatically generated based on compliance levels:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-white">Gentle</strong> - Compliance between 65% and 75%</li>
            <li><strong className="text-white">Formal</strong> - Compliance between 50% and 65%</li>
            <li><strong className="text-white">Escalation</strong> - Compliance below 50%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface ReminderItemProps {
  reminder: Reminder;
  onMarkAsRead: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onMarkAsRead }) => {
  const toneConfig = {
    gentle: {
      icon: Bell,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      label: 'Gentle Reminder',
      labelColor: 'bg-blue-100 text-blue-800',
    },
    formal: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      label: 'Formal Notice',
      labelColor: 'bg-yellow-100 text-yellow-800',
    },
    escalation: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      label: 'Urgent Action Required',
      labelColor: 'bg-red-100 text-red-800',
    },
  };

  const config = toneConfig[reminder.tone];
  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        reminder.is_read
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : `${config.bgColor} ${config.borderColor} hover:shadow-md`
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`${config.iconBg} p-3 rounded-lg flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.labelColor}`}>
              {config.label}
            </span>
            {!reminder.is_read && (
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            )}
          </div>

          <p className="text-gray-900 font-medium mb-2">{reminder.message}</p>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {new Date(reminder.created_at).toLocaleDateString()} at{' '}
              {new Date(reminder.created_at).toLocaleTimeString()}
            </p>

            {!reminder.is_read && (
              <button
                onClick={() => onMarkAsRead(reminder.id)}
                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
