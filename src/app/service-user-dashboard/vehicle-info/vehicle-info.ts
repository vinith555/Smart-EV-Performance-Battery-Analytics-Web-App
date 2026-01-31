import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface VehicleIssue {
  issueId: string;
  vehicleNo: string;
  errorCode: string;
  type: string;
  description: string;
  date: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
}
@Component({
  selector: 'app-vehicle-info',
  imports: [CommonModule],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
})
export class VehicleInfo {
  issues: VehicleIssue[] = [
    {
      issueId: 'ISS-001',
      vehicleNo: 'EV-1023',
      errorCode: 'BMS-021',
      type: 'Battery',
      description: 'Battery temperature exceeded safe threshold',
      date: '2026-01-10',
      severity: 'High',
      status: 'Open',
    },
    {
      issueId: 'ISS-002',
      vehicleNo: 'EV-1045',
      errorCode: 'MCU-014',
      type: 'Motor Controller',
      description: 'Motor controller communication failure',
      date: '2026-01-09',
      severity: 'Medium',
      status: 'In Progress',
    },
    {
      issueId: 'ISS-003',
      vehicleNo: 'EV-1099',
      errorCode: 'CHG-008',
      type: 'Charging',
      description: 'Charging interrupted due to voltage fluctuation',
      date: '2026-01-07',
      severity: 'Low',
      status: 'Resolved',
    },
  ];

  pageSize = 5;
  index2 = 0;

  get paginatedIssues(): VehicleIssue[] {
    return this.issues.slice(this.index2, this.index2 + this.pageSize);
  }
  next2() {
    if (this.index2 + this.pageSize < this.issues.length) {
      this.index2 += this.pageSize;
    }
  }

  previous2() {
    if (this.index2 > 0) {
      this.index2 -= this.pageSize;
    }
  }
}
