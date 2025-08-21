import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Modal,
  Dropdown,
  DropdownButton,
  LoadingSpinner,
  LoadingSkeleton,
  Shimmer,
  LoadingOverlay,
} from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme, setPrimaryColor } from '@/store/slices/themeSlice';
import { showSuccess, showError, showWarning } from '@/store/slices/notificationSlice';
import {
  PlusIcon,
  CogIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

const UIDemo: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.theme);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleColorChange = (color: string) => {
    dispatch(setPrimaryColor(color));
  };

  const handleNotification = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        dispatch(showSuccess({ 
          title: 'Success!', 
          message: 'This is a success notification' 
        }));
        break;
      case 'error':
        dispatch(showError({ 
          title: 'Error!', 
          message: 'This is an error notification' 
        }));
        break;
      case 'warning':
        dispatch(showWarning({ 
          title: 'Warning!', 
          message: 'This is a warning notification' 
        }));
        break;
    }
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const dropdownItems = [
    { label: 'Edit', icon: <PencilIcon className="h-4 w-4" />, onClick: () => console.log('Edit') },
    { label: 'View', icon: <EyeIcon className="h-4 w-4" />, onClick: () => console.log('View') },
    { divider: true },
    { label: 'Delete', icon: <TrashIcon className="h-4 w-4" />, onClick: () => console.log('Delete') },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">UI Component Demo</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive showcase of our design system components
          </p>
        </div>

        {/* Theme Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Controls</CardTitle>
            <CardDescription>
              Switch between light/dark modes and color themes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Mode:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleThemeToggle}
                icon={theme.isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              >
                {theme.isDark ? 'Light' : 'Dark'}
              </Button>
              <Badge variant="secondary">
                Current: {theme.mode}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Colors:</span>
              <div className="flex gap-2">
                {['blue', 'green', 'purple', 'orange'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(`${color}-500`)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      theme.primaryColor.includes(color) ? 'ring-2 ring-offset-2 ring-ring' : ''
                    }`}
                    style={{
                      backgroundColor: {
                        blue: '#3b82f6',
                        green: '#22c55e',
                        purple: '#a855f7',
                        orange: '#f59e0b',
                      }[color],
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Different button variants and states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Sizes</h4>
              <div className="flex items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">With Icons</h4>
              <div className="flex gap-3">
                <Button icon={<PlusIcon className="h-4 w-4" />}>
                  Add Item
                </Button>
                <Button 
                  variant="outline" 
                  icon={<CogIcon className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Settings
                </Button>
                <Button loading>
                  Loading
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>
              Input fields with various states and configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Basic Input"
                placeholder="Enter some text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              
              <Input
                label="With Icon"
                placeholder="Search..."
                leftIcon={<CogIcon className="h-4 w-4" />}
              />
              
              <Input
                label="With Error"
                placeholder="This field has an error"
                error="This field is required"
              />
              
              <Input
                label="With Description"
                placeholder="Enter your email"
                description="We'll never share your email with anyone else."
                type="email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>
              Status indicators and labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dropdowns */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdowns</CardTitle>
            <CardDescription>
              Context menus and action dropdowns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <DropdownButton items={dropdownItems}>
                Actions
              </DropdownButton>
              
              <Dropdown
                trigger={
                  <Button variant="outline">
                    Custom Trigger
                  </Button>
                }
                items={dropdownItems}
                align="right"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>
              Spinners, skeletons, and loading overlays
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Spinners</h4>
              <div className="flex items-center gap-4">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
                <LoadingSpinner size="xl" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Skeletons</h4>
              <LoadingSkeleton lines={3} />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Loading State</h4>
              <div className="space-y-4">
                <Button onClick={simulateLoading}>
                  Simulate Loading
                </Button>
                <LoadingOverlay isLoading={isLoading}>
                  <div className="p-8 border border-border rounded-lg">
                    <h3 className="font-medium">Content Area</h3>
                    <p className="text-muted-foreground">
                      This content will be overlaid with a loading spinner.
                    </p>
                  </div>
                </LoadingOverlay>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Shimmer Effect</h4>
              <Shimmer className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Toast notifications (check Redux DevTools)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => handleNotification('success')}
              >
                Success
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleNotification('warning')}
              >
                Warning
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleNotification('error')}
              >
                Error
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>
              Dialog and modal components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </CardContent>
        </Card>

        {/* Cards Layout Example */}
        <Card>
          <CardHeader>
            <CardTitle>Card Layouts</CardTitle>
            <CardDescription>
              Examples of different card layouts and compositions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Feature Card</CardTitle>
                  <CardDescription>
                    A card showcasing a feature with hover effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card demonstrates how content can be organized within cards.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" className="w-full">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Statistics</CardTitle>
                    <Badge variant="success">+12%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,234</div>
                  <p className="text-sm text-muted-foreground">
                    Total users this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <CogIcon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your preferences
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        description="This is a demonstration of the modal component"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This modal demonstrates the various features available:
          </p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Backdrop blur and overlay</li>
            <li>• Smooth animations</li>
            <li>• Accessible keyboard navigation</li>
            <li>• Multiple size options</li>
          </ul>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UIDemo;
