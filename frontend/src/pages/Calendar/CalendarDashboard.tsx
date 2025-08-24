import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import { 
  CalendarEvent, 
  CalendarView, 
  CalendarFilter,
  ProjectSchedule,
  CalendarWidget
} from '@/types/calendar';
import { cn, formatDate } from '@/lib/utils';

// Local utility function for formatting time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Mock data for demonstration
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Project Kickoff Meeting',
    description: 'Initial project planning and team alignment',
    startDate: new Date('2024-02-01T09:00:00'),
    endDate: new Date('2024-02-01T10:30:00'),
    allDay: false,
    type: 'meeting',
    priority: 'high',
    status: 'scheduled',
    location: 'Conference Room A',
    attendees: [
      {
        id: '1',
        userId: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'organizer',
        response: 'accepted'
      },
      {
        id: '2',
        userId: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'attendee',
        response: 'pending'
      }
    ],
    projectId: '1',
    tags: ['planning', 'kickoff'],
    color: '#3b82f6',
    reminders: [],
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1'
  },
  {
    id: '2',
    title: 'Design Review Deadline',
    description: 'Final design review and approval',
    startDate: new Date('2024-02-05T17:00:00'),
    endDate: new Date('2024-02-05T17:00:00'),
    allDay: true,
    type: 'deadline',
    priority: 'critical',
    status: 'scheduled',
    attendees: [],
    projectId: '1',
    tags: ['design', 'deadline'],
    color: '#ef4444',
    reminders: [],
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1'
  },
  {
    id: '3',
    title: 'Development Phase Start',
    description: 'Begin development implementation',
    startDate: new Date('2024-02-16T08:00:00'),
    endDate: new Date('2024-02-16T08:00:00'),
    allDay: true,
    type: 'milestone',
    priority: 'high',
    status: 'scheduled',
    attendees: [],
    projectId: '1',
    tags: ['development', 'milestone'],
    color: '#10b981',
    reminders: [],
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1'
  }
];

const mockSchedules: ProjectSchedule[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'Main Project',
    phases: [],
    milestones: [],
    dependencies: [],
    constraints: [],
    estimatedDuration: 90,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-05-01'),
    criticalPath: [],
    slackTime: 15,
    resourceAllocations: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const CalendarDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<CalendarView['type']>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [schedules, setSchedules] = useState<ProjectSchedule[]>(mockSchedules);
  const [filters, setFilters] = useState<CalendarFilter>({});
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const viewOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
    { value: 'timeline', label: 'Timeline' }
  ];

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'deadline': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'milestone': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'task': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'external': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'scheduled': return 'default';
      case 'cancelled': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'default';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: currentView === 'month' ? 'long' : 'short',
      day: currentView === 'day' ? 'numeric' : undefined,
      weekday: currentView === 'day' ? 'long' : undefined
    };
    
    if (currentView === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    }
    
    if (currentView === 'quarter') {
      const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
      return `Q${quarter} ${currentDate.getFullYear()}`;
    }
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    const upcoming = events
      .filter(event => event.startDate > now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5);
    return upcoming;
  };

  const getTodayEvents = () => {
    const today = new Date();
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === today.toDateString();
    });
    return todayEvents;
  };

  const getOverdueItems = () => {
    const now = new Date();
    const overdue = events.filter(event => 
      event.status === 'scheduled' && event.endDate < now
    );
    return overdue;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Calendar & Scheduling
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage project schedules, deadlines, and team coordination
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="lg">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Import Calendar
          </Button>
          <Button size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Today
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getViewTitle()}
            </h2>

            <div className="flex items-center space-x-2">
              <Select
                options={viewOptions}
                value={{ value: currentView, label: viewOptions.find(v => v.value === currentView)?.label || '' }}
                onChange={(option) => option && setCurrentView(option.value as CalendarView['type'])}
                placeholder="Select view"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Calendar Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Widgets Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5" />
                <span>Today's Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getTodayEvents().length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No events scheduled for today
                </p>
              ) : (
                <div className="space-y-3">
                  {getTodayEvents().map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          {!event.allDay && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTime(event.startDate)} - {formatTime(event.endDate)}
                            </p>
                          )}
                        </div>
                        <Badge variant={getPriorityColor(event.priority)} size="sm">
                          {event.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5" />
                <span>Upcoming Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingEvents().map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(event.startDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={getPriorityColor(event.priority)} size="sm">
                          {event.priority}
                        </Badge>
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          getEventTypeColor(event.type)
                        )}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overdue Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <span>Overdue Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getOverdueItems().length === 0 ? (
                <p className="text-green-600 dark:text-green-400 text-sm">
                  All items are on schedule!
                </p>
              ) : (
                <div className="space-y-3">
                  {getOverdueItems().map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                            {event.title}
                          </h4>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Due: {formatDate(event.endDate)}
                          </p>
                        </div>
                        <Badge variant="destructive" size="sm">
                          Overdue
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Events</span>
                  <span className="text-lg font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                  <span className="text-lg font-semibold">
                    {events.filter(e => {
                      const weekStart = new Date();
                      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return e.startDate >= weekStart && e.startDate <= weekEnd;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                  <span className="text-lg font-semibold text-red-600">
                    {getOverdueItems().length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[600px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Calendar implementation for {currentView} view
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Showing: {getViewTitle()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <ViewColumnsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Project Timeline
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Gantt chart and timeline visualization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarDashboard;
