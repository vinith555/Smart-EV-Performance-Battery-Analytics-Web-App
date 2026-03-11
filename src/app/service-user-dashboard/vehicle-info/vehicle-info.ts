import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface VehicleIssue {
  backendIssueId: number;
  issueId: string;
  vehicleNo: string;
  vehicleId: number;
  vehicleModel: string;
  vehicleColour: string;
  Category: string;
  description: string;
  dateReported: string;
  dateCompleted: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  costofIssue: number;
  attachment: string;
  notes: string;
}

interface IssueApiItem {
  issue_id: number;
  vehicle__registration_number: string;
  vehicle_id: number;
  vehicle__vehicle_model: string;
  vehicle__vehicle_colour: string;
  category: string;
  description: string;
  date_reported: string;
  date_completed: string | null;
  assigned_to__email: string | null;
  assigned_by__email: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  is_resolved: boolean;
  cost: number;
}

@Component({
  selector: 'app-vehicle-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
})
export class VehicleInfo implements OnInit {
  issueViewBox: boolean = false;
  issueViewIndex: number = -1;
  issueactionForm: boolean = false;
  issueActionindex: number = -1;

  isLoadingIssues = false;
  issuesError = '';
  isUpdatingIssueStatus = false;
  issueStatusError = '';
  selectedIssueStatus: 'Open' | 'In Progress' | 'Resolved' = 'In Progress';

  issues: VehicleIssue[] = [];
  selectedVehicleIssue: VehicleIssue | null = null;

  vehicleInfo = {
    vehicleNumber: '',
    model: '',
    batteryCapacity: '',
    range: '',
    chargingTime: '',
    color: '',
  };

  evStatus = {
    batteryPercentage: '',
    odometerReading: '',
    tirePressure: '',
    batteryTemperature: '',
    energyConsumption: '',
    securityStatus: '',
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadIssueDetails();
  }

  pageSize = 5;
  index2 = 0;
  searchVehicleNumber = '';

  searchVehicle(): void {
    if (!this.searchVehicleNumber.trim()) {
      // Reset to first vehicle if search is empty
      if (this.issues.length > 0) {
        this.selectedVehicleIssue = this.issues[0];
        this.updateVehicleInfo();
      }
      return;
    }

    // Find vehicle by registration number
    const found = this.issues.find((issue) =>
      issue.vehicleNo
        .toLowerCase()
        .includes(this.searchVehicleNumber.toLowerCase()),
    );

    if (found) {
      this.selectedVehicleIssue = found;
      this.updateVehicleInfo();
    }
  }

  private updateVehicleInfo(): void {
    if (!this.selectedVehicleIssue) return;

    // Update vehicle info based on selected issue
    this.vehicleInfo = {
      vehicleNumber: this.selectedVehicleIssue.vehicleNo || 'N/A',
      model: this.selectedVehicleIssue.vehicleModel || 'N/A',
      batteryCapacity: '50 kWh',
      range: '250 miles',
      chargingTime: '8 hours (Level 2)',
      color: this.selectedVehicleIssue.vehicleColour || 'N/A',
    };

    // Update EV status data
    this.evStatus = {
      batteryPercentage: '75%',
      odometerReading: '12345 km',
      tirePressure: '50 psi',
      batteryTemperature: '34 °C',
      energyConsumption: '15 kWh/100 km',
      securityStatus: 'Armed',
    };
  }

  vehiclefilterValues = {
    issueId: '',
    vehicleNo: '',
    Category: '',
    description: '',
    dateReported: '',
    priority: '',
    status: '',
  };

  loadIssueDetails(): void {
    this.isLoadingIssues = true;
    this.issuesError = '';

    this.apiService.getIssueDetails().subscribe({
      next: (response) => {
        if (response?.success && Array.isArray(response?.data)) {
          this.issues = response.data.map((item: IssueApiItem) => ({
            backendIssueId: item.issue_id,
            issueId: `ISS-${String(item.issue_id).padStart(3, '0')}`,
            vehicleNo: item.vehicle__registration_number || '-',
            vehicleId: item.vehicle_id,
            vehicleModel: item.vehicle__vehicle_model || '-',
            vehicleColour: item.vehicle__vehicle_colour || '-',
            Category: item.category || '-',
            description: item.description || '-',
            dateReported: this.formatDate(item.date_reported),
            dateCompleted: item.date_completed
              ? this.formatDate(item.date_completed)
              : '-',
            assignedTo: item.assigned_to__email || '-',
            assignedBy: item.assigned_by__email || '-',
            priority: this.mapPriority(item.priority),
            status: item.is_resolved ? 'Resolved' : 'In Progress',
            costofIssue: item.cost || 0,
            attachment: '',
            notes: '',
          }));
          this.index2 = 0;
          // Initialize selectedVehicleIssue with the first issue
          if (this.issues.length > 0) {
            this.selectedVehicleIssue = this.issues[0];
            this.updateVehicleInfo();
          }
        } else {
          this.issues = [];
          this.issuesError = 'No issues assigned to you.';
        }
        this.isLoadingIssues = false;
      },
      error: () => {
        this.issues = [];
        this.issuesError = 'Failed to load assigned issues.';
        this.isLoadingIssues = false;
      },
    });
  }

  private mapPriority(
    priority: IssueApiItem['priority'],
  ): 'Low' | 'Medium' | 'High' {
    if (priority === 'HIGH') return 'High';
    if (priority === 'MEDIUM') return 'Medium';
    return 'Low';
  }

  private formatDate(dateValue: string): string {
    return new Date(dateValue).toISOString().split('T')[0];
  }

  get filteredIssues(): VehicleIssue[] {
    return this.issues.filter((issue) => {
      const matchesIssueId =
        !this.vehiclefilterValues.issueId ||
        issue.issueId.includes(this.vehiclefilterValues.issueId);

      const matchesVehicleNo =
        !this.vehiclefilterValues.vehicleNo ||
        issue.vehicleNo
          .toLowerCase()
          .includes(this.vehiclefilterValues.vehicleNo.toLowerCase());

      const matchesCategory =
        !this.vehiclefilterValues.Category ||
        issue.Category.toLowerCase().includes(
          this.vehiclefilterValues.Category.toLowerCase(),
        );

      const matchesDescription =
        !this.vehiclefilterValues.description ||
        issue.description
          .toLowerCase()
          .includes(this.vehiclefilterValues.description.toLowerCase());

      const matchesDateReported =
        !this.vehiclefilterValues.dateReported ||
        new Date(issue.dateReported).toDateString() ===
          new Date(this.vehiclefilterValues.dateReported).toDateString();

      const matchesPriority =
        !this.vehiclefilterValues.priority ||
        issue.priority
          .toLowerCase()
          .includes(this.vehiclefilterValues.priority.toLowerCase());

      const matchesStatus =
        !this.vehiclefilterValues.status ||
        issue.status
          .toLowerCase()
          .includes(this.vehiclefilterValues.status.toLowerCase());

      return (
        matchesIssueId &&
        matchesVehicleNo &&
        matchesCategory &&
        matchesDescription &&
        matchesDateReported &&
        matchesPriority &&
        matchesStatus
      );
    });
  }

  clearIssueFilters() {
    this.vehiclefilterValues = {
      issueId: '',
      vehicleNo: '',
      Category: '',
      description: '',
      dateReported: '',
      priority: '',
      status: '',
    };
  }

  get paginatedIssues(): VehicleIssue[] {
    return this.filteredIssues.slice(this.index2, this.index2 + this.pageSize);
  }

  next2() {
    if (this.index2 + this.pageSize < this.filteredIssues.length) {
      this.index2 += this.pageSize;
    }
  }

  previous2() {
    if (this.index2 > 0) {
      this.index2 -= this.pageSize;
    }
  }

  issueUpdatedData(data: NgForm) {
    if (this.issueActionindex < 0 || !this.issues[this.issueActionindex]) {
      return;
    }

    const selectedIssue = this.issues[this.issueActionindex];
    this.isUpdatingIssueStatus = true;
    this.issueStatusError = '';

    this.apiService
      .updateIssueStatus(selectedIssue.backendIssueId, this.selectedIssueStatus)
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            selectedIssue.status = this.selectedIssueStatus;

            if (this.selectedIssueStatus === 'Resolved') {
              selectedIssue.dateCompleted = this.formatDate(
                new Date().toISOString(),
              );
            } else {
              selectedIssue.dateCompleted = '-';
            }

            this.issueactionForm = false;
          } else {
            this.issueStatusError =
              response?.message || 'Failed to update issue status.';
          }
          this.isUpdatingIssueStatus = false;
        },
        error: (error: any) => {
          this.issueStatusError =
            error?.error?.message || 'Failed to update issue status.';
          this.isUpdatingIssueStatus = false;
        },
      });
  }

  openIssueAction(index: number): void {
    this.issueActionindex = index;
    this.selectedIssueStatus = this.issues[index].status;
    this.issueStatusError = '';
    this.issueactionForm = true;
  }
}
