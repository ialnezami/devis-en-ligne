import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Projects',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Phases',
      value: '8',
      change: '+1',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Team Members',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Completed Tasks',
      value: '156',
      change: '+12',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'phase_completed',
      title: 'Requirements Analysis Phase Completed',
      description: 'The requirements analysis phase has been successfully completed',
      time: '2 hours ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'milestone_reached',
      title: 'Design Milestone Reached',
      description: 'UI/UX design milestone has been achieved',
      time: '4 hours ago',
      status: 'info',
    },
    {
      id: 3,
      type: 'resource_allocated',
      title: 'New Team Member Added',
      description: 'Jane Smith has been allocated to the development phase',
      time: '1 day ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'budget_alert',
      title: 'Budget Alert',
      description: 'Design phase is approaching budget limit',
      time: '2 days ago',
      status: 'warning',
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Design Phase Completion',
      phase: 'Design & Architecture',
      dueDate: '2024-02-15',
      priority: 'high',
      daysLeft: 15,
    },
    {
      id: 2,
      title: 'Development Phase Start',
      phase: 'Development',
      dueDate: '2024-02-16',
      priority: 'critical',
      daysLeft: 16,
    },
    {
      id: 3,
      title: 'Client Review Meeting',
      phase: 'Design & Architecture',
      dueDate: '2024-02-10',
      priority: 'medium',
      daysLeft: 10,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 7) return 'text-red-600';
    if (daysLeft <= 14) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="lg">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Reports
          </Button>
          <Link to="/phases">
            <Button size="lg">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Manage Phases
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  'text-sm font-medium',
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2',
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    )} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {activity.time}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {deadline.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {deadline.phase}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={getPriorityColor(deadline.priority)}>
                            {deadline.priority}
                          </Badge>
                          <span className={cn('text-xs font-medium', getDaysLeftColor(deadline.daysLeft))}>
                            {deadline.daysLeft} days left
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {deadline.dueDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link to="/phases">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Phases
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/phases">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <CalendarIcon className="h-8 w-8" />
                <span>Phase Management</span>
              </Button>
            </Link>
            
            <Link to="/calendar">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <ClockIcon className="h-8 w-8" />
                <span>Calendar & Scheduling</span>
              </Button>
            </Link>
            
            <Link to="/quotations">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <DocumentTextIcon className="h-8 w-8" />
                <span>Quotations</span>
              </Button>
            </Link>
            
            <Link to="/estimates">
              <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                <PaintBrushIcon className="h-8 w-8" />
                <span>Customizable Estimates</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
