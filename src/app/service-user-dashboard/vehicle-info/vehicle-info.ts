import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface VehicleIssue {
  issueId: string;
  vehicleNo: string;
  Category:string;
  description: string;
  dateReported: string;
  dateCompleted:string;
  assignedTo:string;
  assignedBy:string;
  priority:'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  costOfIssue:number;
  attachment:string;
  notes:string;
}
@Component({
  selector: 'app-vehicle-info',
  imports: [CommonModule],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
})
export class VehicleInfo {
  issues: VehicleIssue[] = [
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
