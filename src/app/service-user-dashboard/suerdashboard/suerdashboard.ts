import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  NgApexchartsModule
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  colors: string[];
};

interface Job {
  jobId: string;
  taskName: string;
  assignedTo: string;
  startTime: string;
  deadline: string;
  priority: 'Critical' | 'High' | 'Normal';
  slaTime: string;
  slaStatus: 'On Track' | 'At Risk' | 'Breached';
  status: 'Assigned' | 'In Progress' | 'Completed';
}

@Component({
  selector: 'app-suerdashboard',
  imports: [NgApexchartsModule,CommonModule],
  templateUrl: './suerdashboard.html',
  styleUrl: './suerdashboard.css',
})
export class Suerdashboard {
public newTasksChartOptions!: Partial<ChartOptions>;
public inProgressChartOptions!: Partial<ChartOptions>;
public blockedChartOptions!: Partial<ChartOptions>;
public overdueChartOptions!: Partial<ChartOptions>;

constructor() {

  // New Tasks (default / neutral)
  this.newTasksChartOptions = this.getBaseChartOptions(
    [0, 0, 2, 6, 3, 8, 4, 5, 7, 9, 1],
    "#10B981"

  );

  // In Progress (blue)
  this.inProgressChartOptions = this.getBaseChartOptions(
    [1, 2, 3, 5, 4, 6, 7, 6, 8, 9, 10],
    "#3B82F6"
  );

  // Blocked (yellow/orange)
  this.blockedChartOptions = this.getBaseChartOptions(
    [5, 4, 4, 3, 3, 2, 2, 1, 2, 1, 0],
    "#F59E0B"
  );

  // Overdue (red)
  this.overdueChartOptions = this.getBaseChartOptions(
    [1, 3, 5, 7, 6, 8, 9, 10, 9, 11, 12],
    "#EF4444"
  );
}

private getBaseChartOptions(data: number[], color: string): Partial<ChartOptions> {
  return {
    series: [
      {
        name: "Tasks",
        data: data
      }
    ],
    chart: {
      height: 70,
      type: "area",
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      }
    },
    colors: [color],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.6,
        opacityTo: 0.1
      }
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: {
      show: false
    },
    tooltip: {
      x: {
        show: false
      }
    }
  };
}

jobs: Job[] = [
    {
      jobId: 'J001',
      taskName: 'Inspect Vehicle',
      assignedTo: 'John Doe',
      startTime: '2026-01-23 09:00',
      deadline: '2026-01-23 12:00',
      priority: 'Critical',
      slaTime: '2h 30m',
      slaStatus: 'On Track',
      status: 'Assigned',
    },
    {
      jobId: 'J002',
      taskName: 'Load Cargo',
      assignedTo: 'Jane Smith',
      startTime: '2026-01-23 10:00',
      deadline: '2026-01-23 13:00',
      priority: 'High',
      slaTime: '1h 45m',
      slaStatus: 'At Risk',
      status: 'In Progress',
    },
    {
      jobId: 'J003',
      taskName: 'Delivery Check',
      assignedTo: 'Alex Brown',
      startTime: '2026-01-23 11:00',
      deadline: '2026-01-23 15:00',
      priority: 'Normal',
      slaTime: '3h 00m',
      slaStatus: 'Breached',
      status: 'Completed',
    },
    {
      jobId: 'J004',
      taskName: 'Unload Materials',
      assignedTo: 'Emma White',
      startTime: '2026-01-23 12:00',
      deadline: '2026-01-23 16:00',
      priority: 'High',
      slaTime: '2h 15m',
      slaStatus: 'On Track',
      status: 'Assigned',
    },
    // add more jobs here...
  ];

  // Pagination
  pageSize = 5;
  index = 0;

  get paginatedJobs(): Job[] {
    return this.jobs.slice(this.index, this.index + this.pageSize);
  }

  previous() {
    if (this.index > 0) {
      this.index -= this.pageSize;
    }
  }

  next() {
    if (this.index + this.pageSize < this.jobs.length) {
      this.index += this.pageSize;
    }
  }

  // Optional: calculate SLA status dynamically based on current time
  calculateSla(job: Job) {
    const now = new Date();
    const deadline = new Date(job.deadline);
    const diff = (deadline.getTime() - now.getTime()) / 60000; // minutes

    if (diff <= 0) return 'Breached';
    if (diff <= 60) return 'At Risk';
    return 'On Track';
  }

  
}