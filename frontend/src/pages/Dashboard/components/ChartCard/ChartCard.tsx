import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
    tension?: number;
  }>;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'doughnut' | 'horizontalBar';
  data: ChartData;
  height?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  type,
  data,
  height = 300
}) => {
  const [chartOptions, setChartOptions] = useState<any>({});

  useEffect(() => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280',
            usePointStyle: true,
            padding: 20
          }
        },
        title: {
          display: false
        },
        tooltip: {
          backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#FFFFFF',
          titleColor: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827',
          bodyColor: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
          borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true
        }
      },
      scales: {}
    };

    if (type === 'line') {
      setChartOptions({
        ...baseOptions,
        scales: {
          x: {
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
            }
          },
          y: {
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
            }
          }
        }
      });
    } else if (type === 'bar' || type === 'horizontalBar') {
      setChartOptions({
        ...baseOptions,
        scales: {
          x: {
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
            }
          },
          y: {
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
            }
          }
        }
      });
    } else if (type === 'doughnut') {
      setChartOptions({
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'bottom' as const,
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280',
              usePointStyle: true,
              padding: 20
            }
          }
        }
      });
    }
  }, [type]);

  const renderChart = () => {
    const chartData = {
      ...data,
      datasets: data.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || getDefaultColors(type, data.datasets.length),
        borderColor: dataset.borderColor || getDefaultColors(type, data.datasets.length),
        fill: dataset.fill !== undefined ? dataset.fill : type === 'line',
        tension: dataset.tension !== undefined ? dataset.tension : 0.4
      }))
    };

    switch (type) {
      case 'line':
        return <Line data={chartData} options={chartOptions} height={height} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} height={height} />;
      case 'horizontalBar':
        return <Bar data={chartData} options={{ ...chartOptions, indexAxis: 'y' }} height={height} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} height={height} />;
      default:
        return <Line data={chartData} options={chartOptions} height={height} />;
    }
  };

  const getDefaultColors = (chartType: string, datasetCount: number) => {
    if (chartType === 'doughnut') {
      return [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ];
    }
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return colors.slice(0, datasetCount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      <div style={{ height }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCard;
