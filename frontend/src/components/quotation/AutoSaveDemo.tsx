import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveStatus } from './AutoSaveStatus';
import { toast } from 'react-hot-toast';

interface DemoFormData {
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  notes: string;
  lastModified: Date;
}

const AutoSaveDemo: React.FC = () => {
  const [formData, setFormData] = useState<DemoFormData>({
    title: '',
    description: '',
    clientName: '',
    clientEmail: '',
    amount: 0,
    notes: '',
    lastModified: new Date(),
  });

  const [autoSaveState, manualSave, loadFromStorage, clearSavedData] = useAutoSave(
    formData,
    {
      key: 'demo_form',
      delay: 1500, // 1.5 seconds for demo
      enabled: true,
      validate: (data) => {
        // Simple validation for demo
        return data.title.length > 0 && data.clientName.length > 0;
      },
      onSave: (data) => {
        console.log('Auto-saved demo data:', data);
        setFormData(prev => ({
          ...prev,
          lastModified: new Date()
        }));
      },
      onLoad: (data) => {
        if (window.confirm('Recovery data found! Would you like to restore your previous work?')) {
          setFormData(prev => ({
            ...prev,
            ...data,
            lastModified: new Date()
          }));
          toast.success('Demo data restored successfully!');
        }
      },
      onError: (error) => {
        console.error('Auto-save error:', error);
        toast.error('Auto-save failed. Please save manually.');
      }
    }
  );

  const handleInputChange = (field: keyof DemoFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      lastModified: new Date()
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearSavedData();
    toast.success('Form submitted! Auto-save data cleared.');
    console.log('Submitting demo form:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Auto-Save Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the auto-save functionality by filling out this form
        </p>
      </div>

      {/* Auto-save Status */}
      <AutoSaveStatus
        state={autoSaveState}
        onRecover={() => {
          const recoveredData = loadFromStorage();
          if (recoveredData) {
            setFormData(prev => ({
              ...prev,
              ...recoveredData,
              lastModified: new Date()
            }));
            toast.success('Demo data restored successfully!');
          }
        }}
        onClear={() => {
          if (window.confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
            clearSavedData();
            toast.success('Saved data cleared');
          }
        }}
        onManualSave={manualSave}
      />

      <Card>
        <CardHeader>
          <CardTitle>Demo Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter quotation title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client Name *
                </label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client Email
                </label>
                <Input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="Enter client email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter additional notes"
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last modified: {formData.lastModified.toLocaleString()}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={manualSave}
                  disabled={autoSaveState.isSaving}
                >
                  {autoSaveState.isSaving ? 'Saving...' : 'Save Now'}
                </Button>
                
                <Button type="submit">
                  Submit Form
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test Auto-Save</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>1. Fill out the form above - data will auto-save every 1.5 seconds</p>
          <p>2. Try refreshing the page - you'll be prompted to restore your data</p>
          <p>3. Close the tab and reopen - your data will still be there</p>
          <p>4. Use the "Save Now" button for immediate saving</p>
          <p>5. Submit the form to clear all saved data</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoSaveDemo;
