import React, { useState } from 'react';
import { 
  ClockIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';

interface ReportSchedulerProps {
  onSchedule: (schedule: any) => Promise<void>;
  dateRange: string;
  selectedMetrics: string[];
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: string;
  dayOfMonth?: number;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  status: 'active' | 'paused' | 'failed';
  nextRun: string;
  lastRun?: string;
}

const ReportScheduler: React.FC<ReportSchedulerProps> = ({
  onSchedule,
  dateRange,
  selectedMetrics
}) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    frequency: 'weekly' as const,
    time: '09:00',
    dayOfWeek: 'monday',
    dayOfMonth: 1,
    recipients: '',
    format: 'pdf' as const
  });

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly Revenue Report',
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 'monday',
      recipients: ['admin@company.com', 'manager@company.com'],
      format: 'pdf',
      status: 'active',
      nextRun: '2024-01-22 09:00',
      lastRun: '2024-01-15 09:00'
    },
    {
      id: '2',
      name: 'Monthly Analytics Summary',
      frequency: 'monthly',
      time: '08:00',
      dayOfMonth: 1,
      recipients: ['analytics@company.com'],
      format: 'excel',
      status: 'active',
      nextRun: '2024-02-01 08:00',
      lastRun: '2024-01-01 08:00'
    }
  ]);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', description: 'Every day at specified time' },
    { value: 'weekly', label: 'Weekly', description: 'Every week on specified day' },
    { value: 'monthly', label: 'Monthly', description: 'Every month on specified date' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF', description: 'Professional formatted report' },
    { value: 'excel', label: 'Excel', description: 'Spreadsheet format' },
    { value: 'csv', label: 'CSV', description: 'Raw data format' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setScheduleForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    
    try {
      const schedule = {
        ...scheduleForm,
        recipients: scheduleForm.recipients.split(',').map(email => email.trim()),
        dateRange,
        selectedMetrics
      };
      
      await onSchedule(schedule);
      
      // Add new scheduled report
      const newReport: ScheduledReport = {
        id: Date.now().toString(),
        name: scheduleForm.name,
        frequency: scheduleForm.frequency,
        time: scheduleForm.time,
        dayOfWeek: scheduleForm.frequency === 'weekly' ? scheduleForm.dayOfWeek : undefined,
        dayOfMonth: scheduleForm.frequency === 'monthly' ? scheduleForm.dayOfMonth : undefined,
        recipients: schedule.recipients,
        format: scheduleForm.format,
        status: 'active',
        nextRun: calculateNextRun(scheduleForm.frequency, scheduleForm.time, scheduleForm.dayOfWeek, scheduleForm.dayOfMonth)
      };
      
      setScheduledReports(prev => [newReport, ...prev]);
      setShowForm(false);
      setScheduleForm({
        name: '',
        frequency: 'weekly',
        time: '09:00',
        dayOfWeek: 'monday',
        dayOfMonth: 1,
        recipients: '',
        format: 'pdf'
      });
    } catch (error) {
      console.error('Scheduling failed:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const calculateNextRun = (frequency: string, time: string, dayOfWeek?: string, dayOfMonth?: number): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    switch (frequency) {
      case 'weekly':
        if (dayOfWeek) {
          const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const targetDay = daysOfWeek.indexOf(dayOfWeek);
          const currentDay = nextRun.getDay();
          const daysToAdd = (targetDay - currentDay + 7) % 7;
          nextRun.setDate(nextRun.getDate() + daysToAdd);
        }
        break;
      case 'monthly':
        if (dayOfMonth) {
          nextRun.setDate(dayOfMonth);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
            nextRun.setDate(dayOfMonth);
          }
        }
        break;
    }
    
    return nextRun.toLocaleString();
  };

  const toggleReportStatus = (reportId: string) => {
    setScheduledReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: report.status === 'active' ? 'paused' : 'active' }
        : report
    ));
  };

  const deleteReport = (reportId: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== reportId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
          Schedule Reports
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Automate report generation and delivery to your team
        </p>
      </div>

      {/* Schedule New Report Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <CalendarIcon className="h-5 w-5 inline mr-2" />
          Schedule New Report
        </button>
      )}

      {/* Schedule Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Name
            </label>
            <input
              type="text"
              value={scheduleForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Weekly Revenue Report"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={scheduleForm.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {frequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={scheduleForm.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {scheduleForm.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day of Week
              </label>
              <select
                value={scheduleForm.dayOfWeek}
                onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          )}

          {scheduleForm.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Day of Month
              </label>
              <select
                value={scheduleForm.dayOfMonth}
                onChange={(e) => handleInputChange('dayOfMonth', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipients (comma-separated emails)
            </label>
            <input
              type="text"
              value={scheduleForm.recipients}
              onChange={(e) => handleInputChange('recipients', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email1@company.com, email2@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <select
              value={scheduleForm.format}
              onChange={(e) => handleInputChange('format', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {formatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isScheduling}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Report'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Scheduled Reports List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Scheduled Reports
        </h4>
        <div className="space-y-3">
          {scheduledReports.map((report) => (
            <div
              key={report.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(report.status)}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {report.name}
                  </span>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>• Frequency: {report.frequency} at {report.time}</div>
                {report.dayOfWeek && <div>• Day: {report.dayOfWeek}</div>}
                {report.dayOfMonth && <div>• Date: {report.dayOfMonth}</div>}
                <div>• Format: {report.format.toUpperCase()}</div>
                <div>• Recipients: {report.recipients.join(', ')}</div>
                <div>• Next run: {report.nextRun}</div>
                {report.lastRun && <div>• Last run: {report.lastRun}</div>}
              </div>
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => toggleReportStatus(report.id)}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {report.status === 'active' ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteReport(report.id)}
                  className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportScheduler;
