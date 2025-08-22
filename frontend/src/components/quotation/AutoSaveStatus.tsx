import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  ArrowPathIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AutoSaveState } from '@/hooks/useAutoSave';
import { formatDistanceToNow } from 'date-fns';

interface AutoSaveStatusProps {
  state: AutoSaveState;
  onRecover: () => void;
  onClear: () => void;
  onManualSave: () => void;
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
  state,
  onRecover,
  onClear,
  onManualSave,
}) => {
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);

  if (!state.lastSaved && !state.hasUnsavedChanges && !state.error) {
    return null;
  }

  const getStatusIcon = () => {
    if (state.error) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    if (state.isSaving) {
      return <ClockIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
    if (state.lastSaved) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    }
    return <InformationCircleIcon className="h-4 w-4 text-blue-500" />;
  };

  const getStatusText = () => {
    if (state.error) {
      return 'Auto-save failed';
    }
    if (state.isSaving) {
      return 'Saving...';
    }
    if (state.lastSaved) {
      return `Last saved ${formatDistanceToNow(state.lastSaved, { addSuffix: true })}`;
    }
    if (state.hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    return 'Ready';
  };

  const getStatusColor = () => {
    if (state.error) {
      return 'destructive';
    }
    if (state.isSaving) {
      return 'secondary';
    }
    if (state.lastSaved && !state.hasUnsavedChanges) {
      return 'default';
    }
    return 'outline';
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {getStatusText()}
              </div>
              {state.error && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {state.error}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {state.hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved
              </Badge>
            )}
            
            {state.recoveryData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecoveryInfo(!showRecoveryInfo)}
                className="text-xs"
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                Recovery
              </Button>
            )}

            {state.hasUnsavedChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManualSave}
                disabled={state.isSaving}
                className="text-xs"
              >
                Save Now
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Recovery Information */}
        {showRecoveryInfo && state.recoveryData && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Recovery Data Available
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRecover}
                className="text-xs"
              >
                Restore Data
              </Button>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p>Recovery data from: {state.lastSaved ? formatDistanceToNow(state.lastSaved, { addSuffix: true }) : 'Unknown time'}</p>
              <p className="mt-1">
                This will replace your current form data with the recovered version.
              </p>
            </div>
          </div>
        )}

        {/* Auto-save Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Auto-save enabled • Saves every 2 seconds after changes</span>
            <span>Data stored locally in your browser</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
