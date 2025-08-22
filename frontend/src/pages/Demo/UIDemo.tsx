import React, { useState } from 'react';
import { 
  Button, 
  buttonVariants,
  Input, 
  inputVariants,
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  cardVariants,
  Badge, 
  badgeVariants,
  Modal,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
  ThemeToggle
} from '@/components/ui';
import { 
  HeartIcon, 
  StarIcon, 
  UserIcon, 
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const UIDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | undefined>();
  const [textareaValue, setTextareaValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [showPassword, setShowPassword] = useState(false);

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const radioOptions = [
    { value: 'option1', label: 'Option 1', description: 'This is the first option' },
    { value: 'option2', label: 'Option 2', description: 'This is the second option' },
    { value: 'option3', label: 'Option 3', description: 'This is the third option' },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          UI Component Library
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          A comprehensive collection of reusable UI components built with Tailwind CSS and React
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button Variants */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
            </div>
          </div>

          {/* Button Sizes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          {/* Button with Icons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Icon Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Icon Only</h3>
            <div className="flex flex-wrap gap-3">
              <Button size="icon" variant="outline">
                <HeartIcon className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <StarIcon className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <UserIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading States */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Loading States</h3>
            <div className="flex flex-wrap gap-3">
              <Button loading>Loading</Button>
              <Button variant="outline" loading>Loading</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Components Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Input fields, selects, and form controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Variants */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Input Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Default Input</label>
                <Input placeholder="Enter text..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">With Icon</label>
                <Input 
                  placeholder="Enter email..." 
                  leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password Input</label>
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password..." 
                  leftIcon={<LockClosedIcon className="h-4 w-4" />}
                  rightIcon={
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Error State</label>
                <Input 
                  placeholder="Error input..." 
                  error="This field has an error"
                />
              </div>
            </div>
          </div>

          {/* Select Component */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Dropdown</h3>
            <div className="max-w-xs">
              <Select
                options={selectOptions}
                value={selectedOption}
                onChange={setSelectedOption}
                placeholder="Choose an option..."
              />
            </div>
          </div>

          {/* Textarea Component */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Textarea</h3>
            <div className="max-w-md">
              <Textarea
                placeholder="Enter your message..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Checkbox Component */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Checkbox</h3>
            <div className="space-y-3">
              <Checkbox
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
                label="Accept terms and conditions"
                description="You must accept the terms to continue"
              />
              <Checkbox
                label="Subscribe to newsletter"
              />
            </div>
          </div>

          {/* Radio Group Component */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Radio Group</h3>
            <div className="max-w-md">
              <RadioGroup
                options={radioOptions}
                value={radioValue}
                onChange={setRadioValue}
                label="Choose your preferred option"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardDescription>Different card styles and layouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>This is a default card variant</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Card content goes here. This demonstrates the default card styling.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>This card has elevated shadows</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Elevated cards have more prominent shadows for better visual hierarchy.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">Cancel</Button>
                <Button size="sm">Confirm</Button>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
                <CardDescription>This card has a border outline</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Outlined cards use borders instead of shadows for a cleaner look.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">View</Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Badge Variants */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="muted">Muted</Badge>
            </div>
          </div>

          {/* Badge Sizes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
              <Badge size="xl">Extra Large</Badge>
            </div>
          </div>

          {/* Badges with Icons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Badge leftIcon={<StarIcon className="h-3 w-3" />}>
                Featured
              </Badge>
              <Badge variant="success" rightIcon={<CheckIcon className="h-3 w-3" />}>
                Completed
              </Badge>
              <Badge variant="warning" leftIcon={<ExclamationTriangleIcon className="h-3 w-3" />}>
                Warning
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Modal</CardTitle>
          <CardDescription>Overlay dialogs and popups</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                This is an example modal dialog. It demonstrates the modal component's functionality.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </CardContent>
      </Card>

      {/* Theme Toggle Section */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Toggle</CardTitle>
          <CardDescription>Switch between light and dark modes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <ThemeToggle size="lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the button above to toggle between light and dark themes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Utility Classes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Utility Classes</CardTitle>
          <CardDescription>Common utility functions and classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Class Merging with `cn`</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <code className="text-sm">
                {`const combinedClasses = cn(
  "base-class",
  conditional && "conditional-class",
  variant === "primary" ? "primary-class" : "secondary-class"
);`}
              </code>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Component Variants</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <code className="text-sm">
                {`const buttonVariants = cva(
  "base-button-classes",
  {
    variants: {
      variant: { default: "...", outline: "..." },
      size: { sm: "...", default: "...", lg: "..." }
    }
  }
);`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIDemo;
