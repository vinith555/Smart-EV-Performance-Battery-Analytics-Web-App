import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';

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

@Component({
  selector: 'app-information',
  imports: [CommonModule, FormsModule],
  templateUrl: './information.html',
  styleUrl: './information.css',
})
export class Information implements OnInit {
  issueViewBox: boolean = false;
  issueViewIndex: number = -1;
  issueactionForm: boolean = false;
  issueActionindex: number = -1;

  // Charging details
  chargingData: any = null;
  isLoadingCharging: boolean = true;
  chargingError: string = '';

  // Bill details
  billsData: any[] = [];
  isLoadingBills: boolean = true;
  billsError: string = '';
  billViewBox: boolean = false;
  billViewIndex: number = -1;

  // Issues details
  issuesData: any[] = [];
  isLoadingIssues: boolean = true;
  issuesError: string = '';
  issueDeleteBox: boolean = false;
  issueDeleteIndex: number = -1;

  // Make Number and String accessible in template
  Number = Number;
  String = String;

  constructor(private apiService: ApiService) {}

  get invoices(): Invoice[] {
    return this.billsData.map((bill) => ({
      invoiceNo: `#${String(bill.bill_id).padStart(5, '0')}`,
      vehicleNo: bill.vehicle__registration_number || 'N/A',
      customer: 'Customer',
      service: bill.service__service_id
        ? `Service #${bill.service__service_id}`
        : bill.issue__issue_id
          ? `Issue #${bill.issue__issue_id}`
          : 'General',
      date: new Date(bill.bill_date).toLocaleDateString('en-IN'),
      amount: `₹${Number(bill.total_amount).toLocaleString('en-IN')}`,
      status:
        bill.payment_status === 'PAID'
          ? ('Paid' as const)
          : ('Pending' as const),
    }));
  }

  get paginatedinvoices(): Invoice[] {
    return this.invoices.slice(this.index1, this.index1 + this.pageSize);
  }
  index1: number = 0;
  next() {
    if (this.index1 + this.pageSize < this.invoices.length) {
      this.index1 += this.pageSize;
    }
  }

  previous() {
    if (this.index1 > 0) {
      this.index1 -= this.pageSize;
    }
  }

  get issues(): VehicleIssue[] {
    return this.issuesData.map((issue) => ({
      issueId: `ISS-${String(issue.issue_id).padStart(3, '0')}`,
      vehicleNo: issue.vehicle__registration_number || 'N/A',
      Category: issue.category || 'General',
      description: issue.description || '',
      dateReported: issue.date_reported
        ? new Date(issue.date_reported).toLocaleDateString('en-IN')
        : '',
      dateCompleted: issue.date_completed
        ? new Date(issue.date_completed).toLocaleDateString('en-IN')
        : '',
      assignedTo: issue.assigned_to__email || 'Unassigned',
      assignedBy: issue.assigned_by__email || 'N/A',
      priority: issue.priority || 'Low',
      status: issue.is_resolved
        ? 'Resolved'
        : issue.date_completed
          ? 'In Progress'
          : 'Open',
      costofIssue: issue.cost || 0,
      attachment: '',
      notes: '',
    }));
  }

  // Remove old hardcoded issues array
  oldIssues: VehicleIssue[] = [
    {
      issueId: 'ISS-001',
      vehicleNo: 'ABC-1234',
      Category: 'Engine',
      description: 'Engine overheating during long drives',
      dateReported: '2025-01-05',
      dateCompleted: '2025-01-07',
      assignedTo: 'John Mechanic',
      assignedBy: 'Fleet Manager',
      priority: 'High',
      status: 'Resolved',
      costofIssue: 4500,
      attachment: 'engine_report_001.pdf',
      notes: 'Coolant leak fixed and radiator cleaned',
    },
    {
      issueId: 'ISS-002',
      vehicleNo: 'XYZ-5678',
      Category: 'Brakes',
      description: 'Squeaking noise from front brakes',
      dateReported: '2025-01-10',
      dateCompleted: '',
      assignedTo: 'Sarah Technician',
      assignedBy: 'Fleet Manager',
      priority: 'Medium',
      status: 'In Progress',
      costofIssue: 1200,
      attachment: 'brake_audio.mp3',
      notes: 'Brake pads inspection ongoing',
    },
    {
      issueId: 'ISS-003',
      vehicleNo: 'LMN-9087',
      Category: 'Electrical',
      description: 'Battery draining overnight',
      dateReported: '2025-01-12',
      dateCompleted: '',
      assignedTo: 'Mike Electrician',
      assignedBy: 'Admin',
      priority: 'High',
      status: 'Open',
      costofIssue: 0,
      attachment: '',
      notes: 'Possible alternator issue',
    },
    {
      issueId: 'ISS-004',
      vehicleNo: 'DEF-2468',
      Category: 'Tyres',
      description: 'Rear tyre puncture',
      dateReported: '2025-01-08',
      dateCompleted: '2025-01-08',
      assignedTo: 'Roadside Assist',
      assignedBy: 'Fleet Manager',
      priority: 'Low',
      status: 'Resolved',
      costofIssue: 800,
      attachment: 'tyre_photo.jpg',
      notes: 'Tyre patched successfully',
    },
    {
      issueId: 'ISS-005',
      vehicleNo: 'GHI-1122',
      Category: 'Transmission',
      description: 'Gear shifting delay',
      dateReported: '2025-01-15',
      dateCompleted: '',
      assignedTo: 'Alex Mechanic',
      assignedBy: 'Supervisor',
      priority: 'High',
      status: 'In Progress',
      costofIssue: 3000,
      attachment: '',
      notes: 'Transmission fluid replacement suggested',
    },
    {
      issueId: 'ISS-006',
      vehicleNo: 'JKL-3344',
      Category: 'Air Conditioning',
      description: 'AC not cooling properly',
      dateReported: '2025-01-11',
      dateCompleted: '2025-01-13',
      assignedTo: 'Cooling Specialist',
      assignedBy: 'Admin',
      priority: 'Medium',
      status: 'Resolved',
      costofIssue: 1500,
      attachment: 'ac_service_report.pdf',
      notes: 'Gas refilled and filter cleaned',
    },
    {
      issueId: 'ISS-007',
      vehicleNo: 'MNO-5566',
      Category: 'Suspension',
      description: 'Vehicle pulls to left while driving',
      dateReported: '2025-01-09',
      dateCompleted: '',
      assignedTo: 'Alignment Team',
      assignedBy: 'Fleet Manager',
      priority: 'Medium',
      status: 'Open',
      costofIssue: 0,
      attachment: '',
      notes: 'Wheel alignment required',
    },
    {
      issueId: 'ISS-008',
      vehicleNo: 'PQR-7788',
      Category: 'Lighting',
      description: 'Headlight not working',
      dateReported: '2025-01-06',
      dateCompleted: '2025-01-06',
      assignedTo: 'Electrician',
      assignedBy: 'Supervisor',
      priority: 'Low',
      status: 'Resolved',
      costofIssue: 300,
      attachment: 'headlight_fix.jpg',
      notes: 'Bulb replaced',
    },
    {
      issueId: 'ISS-009',
      vehicleNo: 'STU-9900',
      Category: 'Fuel System',
      description: 'Fuel smell inside vehicle',
      dateReported: '2025-01-14',
      dateCompleted: '',
      assignedTo: 'Senior Mechanic',
      assignedBy: 'Fleet Manager',
      priority: 'High',
      status: 'In Progress',
      costofIssue: 2200,
      attachment: '',
      notes: 'Fuel line inspection ongoing',
    },
    {
      issueId: 'ISS-010',
      vehicleNo: 'VWX-1357',
      Category: 'Body',
      description: 'Minor dent on rear bumper',
      dateReported: '2025-01-04',
      dateCompleted: '2025-01-05',
      assignedTo: 'Body Shop',
      assignedBy: 'Admin',
      priority: 'Low',
      status: 'Resolved',
      costofIssue: 1800,
      attachment: 'bumper_dent.jpg',
      notes: 'Dent removed and repainted',
    },
  ];

  pageSize = 5;
  index2 = 0;

  vehiclefilterValues = {
    issueId: '',
    vehicleNo: '',
    Category: '',
    description: '',
    dateReported: '',
    priority: '',
    status: '',
  };

  get filteredIssues(): VehicleIssue[] {
    return this.issues.filter((issue) => {
      const matchesIssueId =
        !this.vehiclefilterValues.issueId ||
        issue.issueId.toString().includes(this.vehiclefilterValues.issueId);

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
    console.log(data.value);
  }

  ngOnInit(): void {
    this.loadChargingDetails();
    this.loadBillDetails();
    this.loadIssueDetails();
  }

  private getSelectedVehicleId(): number | undefined {
    const vehicleId = localStorage.getItem('selectedVehicleId');
    return vehicleId ? Number(vehicleId) : undefined;
  }

  loadChargingDetails(): void {
    this.isLoadingCharging = true;
    this.chargingError = '';
    const vehicleId = this.getSelectedVehicleId();

    this.apiService.getChargingDetails(vehicleId).subscribe({
      next: (response) => {
        console.log('Charging details response:', response);
        if (response.success && response.data?.vehicle_stats?.length > 0) {
          // Get the latest stats (first item)
          this.chargingData = response.data.vehicle_stats[0];
          this.isLoadingCharging = false;
        } else {
          this.chargingError = 'No charging data available';
          this.isLoadingCharging = false;
        }
      },
      error: (error) => {
        console.error('Error loading charging details:', error);
        this.chargingError = 'Failed to load charging data';
        this.isLoadingCharging = false;
      },
    });
  }

  loadBillDetails(): void {
    this.isLoadingBills = true;
    this.billsError = '';
    const vehicleId = this.getSelectedVehicleId();

    this.apiService.getBillDetails(vehicleId).subscribe({
      next: (response) => {
        console.log('Bill details response:', response);
        if (response.success && response.data?.bills) {
          this.billsData = response.data.bills;
          this.isLoadingBills = false;
        } else {
          this.billsError = 'No bill data available';
          this.isLoadingBills = false;
        }
      },
      error: (error) => {
        console.error('Error loading bill details:', error);
        this.billsError = 'Failed to load bill data';
        this.isLoadingBills = false;
      },
    });
  }

  loadIssueDetails(): void {
    this.isLoadingIssues = true;
    this.issuesError = '';
    const vehicleId = this.getSelectedVehicleId();

    this.apiService.getIssueDetails(vehicleId).subscribe({
      next: (response) => {
        console.log('Issue details response:', response);
        if (response.success && response.data) {
          this.issuesData = response.data;
          this.isLoadingIssues = false;
        } else {
          this.issuesError = 'No issue data available';
          this.isLoadingIssues = false;
        }
      },
      error: (error) => {
        console.error('Error loading issue details:', error);
        this.issuesError = 'Failed to load issue data';
        this.isLoadingIssues = false;
      },
    });
  }

  get batteryHealth(): number {
    return this.chargingData?.battery_health || 0;
  }

  get currentCharge(): number {
    return this.chargingData?.battery_percentage || 0;
  }

  get chargeCycles(): number {
    return this.chargingData?.total || 0;
  }

  get temperature(): number {
    return this.chargingData?.temperature || 0;
  }

  get batteryHealthStatus(): string {
    const health = this.batteryHealth;
    if (health >= 80) return 'Excellent condition';
    if (health >= 60) return 'Good condition';
    if (health >= 40) return 'Fair condition';
    return 'Needs attention';
  }

  get currentChargeStatus(): string {
    const charge = this.currentCharge;
    if (this.chargingData?.is_charging) return 'Charging';
    if (charge >= 80) return 'Full charge';
    if (charge >= 20) return 'Normal';
    return 'Low battery';
  }

  get temperatureStatus(): string {
    const temp = this.temperature;
    if (temp >= 20 && temp <= 35) return 'Optimal range';
    if (temp > 35 && temp <= 45) return 'Slightly high';
    if (temp > 45) return 'High temperature';
    return 'Low temperature';
  }

  viewBill(index: number): void {
    this.billViewIndex = this.index1 + index;
    this.billViewBox = true;
  }

  confirmDeleteIssue(index: number): void {
    this.issueDeleteIndex = this.index2 + index;
    this.issueDeleteBox = true;
  }

  cancelDeleteIssue(): void {
    this.issueDeleteBox = false;
    this.issueDeleteIndex = -1;
  }

  deleteIssue(): void {
    if (
      this.issueDeleteIndex === -1 ||
      !this.issuesData[this.issueDeleteIndex]
    ) {
      return;
    }

    const issueId = this.issuesData[this.issueDeleteIndex].issue_id;

    this.apiService.deleteIssue(issueId).subscribe({
      next: (response) => {
        console.log('Issue deleted successfully:', response);
        // Remove from local array
        this.issuesData.splice(this.issueDeleteIndex, 1);
        this.cancelDeleteIssue();
      },
      error: (error) => {
        console.error('Error deleting issue:', error);
        alert('Failed to delete issue. Please try again.');
      },
    });
  }

  downloadBillPDF(index: number): void {
    const billIndex = this.index1 + index;
    const bill = this.billsData[billIndex];

    if (!bill) {
      console.error('Bill not found');
      return;
    }

    // Create PDF content
    const invoiceNo = `#${String(bill.bill_id).padStart(5, '0')}`;
    const fileName = `Invoice_${invoiceNo}_${new Date().getTime()}.pdf`;

    // Create a simple HTML structure for PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${invoiceNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00712D; padding-bottom: 20px; }
          .header h1 { color: #00712D; margin: 0; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #00712D; margin-bottom: 10px; }
          .info-row { display: flex; margin: 8px 0; }
          .label { font-weight: bold; width: 200px; }
          .value { flex: 1; }
          .total-section { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; }
          .total-row.grand { font-size: 20px; font-weight: bold; color: #00712D; border-top: 2px solid #00712D; padding-top: 10px; margin-top: 10px; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 5px; font-weight: bold; }
          .status.paid { background: #d1fae5; color: #065f46; }
          .status.pending { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p style="margin: 5px 0; color: #666;">${invoiceNo}</p>
          <p style="margin: 5px 0; color: #666;">Smart EV Performance & Battery Analytics</p>
        </div>
        
        <div class="section">
          <div class="section-title">Bill Information</div>
          <div class="info-row">
            <div class="label">Invoice Number:</div>
            <div class="value">${invoiceNo}</div>
          </div>
          <div class="info-row">
            <div class="label">Bill Date:</div>
            <div class="value">${new Date(bill.bill_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
          <div class="info-row">
            <div class="label">Due Date:</div>
            <div class="value">${new Date(bill.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
          <div class="info-row">
            <div class="label">Vehicle Registration:</div>
            <div class="value">${bill.vehicle__registration_number || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="label">Vehicle Model:</div>
            <div class="value">${bill.vehicle__vehicle_model || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="label">Service Type:</div>
            <div class="value">${bill.service__service_id ? `Service #${bill.service__service_id}` : bill.issue__issue_id ? `Issue #${bill.issue__issue_id}` : 'General Service'}</div>
          </div>
          <div class="info-row">
            <div class="label">Payment Status:</div>
            <div class="value"><span class="status ${bill.payment_status === 'PAID' ? 'paid' : 'pending'}">${bill.payment_status}</span></div>
          </div>
          ${
            bill.payment_method
              ? `
          <div class="info-row">
            <div class="label">Payment Method:</div>
            <div class="value">${bill.payment_method}</div>
          </div>`
              : ''
          }
          ${
            bill.payment_date
              ? `
          <div class="info-row">
            <div class="label">Payment Date:</div>
            <div class="value">${new Date(bill.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>`
              : ''
          }
        </div>
        
        <div class="total-section">
          <div class="section-title">Payment Details</div>
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${Number(bill.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row">
            <span>Tax (${bill.tax_percentage}%):</span>
            <span>₹${Number(bill.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ${
            Number(bill.discount) > 0
              ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>- ₹${Number(bill.discount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>`
              : ''
          }
          <div class="total-row grand">
            <span>Total Amount:</span>
            <span>₹${Number(bill.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        ${
          bill.notes
            ? `
        <div class="section">
          <div class="section-title">Notes</div>
          <p style="margin: 10px 0; color: #666;">${bill.notes}</p>
        </div>`
            : ''
        }
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For any queries, please contact our support team.</p>
          <p style="margin-top: 10px;">Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      alert('Please allow popups to download the invoice PDF');
    }
  }
}
