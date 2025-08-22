import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  PlusIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  ProjectPhase, 
  PhaseProgress, 
  ResourceUtilization,
  PhaseFilter,
  PhaseSort 
} from '@/types/project';
import { cn, formatDate, formatCurrency } from '@/lib/utils';

// Mock data for demonstration
const mockPhases: ProjectPhase[] = [
  {
    id: '1',
    name: 'Requirements Analysis',
    description: 'Gather and analyze project requirements',
    status: 'completed',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    progress: 100,
    priority: 'high',
    dependencies: [],
    milestones: [],
    resources: [],
    budget: { estimated: 5000, actual: 4800, currency: 'USD' },
    tags: ['analysis', 'requirements'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Design & Architecture',
    description: 'Create system design and architecture',
    status: 'active',
    startDate: new Date('2024-01-16'),
    endDate: new Date('2024-02-15'),
    progress: 65,
    priority: 'high',
    dependencies: ['1'],
    milestones: [],
    resources: [],
    budget: { estimated: 15000, actual: 9800, currency: 'USD' },
    tags: ['design', 'architecture'],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    id: '3',
    name: 'Development',
    description: 'Implement the system according to design',
    status: 'planning',
    startDate: new Date('2024-02-16'),
    endDate: new Date('2024-05-15'),
    progress: 0,
    priority: 'critical',
    dependencies: ['2'],
    milestones: [],
    resources: [],
    budget: { estimated: 50000, actual: 0, currency: 'USD' },
    tags: ['development', 'coding'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockProgress: PhaseProgress[] = [
  {
    phaseId: '1',
    phaseName: 'Requirements Analysis',
    overallProgress: 100,
    milestoneProgress: 100,
    deliverableProgress: 100,
    resourceUtilization: 95,
    budgetUtilization: 96,
    timelineStatus: 'on-track',
    lastUpdated: new Date('2024-01-15'),
  },
  {
    phaseId: '2',
    phaseName: 'Design & Architecture',
    overallProgress: 65,
    milestoneProgress: 70,
    deliverableProgress: 60,
    resourceUtilization: 80,
    budgetUtilization: 65,
    timelineStatus: 'on-track',
    lastUpdated: new Date('2024-01-30'),
  },
  {
    phaseId: '3',
    phaseName: 'Development',
    overallProgress: 0,
    milestoneProgress: 0,
    deliverableProgress: 0,
    resourceUtilization: 0,
    budgetUtilization: 0,
    timelineStatus: 'on-track',
    lastUpdated: new Date('2024-01-01'),
  },
];

const mockResources: ResourceUtilization[] = [
  {
    userId: '1',
    userName: 'John Doe',
    userAvatar: undefined,
    totalAllocation: 85,
    currentProjects: [
      {
        projectId: '1',
        projectName: 'Main Project',
        allocation: 85,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
      },
    ],
    availability: [],
    skills: ['React', 'Node.js', 'TypeScript'],
    hourlyRate: 75,
  },
  {
    userId: '2',
    userName: 'Jane Smith',
    userAvatar: undefined,
    totalAllocation: 60,
    currentProjects: [
      {
        projectId: '1',
        projectName: 'Main Project',
        allocation: 60,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
      },
    ],
    availability: [],
    skills: ['UI/UX', 'Figma', 'Prototyping'],
    hourlyRate: 65,
  },
];

const PhaseDashboard: React.FC = () => {
  const [phases, setPhases] = useState<ProjectPhase[]>(mockPhases);
  const [progress, setProgress] = useState<PhaseProgress[]>(mockProgress);
  const [resources, setResources] = useState<ResourceUtilization[]>(mockResources);
  const [filters, setFilters] = useState<PhaseFilter>({});
  const [sort, setSort] = useState<PhaseSort>({ field: 'startDate', direction: 'asc' });
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null);

  const getStatusColor = (status: ProjectPhase['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'planning': return 'warning';
      case 'on-hold': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: ProjectPhase['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTimelineStatusColor = (status: PhaseProgress['timelineStatus']) => {
    switch (status) {
      case 'on-track': return 'success';
      case 'behind': return 'error';
      case 'ahead': return 'info';
      case 'at-risk': return 'warning';
      default: return 'default';
    }
  };

  const getTimelineStatusIcon = (status: PhaseProgress['timelineStatus']) => {
    switch (status) {
      case 'on-track': return '✅';
      case 'behind': return '⏰';
      case 'ahead': return '🚀';
      case 'at-risk': return '⚠️';
      default: return '❓';
    }
  };

  const overallProgress = phases.reduce((acc, phase) => acc + phase.progress, 0) / phases.length;
  const activePhases = phases.filter(phase => phase.status === 'active').length;
  const completedPhases = phases.filter(phase => phase.status === 'completed').length;
  const totalBudget = phases.reduce((acc, phase) => acc + phase.budget.estimated, 0);
  const actualBudget = phases.reduce((acc, phase) => acc + phase.budget.actual, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Project Phase Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage project phases, milestones, and resources
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="lg">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Reports
          </Button>
          <Button size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Phases</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePhases}</div>
            <p className="text-xs text-muted-foreground">
              {phases.length} total phases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(actualBudget, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(totalBudget, 'USD')} estimated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Resources</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">
              team members allocated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phase Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Phase Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Phase</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Timeline</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Budget</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Resources</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {phases.map((phase) => {
                  const phaseProgress = progress.find(p => p.phaseId === phase.id);
                  return (
                    <tr 
                      key={phase.id} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {phase.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(phase.status)}>
                            {phase.status}
                          </Badge>
                          <Badge variant={getPriorityColor(phase.priority)}>
                            {phase.priority}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">{phase.progress}%</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                phase.progress === 100 ? "bg-green-500" : 
                                phase.progress >= 70 ? "bg-blue-500" : 
                                phase.progress >= 40 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${phase.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {phaseProgress && (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTimelineStatusIcon(phaseProgress.timelineStatus)}</span>
                            <Badge variant={getTimelineStatusColor(phaseProgress.timelineStatus)}>
                              {phaseProgress.timelineStatus}
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatCurrency(phase.budget.actual, phase.budget.currency)}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            of {formatCurrency(phase.budget.estimated, phase.budget.currency)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {phase.resources.length} allocated
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.userId} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {resource.userName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {resource.userName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.skills.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {resource.totalAllocation}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Allocated
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(resource.hourlyRate, 'USD')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Per Hour
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        resource.totalAllocation >= 80 ? "bg-red-500" : 
                        resource.totalAllocation >= 60 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${resource.totalAllocation}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhaseDashboard;
