'use client';

import { Doughnut, Bar, Line, Pie } from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';
import { formatCurrency } from '../../utils/helpers';

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

const COLORS = {
  primary: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  pink: ['#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d'],
  blue: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
  orange: ['#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412'],
  red: ['#fca5a5', '#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  purple: ['#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8'],
  amber: ['#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309'],
  teal: ['#5eead4', '#14b8a6', '#0d9488', '#0f766e', '#115e59'],
};

const gradientFor = (color) => (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return color;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, color + 'CC');
  gradient.addColorStop(1, color + '14');
  return gradient;
};

export const CategoryDoughnutChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;
  
  const chartData = {
    labels: data.map(d => d.category),
    datasets: [{
      data: data.map(d => d.total),
      backgroundColor: data.map((_, i) => COLORS.primary[i % COLORS.primary.length]),
      borderWidth: 0,
      borderRadius: 8,
      spacing: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, family: 'Inter', weight: '500' },
          color: '#334155',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: '600', family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-dark-900 mb-6">{title}</h3>
      <div className="h-64" style={{ maxHeight: '300px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export const TypeDoughnutChart = ({ data, title }) => {
  if (!data) return null;

  const typeColors = {
    Need: '#3b82f6',
    Want: '#ec4899',
    Saving: '#22c55e',
    Income: '#f59e0b',
    'Debt Payment': '#ef4444',
  };

  const typeData = Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({ type, value, color: typeColors[type] || '#64748b' }));

  const chartData = {
    labels: typeData.map(d => d.type),
    datasets: [{
      data: typeData.map(d => d.value),
      backgroundColor: typeData.map(d => d.color),
      borderWidth: 0,
      borderRadius: 8,
      spacing: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, family: 'Inter', weight: '500' },
          color: '#334155',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: '600', family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-dark-900 mb-6">{title}</h3>
      <div className="h-64" style={{ maxHeight: '300px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export const MonthlyTrendChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map(d => {
      const [year, month] = d.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Needs',
        data: data.map(d => d.needs),
        borderColor: '#3b82f6',
        backgroundColor: gradientFor('#3b82f6'),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Wants',
        data: data.map(d => d.wants),
        borderColor: '#ec4899',
        backgroundColor: gradientFor('#ec4899'),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Savings',
        data: data.map(d => d.savings),
        borderColor: '#22c55e',
        backgroundColor: gradientFor('#22c55e'),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Income',
        data: data.map(d => d.income || 0),
        borderColor: '#f59e0b',
        backgroundColor: gradientFor('#f59e0b'),
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderDash: [6, 4],
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, family: 'Inter', weight: '500' },
          color: '#334155',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: '600', family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
      },
      y: {
        grid: { color: '#e2e8f0' },
        ticks: { 
          color: '#64748b', 
          font: { size: 11, family: 'Inter' },
          callback: (value) => formatCurrency(value),
        },
      },
      y1: {
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#d97706',
          font: { size: 11, family: 'Inter' },
          callback: (value) => formatCurrency(value),
        },
        title: {
          display: true,
          text: 'Income',
          color: '#d97706',
          font: { size: 10, family: 'Inter', weight: '600' },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-dark-900 mb-6">{title}</h3>
      <div className="h-80" style={{ maxHeight: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export const MonthlyBarChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map(d => {
      const [year, month] = d.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Needs',
        data: data.map(d => d.needs),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        maxBarThickness: 40,
      },
      {
        label: 'Wants',
        data: data.map(d => d.wants),
        backgroundColor: '#ec4899',
        borderRadius: 8,
        maxBarThickness: 40,
      },
      {
        label: 'Savings',
        data: data.map(d => d.savings),
        backgroundColor: '#22c55e',
        borderRadius: 8,
        maxBarThickness: 40,
      },
      {
        label: 'Income',
        type: 'line',
        data: data.map(d => d.income || 0),
        borderColor: '#f59e0b',
        borderWidth: 2.5,
        borderDash: [6, 4],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'rounded',
          padding: 20,
          font: { size: 12, family: 'Inter', weight: '500' },
          color: '#334155',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: '600', family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
      },
      y: {
        stacked: true,
        grid: { color: '#e2e8f0' },
        ticks: { 
          color: '#64748b', 
          font: { size: 11, family: 'Inter' },
          callback: (value) => formatCurrency(value),
        },
      },
      y1: {
        position: 'right',
        stacked: false,
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#d97706',
          font: { size: 11, family: 'Inter' },
          callback: (value) => formatCurrency(value),
        },
        title: {
          display: true,
          text: 'Income',
          color: '#d97706',
          font: { size: 10, family: 'Inter', weight: '600' },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-dark-900 mb-6">{title}</h3>
      <div className="h-80" style={{ maxHeight: '400px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export const PaymentModeChart = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map(d => d.mode),
    datasets: [{
      data: data.map(d => d.total),
      backgroundColor: data.map((_, i) => COLORS.teal[i % COLORS.teal.length]),
      borderWidth: 0,
      borderRadius: 8,
      spacing: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11, family: 'Inter', weight: '500' },
          color: '#334155',
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, weight: '600', family: 'Inter' },
        bodyFont: { size: 11, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="card h-full">
      <h3 className="text-lg font-semibold text-dark-900 mb-6">{title}</h3>
      <div className="h-64" style={{ maxHeight: '300px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export const SavingsProgressChart = ({ saved, spent, title }) => {
  const total = saved + spent;
  const percentage = total > 0 ? (saved / total) * 100 : 0;

  const chartData = {
    labels: ['Saved', 'Spent'],
    datasets: [{
      data: [saved, spent],
      backgroundColor: ['#22c55e', '#ec4899'],
      borderWidth: 0,
      borderRadius: 8,
      spacing: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="card h-full relative">
      <h3 className="text-lg font-semibold text-dark-900 mb-6">{title}</h3>
      <div className="relative h-64 flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-dark-900">{percentage.toFixed(1)}%</span>
          <span className="text-sm text-dark-500 mt-1">Savings Rate</span>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
          <span className="text-sm font-medium text-dark-700">Saved: {formatCurrency(saved)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span className="text-sm font-medium text-dark-700">Spent: {formatCurrency(spent)}</span>
        </div>
      </div>
    </div>
  );
};