import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

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
  costofIssue:number;
  attachment:string;
  notes:string;
}
@Component({
  selector: 'app-vehicle-info',
  imports: [CommonModule,FormsModule],
  templateUrl: './vehicle-info.html',
  styleUrl: './vehicle-info.css',
})
export class VehicleInfo {
  issueViewBox:boolean = false;
  issueViewIndex:number = -1;
  issueactionForm:boolean = false;
  issueActionindex:number = -1;
  issues: VehicleIssue[] = [
  {
    issueId: "ISS-001",
    vehicleNo: "ABC-1234",
    Category: "Engine",
    description: "Engine overheating during long drives",
    dateReported: "2025-01-05",
    dateCompleted: "2025-01-07",
    assignedTo: "John Mechanic",
    assignedBy: "Fleet Manager",
    priority: "High",
    status: "Resolved",
    costofIssue: 4500,
    attachment: "engine_report_001.pdf",
    notes: "Coolant leak fixed and radiator cleaned"
  },
  {
    issueId: "ISS-002",
    vehicleNo: "XYZ-5678",
    Category: "Brakes",
    description: "Squeaking noise from front brakes",
    dateReported: "2025-01-10",
    dateCompleted: "",
    assignedTo: "Sarah Technician",
    assignedBy: "Fleet Manager",
    priority: "Medium",
    status: "In Progress",
    costofIssue: 1200,
    attachment: "brake_audio.mp3",
    notes: "Brake pads inspection ongoing"
  },
  {
    issueId: "ISS-003",
    vehicleNo: "LMN-9087",
    Category: "Electrical",
    description: "Battery draining overnight",
    dateReported: "2025-01-12",
    dateCompleted: "",
    assignedTo: "Mike Electrician",
    assignedBy: "Admin",
    priority: "High",
    status: "Open",
    costofIssue: 0,
    attachment: "",
    notes: "Possible alternator issue"
  },
  {
    issueId: "ISS-004",
    vehicleNo: "DEF-2468",
    Category: "Tyres",
    description: "Rear tyre puncture",
    dateReported: "2025-01-08",
    dateCompleted: "2025-01-08",
    assignedTo: "Roadside Assist",
    assignedBy: "Fleet Manager",
    priority: "Low",
    status: "Resolved",
    costofIssue: 800,
    attachment: "tyre_photo.jpg",
    notes: "Tyre patched successfully"
  },
  {
    issueId: "ISS-005",
    vehicleNo: "GHI-1122",
    Category: "Transmission",
    description: "Gear shifting delay",
    dateReported: "2025-01-15",
    dateCompleted: "",
    assignedTo: "Alex Mechanic",
    assignedBy: "Supervisor",
    priority: "High",
    status: "In Progress",
    costofIssue: 3000,
    attachment: "",
    notes: "Transmission fluid replacement suggested"
  },
  {
    issueId: "ISS-006",
    vehicleNo: "JKL-3344",
    Category: "Air Conditioning",
    description: "AC not cooling properly",
    dateReported: "2025-01-11",
    dateCompleted: "2025-01-13",
    assignedTo: "Cooling Specialist",
    assignedBy: "Admin",
    priority: "Medium",
    status: "Resolved",
    costofIssue: 1500,
    attachment: "ac_service_report.pdf",
    notes: "Gas refilled and filter cleaned"
  },
  {
    issueId: "ISS-007",
    vehicleNo: "MNO-5566",
    Category: "Suspension",
    description: "Vehicle pulls to left while driving",
    dateReported: "2025-01-09",
    dateCompleted: "",
    assignedTo: "Alignment Team",
    assignedBy: "Fleet Manager",
    priority: "Medium",
    status: "Open",
    costofIssue: 0,
    attachment: "",
    notes: "Wheel alignment required"
  },
  {
    issueId: "ISS-008",
    vehicleNo: "PQR-7788",
    Category: "Lighting",
    description: "Headlight not working",
    dateReported: "2025-01-06",
    dateCompleted: "2025-01-06",
    assignedTo: "Electrician",
    assignedBy: "Supervisor",
    priority: "Low",
    status: "Resolved",
    costofIssue: 300,
    attachment: "headlight_fix.jpg",
    notes: "Bulb replaced"
  },
  {
    issueId: "ISS-009",
    vehicleNo: "STU-9900",
    Category: "Fuel System",
    description: "Fuel smell inside vehicle",
    dateReported: "2025-01-14",
    dateCompleted: "",
    assignedTo: "Senior Mechanic",
    assignedBy: "Fleet Manager",
    priority: "High",
    status: "In Progress",
    costofIssue: 2200,
    attachment: "",
    notes: "Fuel line inspection ongoing"
  },
  {
    issueId: "ISS-010",
    vehicleNo: "VWX-1357",
    Category: "Body",
    description: "Minor dent on rear bumper",
    dateReported: "2025-01-04",
    dateCompleted: "2025-01-05",
    assignedTo: "Body Shop",
    assignedBy: "Admin",
    priority: "Low",
    status: "Resolved",
    costofIssue: 1800,
    attachment: "bumper_dent.jpg",
    notes: "Dent removed and repainted"
  }
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
  issueUpdatedData(data:NgForm){
    console.log(data.value);
  }
}
