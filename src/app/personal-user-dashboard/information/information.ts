import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

export interface Invoice {
  invoiceNo: string;
  vehicleNo: string;
  customer: string;
  service: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending';
}

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
  selector: 'app-information',
  imports: [CommonModule],
  templateUrl: './information.html',
  styleUrl: './information.css',
})
export class Information {

  invoices: Invoice[] = [
    {
      invoiceNo: '#00001',
      vehicleNo: 'TN09 AB 1234',
      customer: 'Rahul Sharma',
      service: 'Battery Check',
      date: '12/01/2026',
      amount: '₹4,500',
      status: 'Paid'
    },
    {
      invoiceNo: '#00002',
      vehicleNo: 'KA05 CD 8899',
      customer: 'Ananya Patel',
      service: 'General Service',
      date: '11/01/2026',
      amount: '₹2,800',
      status: 'Pending'
    },
    {
      invoiceNo: '#00003',
      vehicleNo: 'MH12 EF 4567',
      customer: 'Amit Verma',
      service: 'Brake Service',
      date: '10/01/2026',
      amount: '₹3,200',
      status: 'Paid'
    },
    {
      invoiceNo: '#00004',
      vehicleNo: 'DL01 GH 9988',
      customer: 'Neha Singh',
      service: 'Wheel Alignment',
      date: '09/01/2026',
      amount: '₹1,500',
      status: 'Paid'
    },
    {
      invoiceNo: '#00005',
      vehicleNo: 'TN22 JK 7766',
      customer: 'Suresh Kumar',
      service: 'Motor Check',
      date: '08/01/2026',
      amount: '₹5,000',
      status: 'Pending'
    },
    {
      invoiceNo: '#00006',
      vehicleNo: 'KA03 LM 3344',
      customer: 'Priya Nair',
      service: 'Battery Replacement',
      date: '07/01/2026',
      amount: '₹18,000',
      status: 'Paid'
    },
    {
      invoiceNo: '#00007',
      vehicleNo: 'AP09 NP 2211',
      customer: 'Ravi Teja',
      service: 'Software Update',
      date: '06/01/2026',
      amount: '₹1,200',
      status: 'Paid'
    },
    {
      invoiceNo: '#00008',
      vehicleNo: 'KL07 QR 6655',
      customer: 'Meera Das',
      service: 'AC Service',
      date: '05/01/2026',
      amount: '₹2,400',
      status: 'Pending'
    },
    {
      invoiceNo: '#00009',
      vehicleNo: 'GJ01 ST 9900',
      customer: 'Karan Shah',
      service: 'Tyre Replacement',
      date: '04/01/2026',
      amount: '₹9,600',
      status: 'Paid'
    },
    {
      invoiceNo: '#00010',
      vehicleNo: 'RJ14 UV 1122',
      customer: 'Pooja Mehta',
      service: 'Full Inspection',
      date: '03/01/2026',
      amount: '₹3,000',
      status: 'Paid'
    }
  ];

  get paginatedinvoices(): Invoice[] {
    return this.invoices.slice(this.index1, this.index1 + this.pageSize);
  }
  index1:number = 0;
  previous(){
    if (this.index1 + this.pageSize < this.issues.length) {
      this.index1 += this.pageSize;
    }
  }
  next(){
    if (this.index1 > 0) {
      this.index1 -= this.pageSize;
    }
  }

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
