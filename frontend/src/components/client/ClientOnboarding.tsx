import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Client, ClientOnboarding, ClientOnboardingStep, clientManagementService } from '@/services/clientManagementService';
import { toast } from 'react-hot-toast';

interface ClientOnboardingProps {
  client: Client;
  onOnboardingCreated?: (onboarding: ClientOnboarding) => void;
  onOnboardingUpdated?: (onboarding: ClientOnboarding) => void;
  onOnboardingCompleted?: (onboarding: ClientOnboarding) => void;
}

export const ClientOnboarding: React.FC<ClientOnboardingProps> = ({
  client,
  onOnboardingCreated,
  onOnboardingUpdated,
  onOnboardingCompleted,
}) => {
  const [onboarding, setOnboarding] = useState<ClientOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOnboarding, setEditingOnboarding] = useState<ClientOnboarding | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [showStepForm, setShowStepForm] = useState(false);
  const [editingStep, setEditingStep] = useState<ClientOnboardingStep | null>(null);

  useEffect(() => {
    loadOnboarding();
  }, [client.id]);

  const loadOnboarding = async () => {
    setIsLoading(true);
    try {
      const onboardingData = await clientManagementService.getClientOnboarding(client.id);
      if (onboardingData.success) {
        setOnboarding(onboardingData.onboarding);
        setCurrentStepIndex(onboardingData.onboarding.currentStep - 1);
      }
    } catch (error) {
      console.error('Failed to load onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOnboarding = async () => {
    try {
      const defaultSteps: ClientOnboardingStep[] = [
        {
          id: '1',
          title: 'Company Information',
          description: 'Basic company details and contact information',
          type: 'form',
          isRequired: true,
          isCompleted: false,
          order: 1,
        },
        {
          id: '2',
          title: 'Document Verification',
          description: 'Upload and verify required documents',
          type: 'document_upload',
          isRequired: true,
          isCompleted: false,
          order: 2,
        },
        {
          id: '3',
          title: 'Terms & Conditions',
          description: 'Review and accept terms and conditions',
          type: 'verification',
          isRequired: true,
          isCompleted: false,
          order: 3,
        },
        {
          id: '4',
          title: 'Account Setup',
          description: 'Configure account settings and preferences',
          type: 'form',
          isRequired: false,
          isCompleted: false,
          order: 4,
        },
        {
          id: '5',
          title: 'Final Approval',
          description: 'Final review and approval process',
          type: 'approval',
          isRequired: true,
          isCompleted: false,
          order: 5,
        },
      ];

      const newOnboarding = await clientManagementService.createClientOnboarding(client.id, {
        status: 'pending',
        currentStep: 1,
        totalSteps: defaultSteps.length,
        steps: defaultSteps,
        notes: '',
        assignedTo: 'current-user',
      });

      if (newOnboarding.success) {
        setOnboarding(newOnboarding.onboarding);
        setShowCreateForm(false);
        toast.success('Onboarding created successfully');

        if (onOnboardingCreated) {
          onOnboardingCreated(newOnboarding.onboarding);
        }
      }
    } catch (error) {
      console.error('Failed to create onboarding:', error);
      toast.error('Failed to create onboarding');
    }
  };

  const handleCompleteStep = async (stepId: string, stepData: Record<string, any>) => {
    if (!onboarding) return;

    try {
      const updatedOnboarding = await clientManagementService.completeOnboardingStep(
        client.id,
        stepId,
        stepData
      );

      if (updatedOnboarding.success) {
        setOnboarding(updatedOnboarding.onboarding);
        setCurrentStepIndex(updatedOnboarding.onboarding.currentStep - 1);
        setStepData({});
        setShowStepForm(false);
        toast.success('Step completed successfully');

        if (updatedOnboarding.onboarding.status === 'completed' && onOnboardingCompleted) {
          onOnboardingCompleted(updatedOnboarding.onboarding);
        } else if (onOnboardingUpdated) {
          onOnboardingUpdated(updatedOnboarding.onboarding);
        }
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
      toast.error('Failed to complete step');
    }
  };

  const handleUpdateOnboarding = async (updates: Partial<ClientOnboarding>) => {
    if (!onboarding) return;

    try {
      const updatedOnboarding = await clientManagementService.updateClientOnboarding(
        client.id,
        onboarding.id,
        updates
      );

      if (updatedOnboarding.success) {
        setOnboarding(updatedOnboarding.onboarding);
        setEditingOnboarding(null);
        toast.success('Onboarding updated successfully');

        if (onOnboardingUpdated) {
          onOnboardingUpdated(updatedOnboarding.onboarding);
        }
      }
    } catch (error) {
      console.error('Failed to update onboarding:', error);
      toast.error('Failed to update onboarding');
    }
  };

  const handleEditStep = (step: ClientOnboardingStep) => {
    setEditingStep(step);
    setStepData(step.data || {});
    setShowStepForm(true);
  };

  const handleSaveStep = async () => {
    if (!onboarding || !editingStep) return;

    try {
      const updatedSteps = onboarding.steps.map(step =>
        step.id === editingStep.id
          ? { ...step, data: stepData, isCompleted: true, completedAt: new Date() }
          : step
      );

      await handleUpdateOnboarding({ steps: updatedSteps });
      setEditingStep(null);
      setShowStepForm(false);
      setStepData({});
    } catch (error) {
      console.error('Failed to save step:', error);
      toast.error('Failed to save step');
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'form': return <DocumentTextIcon className="h-5 w-5" />;
      case 'document_upload': return <DocumentTextIcon className="h-5 w-5" />;
      case 'verification': return <CheckIcon className="h-5 w-5" />;
      case 'approval': return <CogIcon className="h-5 w-5" />;
      default: return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getStepColor = (step: ClientOnboardingStep) => {
    if (step.isCompleted) return 'green';
    if (step.isRequired) return 'red';
    return 'gray';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'on_hold': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStepForm = (step: ClientOnboardingStep) => {
    switch (step.type) {
      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <Input
                type="text"
                value={stepData.companyName || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
              <Input
                type="text"
                value={stepData.industry || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="Enter industry"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <Textarea
                value={stepData.notes || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'document_upload':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <Select
                value={stepData.documentType || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, documentType: e.target.value }))}
              >
                <option value="">Select document type</option>
                <option value="business_license">Business License</option>
                <option value="tax_certificate">Tax Certificate</option>
                <option value="insurance_certificate">Insurance Certificate</option>
                <option value="other">Other</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Number
              </label>
              <Input
                type="text"
                value={stepData.documentNumber || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, documentNumber: e.target.value }))}
                placeholder="Enter document number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <Input
                type="date"
                value={stepData.expiryDate || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="termsAccepted"
                checked={stepData.termsAccepted || false}
                onChange={(e) => setStepData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="termsAccepted" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                I accept the terms and conditions
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="privacyAccepted"
                checked={stepData.privacyAccepted || false}
                onChange={(e) => setStepData(prev => ({ ...prev, privacyAccepted: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="privacyAccepted" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                I accept the privacy policy
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Comments
              </label>
              <Textarea
                value={stepData.comments || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Any additional comments..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'approval':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approval Decision
              </label>
              <Select
                value={stepData.approvalDecision || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, approvalDecision: e.target.value }))}
              >
                <option value="">Select decision</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending_review">Pending Review</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approval Notes
              </label>
              <Textarea
                value={stepData.approvalNotes || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, approvalNotes: e.target.value }))}
                placeholder="Enter approval notes..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approved By
              </label>
              <Input
                type="text"
                value={stepData.approvedBy || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, approvedBy: e.target.value }))}
                placeholder="Enter approver name"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400">No form available for this step type</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading onboarding...</p>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Client Onboarding
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No onboarding process has been created for this client yet.
          </p>
          <Button onClick={handleCreateOnboarding}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Start Onboarding Process
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Client Onboarding
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage the onboarding process for {client.companyName}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" color={getStatusColor(onboarding.status)}>
            {onboarding.status.replace('_', ' ').charAt(0).toUpperCase() + onboarding.status.replace('_', ' ').slice(1)}
          </Badge>
          
          <Button variant="outline" onClick={() => setEditingOnboarding(onboarding)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress: {onboarding.currentStep} of {onboarding.totalSteps} steps
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((onboarding.currentStep / onboarding.totalSteps) * 100)}% Complete
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(onboarding.currentStep / onboarding.totalSteps) * 100}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Started:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {formatDate(onboarding.startedAt)}
                </span>
              </div>
              
              {onboarding.completedAt && (
                <div>
                  <span className="text-gray-500">Completed:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {formatDate(onboarding.completedAt)}
                  </span>
                </div>
              )}
              
              <div>
                <span className="text-gray-500">Assigned To:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {onboarding.assignedTo}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {onboarding.status.replace('_', ' ').charAt(0).toUpperCase() + onboarding.status.replace('_', ' ').slice(1)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboarding.steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  step.isCompleted
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : index === currentStepIndex
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-${getStepColor(step)}-100`}>
                      {getStepIcon(step.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {step.order}. {step.title}
                        </h3>
                        
                        {step.isRequired && (
                          <Badge variant="outline" color="red" className="text-xs">
                            Required
                          </Badge>
                        )}
                        
                        {step.isCompleted && (
                          <Badge variant="outline" color="green" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {step.description}
                      </p>
                      
                      {step.isCompleted && step.completedAt && (
                        <p className="text-xs text-gray-500">
                          Completed on {formatDate(step.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {step.isCompleted ? (
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                        <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : index === currentStepIndex ? (
                      <Button
                        size="sm"
                        onClick={() => handleEditStep(step)}
                      >
                        <ArrowRightIcon className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                    ) : (
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={onboarding.notes}
              onChange={(e) => handleUpdateOnboarding({ notes: e.target.value })}
              placeholder="Add notes about the onboarding process..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step Form Modal */}
      {showStepForm && editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Complete Step: {editingStep.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowStepForm(false);
                    setEditingStep(null);
                    setStepData({});
                  }}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {renderStepForm(editingStep)}
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStepForm(false);
                      setEditingStep(null);
                      setStepData({});
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <Button onClick={handleSaveStep}>
                    Complete Step
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Onboarding Modal */}
      {editingOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Onboarding
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingOnboarding(null)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <Select
                    value={editingOnboarding.status}
                    onChange={(e) => setEditingOnboarding(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Step
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={editingOnboarding.totalSteps}
                    value={editingOnboarding.currentStep}
                    onChange={(e) => setEditingOnboarding(prev => prev ? { ...prev, currentStep: parseInt(e.target.value) } : null)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned To
                  </label>
                  <Input
                    type="text"
                    value={editingOnboarding.assignedTo}
                    onChange={(e) => setEditingOnboarding(prev => prev ? { ...prev, assignedTo: e.target.value } : null)}
                    placeholder="Enter assigned user"
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setEditingOnboarding(null)}
                  >
                    Cancel
                  </Button>
                  
                  <Button onClick={() => handleUpdateOnboarding(editingOnboarding)}>
                    Update Onboarding
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
