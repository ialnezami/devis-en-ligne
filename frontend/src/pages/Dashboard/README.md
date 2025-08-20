# Dashboard Components

This directory contains the main dashboard implementation for the Online Quotation Tool, featuring comprehensive business analytics, real-time data updates, and customizable widgets.

## Overview

The dashboard provides a comprehensive overview of business performance with:
- **Statistics Cards**: Key performance indicators with trend analysis
- **Interactive Charts**: Multiple chart types using Chart.js
- **Activity Feed**: Real-time business activity monitoring
- **Quick Actions**: Common tasks and navigation shortcuts
- **Customization Options**: User-configurable dashboard layout

## Core Business Features

### **Quick Quote Creation**
- **Intuitive Interface**: Create professional quotes in just a few clicks
- **Template System**: Pre-built templates for common business scenarios
- **Smart Forms**: Auto-complete and validation for faster quote generation
- **Bulk Operations**: Create multiple quotes simultaneously

### **Customizable Estimates**
- **Personal Branding**: Customize quotes with your company logo and colors
- **Flexible Pricing**: Adjust rates, discounts, and payment terms
- **Professional Templates**: Industry-specific quote templates
- **Brand Consistency**: Maintain your brand identity across all quotes

### **PDF Export**
- **Professional Formatting**: High-quality PDF exports with proper formatting
- **Custom Styling**: Branded PDFs with your company identity
- **Digital Signatures**: Add digital signatures for authenticity
- **Batch Export**: Export multiple quotes at once

### **Centralized Management**
- **Quote Repository**: All quotes stored in one centralized location
- **Advanced Search**: Find quotes by client, date, amount, or status
- **Status Tracking**: Monitor quote lifecycle from draft to acceptance
- **Version Control**: Track changes and revisions to quotes

### **AI-Powered Analysis**
- **Project Intelligence**: AI analysis of project requirements and scope
- **Cost Optimization**: Smart suggestions for pricing and resource allocation
- **Risk Assessment**: AI-powered risk analysis and mitigation strategies
- **Market Insights**: Industry benchmarks and competitive analysis

### **Phase Breakdown**
- **Project Phases**: Detailed breakdown of projects into manageable phases
- **Milestone Tracking**: Set and monitor key project milestones
- **Resource Allocation**: Plan resources for each project phase
- **Timeline Management**: Visual project timeline with dependencies

### **Provisional Calendar**
- **Project Scheduling**: Automated project timeline generation
- **Resource Planning**: Schedule team members and resources
- **Deadline Management**: Track project deadlines and milestones
- **Calendar Integration**: Sync with external calendar applications

### **Free Trial**
- **Risk-Free Start**: Try the service without commitment
- **Full Feature Access**: Experience all premium features during trial
- **Easy Onboarding**: Guided setup and tutorial system
- **No Credit Card Required**: Start immediately without payment information

## Components

### 1. Dashboard (Main Component)
**File**: `Dashboard.tsx`

The main dashboard container that orchestrates all dashboard widgets and manages the overall layout.

**Features:**
- Responsive grid layout
- Real-time data updates
- Loading states
- Error handling
- Customization integration

**Props**: None (uses `useDashboard` hook internally)

**Usage**:
```tsx
import Dashboard from '@/pages/Dashboard';

// In your routes
<Route path="/dashboard" element={<Dashboard />} />
```

### 2. StatisticsCard
**File**: `components/StatisticsCard/StatisticsCard.tsx`

Displays key business metrics with trend indicators and visual styling.

**Props**:
```typescript
interface StatisticsCardProps {
  title: string;                    // Card title
  value: string | number;           // Main metric value
  change?: number;                  // Percentage change
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;                     // Heroicon name
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}
```

**Features**:
- Color-coded themes
- Trend indicators (up/down arrows)
- Percentage change display
- Icon integration
- Responsive design

**Usage**:
```tsx
<StatisticsCard
  title="Total Quotations"
  value={1250}
  change={12.5}
  changeType="increase"
  icon="DocumentTextIcon"
  color="blue"
/>
```

### 3. ChartCard
**File**: `components/ChartCard/ChartCard.tsx`

Renders various chart types using Chart.js with responsive design and theme support.

**Props**:
```typescript
interface ChartCardProps {
  title: string;                    // Chart title
  subtitle?: string;                // Optional subtitle
  type: 'line' | 'bar' | 'doughnut' | 'horizontalBar';
  data: ChartData;                  // Chart.js data structure
  height?: number;                  // Chart height (default: 300)
}
```

**Supported Chart Types**:
- **Line Charts**: Revenue trends, time series data
- **Bar Charts**: Client growth, comparisons
- **Doughnut Charts**: Status distributions
- **Horizontal Bar Charts**: Product rankings

**Features**:
- Dark/light theme support
- Responsive design
- Customizable colors
- Interactive tooltips
- Legend positioning

**Usage**:
```tsx
<ChartCard
  title="Revenue Trend"
  subtitle="Last 12 months"
  type="line"
  data={chartData.revenue}
  height={300}
/>
```

### 4. ActivityFeed
**File**: `components/ActivityFeed/ActivityFeed.tsx`

Displays recent business activities with rich metadata and status indicators.

**Props**:
```typescript
interface ActivityFeedProps {
  activities: Activity[];            // Array of activity items
}
```

**Activity Types**:
- `quotation`: Quotation-related activities
- `client`: Client management activities
- `payment`: Financial transactions
- `system`: System events

**Features**:
- Activity categorization
- Status indicators
- Timestamp formatting
- User attribution
- Amount display
- Icon mapping

**Usage**:
```tsx
<ActivityFeed activities={recentActivity} />
```

### 5. QuickActions
**File**: `components/QuickActions/QuickActions.tsx`

Provides quick access to common tasks and system features.

**Features**:
- Primary action buttons
- Secondary actions
- Quick statistics
- Color-coded categories
- Hover effects
- Navigation integration

**Action Categories**:
- **Primary**: Create quotation, add client, view reports, settings
- **Secondary**: Export data, notifications
- **Quick Stats**: Today's metrics, pending items

**Usage**:
```tsx
<QuickActions />
```

### 6. DashboardCustomization
**File**: `components/DashboardCustomization/DashboardCustomization.tsx`

Allows users to customize dashboard layout and preferences.

**Features**:
- Widget visibility toggles
- Refresh interval settings
- Theme preferences
- Reset to defaults
- Dropdown interface

**Customization Options**:
- Show/hide statistics cards
- Show/hide charts
- Show/hide activity feed
- Show/hide quick actions
- Data refresh intervals (15s, 30s, 60s)
- Theme selection (light, dark, auto)

**Usage**:
```tsx
<DashboardCustomization
  customizations={customizations}
  onCustomizationChange={handleCustomizationChange}
/>
```

## Hooks

### useDashboard
**File**: `hooks/useDashboard.ts`

Manages dashboard state, data, and interactions.

**Returns**:
```typescript
{
  statistics: DashboardStatistics;      // Business metrics
  chartData: ChartData;                // Chart datasets
  recentActivity: Activity[];          // Activity feed data
  isLoading: boolean;                  // Loading state
  customizations: DashboardCustomizations; // User preferences
  refreshData: () => void;             // Data refresh function
  updateCustomizations: (customizations) => void; // Update preferences
}
```

**Features**:
- Mock data generation for development
- State management
- Data refresh capabilities
- Customization persistence
- Loading state management

**Usage**:
```tsx
const {
  statistics,
  chartData,
  recentActivity,
  isLoading,
  customizations,
  refreshData,
  updateCustomizations
} = useDashboard();
```

## Data Structures

### DashboardStatistics
```typescript
interface DashboardStatistics {
  totalQuotations: number;
  quotationsChange: number;
  quotationsChangeType: 'increase' | 'decrease' | 'neutral';
  activeClients: number;
  clientsChange: number;
  clientsChangeType: 'increase' | 'decrease' | 'neutral';
  monthlyRevenue: number;
  revenueChange: number;
  revenueChangeType: 'increase' | 'decrease' | 'neutral';
  conversionRate: number;
  conversionChange: number;
  conversionChangeType: 'increase' | 'decrease' | 'neutral';
}
```

### ChartData
```typescript
interface ChartData {
  revenue: ChartDataset;
  quotationsByStatus: ChartDataset;
  clientGrowth: ChartDataset;
  topProducts: ChartDataset;
}
```

### Activity
```typescript
interface Activity {
  id: string;
  type: 'quotation' | 'client' | 'payment' | 'system';
  action: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed' | 'info';
  user?: string;
  amount?: number;
  icon?: string;
}
```

## Styling

### Theme Support
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Modern, eye-friendly interface
- **Auto Theme**: System preference detection

### Color Schemes
- **Blue**: Primary actions and quotations
- **Green**: Success states and clients
- **Purple**: Financial data and revenue
- **Orange**: Warnings and system events
- **Red**: Errors and critical states

### Responsive Design
- **Mobile**: Single-column layout
- **Tablet**: Two-column grid
- **Desktop**: Four-column statistics, two-column charts

## Performance Features

### Lazy Loading
- Chart components load on demand
- Data fetching with loading states
- Optimized re-renders

### Real-time Updates
- Configurable refresh intervals
- Background data updates
- User-controlled refresh

### Code Splitting
- Component-level lazy loading
- Chart.js dynamic imports
- Optimized bundle sizes

## Integration

### Routing
- Integrated with React Router
- Protected route access
- Breadcrumb navigation

### State Management
- Local state for UI interactions
- Hook-based data management
- Customization persistence

### API Integration
- Ready for backend integration
- Mock data for development
- Error handling patterns

## Development

### Setup
1. Install dependencies:
   ```bash
   npm install chart.js react-chartjs-2
   ```

2. Import components:
   ```tsx
   import Dashboard from '@/pages/Dashboard';
   ```

3. Use in routes:
   ```tsx
   <Route path="/dashboard" element={<Dashboard />} />
   ```

### Customization
- Modify color schemes in component files
- Add new chart types to ChartCard
- Extend activity types in ActivityFeed
- Add new quick actions

### Testing
- Component unit tests
- Hook testing
- Integration testing
- Performance testing

## Future Enhancements

### Planned Features
- Drag-and-drop widget reordering
- Custom widget creation
- Advanced chart configurations
- Real-time notifications
- Export capabilities
- Mobile app integration

### **Business Feature Roadmap**
- **Quick Quote Creation**: Streamlined quote generation interface
- **AI-Powered Analysis**: Intelligent project analysis and recommendations
- **Phase Breakdown**: Project phase management and tracking
- **Provisional Calendar**: Automated project scheduling and timelines
- **Advanced PDF Export**: Professional quote export with branding
- **Centralized Quote Management**: Unified quote repository and search
- **Customizable Templates**: Industry-specific quote templates
- **Free Trial System**: Risk-free onboarding experience

### Performance Improvements
- Virtual scrolling for large datasets
- Chart caching and optimization
- Background data synchronization
- Progressive loading

## Troubleshooting

### Common Issues
1. **Charts not rendering**: Check Chart.js registration
2. **Data not loading**: Verify useDashboard hook
3. **Styling issues**: Check Tailwind CSS classes
4. **Performance**: Monitor chart complexity

### Debug Mode
Enable debug logging in development:
```typescript
// In useDashboard hook
console.log('Dashboard data:', { statistics, chartData, recentActivity });
```

## Contributing

When adding new features:
1. Follow existing component patterns
2. Add proper TypeScript interfaces
3. Include responsive design
4. Add theme support
5. Update documentation
6. Test across devices

## License

This dashboard implementation is part of the Online Quotation Tool project.
