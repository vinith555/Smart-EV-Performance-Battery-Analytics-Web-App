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
  taskId: string;
  category: string;
  description:string;
  start:string;
  deadLine:string;
  assignedBy:string;
  assignedTo: string;
  priority:'Low' | 'Medium' | 'High';
  status: 'Assigned' | 'In Progress' | 'Completed';
  slaTime: string;
  slaStatus: 'On Track' | 'At Risk' | 'Breached';
  attachment:string;
  notes:string;
}

@Component({
  selector: 'app-suerdashboard',
  imports: [NgApexchartsModule,CommonModule],
  templateUrl: './suerdashboard.html',
  styleUrl: './suerdashboard.css',
})
export class Suerdashboard {
jobViewBox:boolean = false;
jobViewIndex:number = -1;
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
    taskId: "TASK-001",
    category: "IT Support",
    description: "Fix login issue for internal portal",
    start: "2026-02-01T09:00:00Z",
    deadLine: "2026-02-02T17:00:00Z",
    assignedBy: "Alice Johnson",
    assignedTo: "Mark Lee",
    priority: "High",
    status: "In Progress",
    slaTime: "24h",
    slaStatus: "At Risk",
    attachment: "login-error-screenshot.png",
    notes: "User reports intermittent failures"
  },
  {
    taskId: "TASK-002",
    category: "HR",
    description: "Prepare onboarding documents",
    start: "2026-02-03T10:00:00Z",
    deadLine: "2026-02-05T18:00:00Z",
    assignedBy: "HR Manager",
    assignedTo: "Sophie Brown",
    priority: "Medium",
    status: "Assigned",
    slaTime: "48h",
    slaStatus: "On Track",
    attachment: "",
    notes: "New hire starts next week"
  },
  {
    taskId: "TASK-003",
    category: "Finance",
    description: "Review Q1 expense reports",
    start: "2026-02-01T08:30:00Z",
    deadLine: "2026-02-07T17:00:00Z",
    assignedBy: "Finance Director",
    assignedTo: "Daniel Smith",
    priority: "Low",
    status: "In Progress",
    slaTime: "72h",
    slaStatus: "On Track",
    attachment: "expenses-q1.xlsx",
    notes: "Check compliance with policy"
  },
  {
    taskId: "TASK-004",
    category: "Operations",
    description: "Warehouse inventory audit",
    start: "2026-02-04T07:00:00Z",
    deadLine: "2026-02-06T16:00:00Z",
    assignedBy: "Operations Lead",
    assignedTo: "Priya Patel",
    priority: "High",
    status: "Assigned",
    slaTime: "36h",
    slaStatus: "On Track",
    attachment: "inventory-list.csv",
    notes: "Include damaged items"
  },
  {
    taskId: "TASK-005",
    category: "Customer Support",
    description: "Respond to escalated customer complaint",
    start: "2026-02-05T11:15:00Z",
    deadLine: "2026-02-05T15:15:00Z",
    assignedBy: "Support Manager",
    assignedTo: "Carlos Rivera",
    priority: "High",
    status: "Completed",
    slaTime: "4h",
    slaStatus: "On Track",
    attachment: "customer-email.pdf",
    notes: "Resolved with refund"
  },
  {
    taskId: "TASK-006",
    category: "Development",
    description: "Implement password reset feature",
    start: "2026-02-01T09:00:00Z",
    deadLine: "2026-02-10T18:00:00Z",
    assignedBy: "Tech Lead",
    assignedTo: "Emily Chen",
    priority: "Medium",
    status: "In Progress",
    slaTime: "120h",
    slaStatus: "At Risk",
    attachment: "feature-spec.docx",
    notes: "Pending backend API"
  },
  {
    taskId: "TASK-007",
    category: "Marketing",
    description: "Design social media campaign",
    start: "2026-02-02T10:00:00Z",
    deadLine: "2026-02-08T17:00:00Z",
    assignedBy: "Marketing Head",
    assignedTo: "Liam Wilson",
    priority: "Low",
    status: "Assigned",
    slaTime: "96h",
    slaStatus: "On Track",
    attachment: "",
    notes: "Target audience: Gen Z"
  },
  {
    taskId: "TASK-008",
    category: "Legal",
    description: "Review vendor contract",
    start: "2026-02-03T09:30:00Z",
    deadLine: "2026-02-06T17:30:00Z",
    assignedBy: "Procurement",
    assignedTo: "Olivia Green",
    priority: "Medium",
    status: "Completed",
    slaTime: "48h",
    slaStatus: "On Track",
    attachment: "vendor-contract.pdf",
    notes: "Minor clause updated"
  },
  {
    taskId: "TASK-009",
    category: "IT Security",
    description: "Investigate suspicious login attempts",
    start: "2026-02-05T02:00:00Z",
    deadLine: "2026-02-05T08:00:00Z",
    assignedBy: "Security Officer",
    assignedTo: "Noah Kim",
    priority: "High",
    status: "In Progress",
    slaTime: "6h",
    slaStatus: "Breached",
    attachment: "security-logs.txt",
    notes: "Multiple IPs detected"
  },
  {
    taskId: "TASK-010",
    category: "Administration",
    description: "Schedule quarterly team meeting",
    start: "2026-02-06T09:00:00Z",
    deadLine: "2026-02-06T12:00:00Z",
    assignedBy: "Office Manager",
    assignedTo: "Hannah Moore",
    priority: "Low",
    status: "Completed",
    slaTime: "3h",
    slaStatus: "On Track",
    attachment: "",
    notes: "Calendar invites sent"
  }
];

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

  calculateSla(job: Job) {
    const now = new Date();
    const deadline = new Date(job.deadLine);
    const diff = (deadline.getTime() - now.getTime()) / 60000; // minutes

    if (diff <= 0) return 'Breached';
    if (diff <= 60) return 'At Risk';
    return 'On Track';
  }
}