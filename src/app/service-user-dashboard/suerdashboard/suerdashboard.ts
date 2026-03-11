import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';

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
  serviceId: number;
  taskId: string;
  category: string;
  vehicleModel: string;
  registrationNumber: string;
  description: string;
  start: string;
  deadLine: string;
  assignedBy: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Assigned' | 'In Progress' | 'Completed';
  slaTime: string;
  slaStatus: 'On Track' | 'At Risk' | 'Breached';
  notes: string;
  vehicleId: number;
}

@Component({
  selector: 'app-suerdashboard',
  imports: [NgApexchartsModule, CommonModule, FormsModule],
  templateUrl: './suerdashboard.html',
  styleUrl: './suerdashboard.css',
})
export class Suerdashboard implements OnInit {
  jobViewBox: boolean = false;
  selectedViewJob: Job | null = null;
  isLoadingServiceStats: boolean = true;
  serviceStatsError: string = '';
  serviceData: any[] = [];

  public newTasksChartOptions!: Partial<ChartOptions>;
  public inProgressChartOptions!: Partial<ChartOptions>;
  public blockedChartOptions!: Partial<ChartOptions>;
  public overdueChartOptions!: Partial<ChartOptions>;

  constructor(private apiService: ApiService) {
    // Initialize with empty data until endpoint response arrives
    this.newTasksChartOptions = this.getBaseChartOptions([0], '#10B981');
    this.inProgressChartOptions = this.getBaseChartOptions([0], '#3B82F6');
    this.blockedChartOptions = this.getBaseChartOptions([0], '#F59E0B');
    this.overdueChartOptions = this.getBaseChartOptions([0], '#EF4444');
  }

  ngOnInit(): void {
    this.loadServiceDetails();
  }

  loadServiceDetails(): void {
    this.isLoadingServiceStats = true;
    this.serviceStatsError = '';

    this.apiService.getServiceDetails().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.serviceData = response.data;
        } else {
          this.serviceData = [];
        }
        this.updateMetricCharts();
        this.isLoadingServiceStats = false;
      },
      error: () => {
        this.serviceData = [];
        this.serviceStatsError = 'Failed to load service stats';
        this.updateMetricCharts();
        this.isLoadingServiceStats = false;
      },
    });
  }

  private normalizeStatus(status: string): string {
    return String(status || '')
      .trim()
      .toUpperCase();
  }

  private normalizeSlaStatus(slaStatus: string): string {
    return String(slaStatus || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');
  }

  get newTasksCount(): number {
    return this.serviceData.filter(
      (item) => this.normalizeStatus(item.status) === 'PENDING',
    ).length;
  }

  get inProgressCount(): number {
    return this.serviceData.filter(
      (item) => this.normalizeStatus(item.status) === 'ONGOING',
    ).length;
  }

  get blockedCount(): number {
    return this.serviceData.filter((item) => this.isBlockedTask(item)).length;
  }

  get overdueCount(): number {
    return this.serviceData.filter((item) => this.isOverdueTask(item)).length;
  }

  private isBlockedTask(item: any): boolean {
    const status = this.normalizeStatus(item.status);
    const sla = this.normalizeSlaStatus(item.sla_status);
    return (
      status !== 'COMPLETED' &&
      (sla === 'AT_RISK' || sla === 'BREACHED' || sla === 'BLOCKED')
    );
  }

  private isOverdueTask(item: any): boolean {
    const now = new Date().getTime();
    const status = this.normalizeStatus(item.status);
    const deadline = new Date(item.deadline).getTime();
    return status !== 'COMPLETED' && !Number.isNaN(deadline) && deadline < now;
  }

  private buildMetricSeries(predicate: (item: any) => boolean): number[] {
    const sorted = [...this.serviceData].sort(
      (a, b) =>
        new Date(a.start_time || a.deadline).getTime() -
        new Date(b.start_time || b.deadline).getTime(),
    );

    if (!sorted.length) {
      return [0];
    }

    let running = 0;
    const series: number[] = [];

    for (const item of sorted) {
      if (predicate(item)) {
        running += 1;
      }
      series.push(running);
    }

    return series.slice(-10);
  }

  private updateMetricCharts(): void {
    this.newTasksChartOptions = this.getBaseChartOptions(
      this.buildMetricSeries(
        (item) => this.normalizeStatus(item.status) === 'PENDING',
      ),
      '#10B981',
    );

    this.inProgressChartOptions = this.getBaseChartOptions(
      this.buildMetricSeries(
        (item) => this.normalizeStatus(item.status) === 'ONGOING',
      ),
      '#3B82F6',
    );

    this.blockedChartOptions = this.getBaseChartOptions(
      this.buildMetricSeries((item) => this.isBlockedTask(item)),
      '#F59E0B',
    );

    this.overdueChartOptions = this.getBaseChartOptions(
      this.buildMetricSeries((item) => this.isOverdueTask(item)),
      '#EF4444',
    );
  }

  private getBaseChartOptions(
    data: number[],
    color: string,
  ): Partial<ChartOptions> {
    return {
      series: [
        {
          name: 'Tasks',
          data: data,
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        sparkline: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      colors: [color],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.5,
          opacityFrom: 0.6,
          opacityTo: 0.1,
        },
      },
      xaxis: {
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      grid: {
        show: false,
      },
      tooltip: {
        x: {
          show: false,
        },
      },
    };
  }

  get jobs(): Job[] {
    return this.serviceData.map((service) => ({
      serviceId: service.service_id,
      taskId: `SRV-${service.service_id}`,
      category: service.vehicle__vehicle_model
        ? `${service.vehicle__vehicle_model} (${service.vehicle__registration_number || service.vehicle_id})`
        : `Vehicle #${service.vehicle_id}`,
      vehicleModel:
        service.vehicle__vehicle_model || `Vehicle #${service.vehicle_id}`,
      registrationNumber: service.vehicle__registration_number || 'N/A',
      description: service.notes || 'Service task',
      start: service.start_time,
      deadLine: service.deadline,
      assignedBy: service.assigned_by__email || 'N/A',
      priority: this.normalizePriority(service.priority),
      status: this.normalizeStatusForTable(service.status),
      slaTime: service.sla_time ? `${service.sla_time}h` : 'N/A',
      slaStatus: this.normalizeSlaStatusForTable(service.sla_status),
      notes: service.notes || '',
      vehicleId: service.vehicle_id,
    }));
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private normalizePriority(priority: string): 'Low' | 'Medium' | 'High' {
    const normalized = String(priority || '')
      .trim()
      .toUpperCase();
    if (normalized === 'HIGH') return 'High';
    if (normalized === 'MEDIUM') return 'Medium';
    return 'Low';
  }

  private normalizeStatusForTable(
    status: string,
  ): 'Assigned' | 'In Progress' | 'Completed' {
    const normalized = this.normalizeStatus(status);
    if (normalized === 'PENDING') return 'Assigned';
    if (normalized === 'ONGOING') return 'In Progress';
    return 'Completed';
  }

  private normalizeSlaStatusForTable(
    slaStatus: string,
  ): 'On Track' | 'At Risk' | 'Breached' {
    const normalized = this.normalizeSlaStatus(slaStatus);
    if (normalized === 'AT_RISK') return 'At Risk';
    if (normalized === 'BREACHED') return 'Breached';
    if (normalized === 'BLOCKED') return 'Breached';
    return 'On Track';
  }

  pageSize = 5;
  index = 0;

  filteredJobs = {
    taskId: '',
    category: '',
    registrationNumber: '',
    startDate: '',
    endDate: '',
    priority: '',
    status: '',
  };

  get filteredJobList(): Job[] {
    return this.jobs.filter((job) => {
      const matchesTaskId =
        !this.filteredJobs.taskId ||
        job.taskId
          .toLowerCase()
          .includes(this.filteredJobs.taskId.toLowerCase());

      const matchesCategory =
        !this.filteredJobs.category ||
        job.vehicleModel
          .toLowerCase()
          .includes(this.filteredJobs.category.toLowerCase());

      const matchesRegistration =
        !this.filteredJobs.registrationNumber ||
        job.registrationNumber
          .toLowerCase()
          .includes(this.filteredJobs.registrationNumber.toLowerCase());

      const matchesStartDate =
        !this.filteredJobs.startDate ||
        new Date(job.start).toDateString() ===
          new Date(this.filteredJobs.startDate).toDateString();

      const matchesEndDate =
        !this.filteredJobs.endDate ||
        new Date(job.deadLine).toDateString() ===
          new Date(this.filteredJobs.endDate).toDateString();

      const matchesPriority =
        !this.filteredJobs.priority ||
        job.priority.toLowerCase() === this.filteredJobs.priority.toLowerCase();

      const matchesStatus =
        !this.filteredJobs.status ||
        job.status.toLowerCase() === this.filteredJobs.status.toLowerCase();

      return (
        matchesTaskId &&
        matchesCategory &&
        matchesRegistration &&
        matchesStartDate &&
        matchesEndDate &&
        matchesPriority &&
        matchesStatus
      );
    });
  }
  clearJobFilters() {
    this.filteredJobs = {
      taskId: '',
      category: '',
      registrationNumber: '',
      startDate: '',
      endDate: '',
      priority: '',
      status: '',
    };
  }
  get paginatedJobs(): Job[] {
    return this.filteredJobList.slice(this.index, this.index + this.pageSize);
  }
  previous() {
    if (this.index > 0) {
      this.index -= this.pageSize;
    }
  }

  next() {
    if (this.index + this.pageSize < this.filteredJobList.length) {
      this.index += this.pageSize;
    }
  }

  workerActionForm = false;
  selectedJob: Job | null = null;
  selectedServiceStatus: 'PENDING' | 'ONGOING' | 'COMPLETED' = 'PENDING';
  isUpdatingServiceStatus = false;
  serviceUpdateError = '';

  openWorkerAction(job: Job): void {
    this.selectedJob = job;
    if (job.status === 'Assigned') this.selectedServiceStatus = 'PENDING';
    else if (job.status === 'In Progress')
      this.selectedServiceStatus = 'ONGOING';
    else this.selectedServiceStatus = 'COMPLETED';
    this.serviceUpdateError = '';
    this.workerActionForm = true;
  }

  updateJobByWorker(form: any) {
    if (form.valid && this.selectedJob) {
      this.isUpdatingServiceStatus = true;
      this.serviceUpdateError = '';
      this.apiService
        .updateServiceStatus(
          this.selectedJob.serviceId,
          this.selectedServiceStatus,
        )
        .subscribe({
          next: () => {
            const raw = this.serviceData.find(
              (s) => s.service_id === this.selectedJob!.serviceId,
            );
            if (raw) raw.status = this.selectedServiceStatus;
            this.isUpdatingServiceStatus = false;
            this.workerActionForm = false;
          },
          error: () => {
            this.serviceUpdateError =
              'Failed to update status. Please try again.';
            this.isUpdatingServiceStatus = false;
          },
        });
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
