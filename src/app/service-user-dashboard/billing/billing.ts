import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface BillItem {
  name: string;
  qty: number;
  rate: number;
  tax: number;
}

interface ProductItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  source?: string;
}

interface SuggestedItem {
  name: string;
  price: number;
  source: string;
  qty?: number;
  tax?: number;
  issue_id?: number;
}

interface BillingRecord {
  record_key: string;
  service_id: number | null;
  vehicle_id: number;
  vehicle_no: string;
  vehicle_model: string;
  owner_name: string;
  owner_email: string;
  task_names: string[];
  issue_ids: number[];
  suggested_items: SuggestedItem[];
}

interface BillingMeta {
  bill_no_suggestion: string;
  generated_at: string;
  biller_name: string;
  biller_email: string;
}

interface GeneratedBill {
  bill_id: number;
  bill_date: string;
  due_date: string;
  vehicle_no: string;
  vehicle_model: string;
  customer: string;
  service_id: number | null;
  payment_method: 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | null;
  payment_status: string;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  discount: number;
  total_amount: number;
  notes: string;
}

@Component({
  selector: 'app-billing',
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class Billing implements OnInit {
  billItems: BillItem[] = [];

  products: ProductItem[] = [];
  billingRecords: BillingRecord[] = [];
  selectedRecordKey = '';
  selectedProductId = '';

  isLoading = false;
  loadingError = '';
  isRegisteringIssues = false;
  registerStatusMessage = '';
  registerStatusType: 'success' | 'error' | '' = '';

  billMeta = {
    vehicleNo: '',
    billNo: '',
    owner: '',
    date: '',
    place: 'Service Center',
    paymentType: 'UPI',
    biller: '',
    time: '',
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBillingFormData();
  }

  private loadBillingFormData(): void {
    this.isLoading = true;
    this.loadingError = '';
    const previousSelectedRecordKey = this.selectedRecordKey;

    this.apiService.getBillingFormData().subscribe({
      next: (response) => {
        const data = response?.data || {};
        const meta: BillingMeta | undefined = data.meta;
        this.products = Array.isArray(data.products) ? data.products : [];
        this.billingRecords = Array.isArray(data.records) ? data.records : [];

        if (meta) {
          this.billMeta.billNo = meta.bill_no_suggestion || '';
          this.billMeta.biller = meta.biller_name || meta.biller_email || '';

          const dateObj = new Date(meta.generated_at);
          if (!Number.isNaN(dateObj.getTime())) {
            this.billMeta.date = dateObj.toISOString().split('T')[0];
            this.billMeta.time = dateObj.toTimeString().slice(0, 5);
          }
        }

        const previousSelectionExists = this.billingRecords.some(
          (record) => record.record_key === previousSelectedRecordKey,
        );

        if (previousSelectedRecordKey && previousSelectionExists) {
          this.selectedRecordKey = previousSelectedRecordKey;
          this.applyRecordSelection();
        } else {
          this.selectedRecordKey = '';
          this.clearSelectedRecordData();
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadingError =
          'Unable to fetch billing data from backend. Please try again.';
      },
    });
  }

  applyRecordSelection(): void {
    const selectedRecord = this.billingRecords.find(
      (record) => record.record_key === this.selectedRecordKey,
    );

    if (!selectedRecord) {
      this.clearSelectedRecordData();
      return;
    }

    this.billMeta.vehicleNo = selectedRecord.vehicle_no || '';
    this.billMeta.owner =
      selectedRecord.owner_name || selectedRecord.owner_email;

    if (selectedRecord.suggested_items?.length) {
      this.billItems = selectedRecord.suggested_items.map((item) => ({
        name: item.name,
        qty: item.qty && item.qty > 0 ? item.qty : 1,
        rate: item.price || 0,
        tax: item.tax && item.tax > 0 ? item.tax : 0,
      }));
    } else {
      this.billItems = [{ name: '', qty: 1, rate: 0, tax: 0 }];
    }
  }

  private clearSelectedRecordData(): void {
    this.billMeta.vehicleNo = '';
    this.billMeta.owner = '';
    this.billItems = [];
  }

  addEmptyItem(): void {
    this.billItems.push({ name: '', qty: 1, rate: 0, tax: 0 });
  }

  removeItem(index: number): void {
    this.billItems.splice(index, 1);
    if (this.billItems.length === 0) {
      this.addEmptyItem();
    }
  }

  addFromTable(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const productId = Number(target.value);
    const selected = this.products.find((p) => p.id === productId);

    if (selected) {
      this.billItems.push({
        name: selected.name,
        qty: 1,
        rate: selected.price,
        tax: 0,
      });
      this.selectedProductId = '';
      target.value = '';
    }
  }

  getTotal(): number {
    return this.billItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  }

  private getSelectedRecord(): BillingRecord | undefined {
    return this.billingRecords.find(
      (record) => record.record_key === this.selectedRecordKey,
    );
  }

  private downloadBillPDF(bill: GeneratedBill, items: BillItem[]): void {
    const invoiceNo = `#${String(bill.bill_id).padStart(5, '0')}`;
    const itemsRows = items
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>₹${Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>₹${Number(item.tax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>₹${Number(item.qty * item.rate + item.tax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `,
      )
      .join('');

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${invoiceNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #059669; padding-bottom: 16px; }
          .header h1 { margin: 0; color: #059669; }
          .section-title { font-size: 16px; font-weight: bold; color: #059669; margin: 18px 0 10px; }
          .info-row { display: flex; margin: 6px 0; }
          .label { font-weight: 700; width: 190px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .total { margin-top: 20px; background: #f8fafc; padding: 14px; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .grand { font-weight: bold; font-size: 18px; color: #047857; border-top: 2px solid #047857; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>${invoiceNo}</p>
          <p>Smart EV Performance & Battery Analytics</p>
        </div>

        <div class="section-title">Bill Information</div>
        <div class="info-row"><div class="label">Vehicle Number:</div><div>${bill.vehicle_no}</div></div>
        <div class="info-row"><div class="label">Vehicle Model:</div><div>${bill.vehicle_model || 'N/A'}</div></div>
        <div class="info-row"><div class="label">Customer:</div><div>${bill.customer || 'N/A'}</div></div>
        <div class="info-row"><div class="label">Bill Date:</div><div>${new Date(bill.bill_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
        <div class="info-row"><div class="label">Due Date:</div><div>${new Date(bill.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
        <div class="info-row"><div class="label">Payment Method:</div><div>${bill.payment_method || 'N/A'}</div></div>
        <div class="info-row"><div class="label">Payment Status:</div><div>${bill.payment_status}</div></div>

        <div class="section-title">Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <div class="total">
          <div class="total-row"><span>Subtotal:</span><span>₹${Number(bill.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div class="total-row"><span>Tax (${Number(bill.tax_percentage).toFixed(0)}%):</span><span>₹${Number(bill.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div class="total-row grand"><span>Grand Total:</span><span>₹${Number(bill.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  }

  generateBill(): void {
    const selectedRecord = this.getSelectedRecord();

    if (!selectedRecord) {
      this.registerStatusType = 'error';
      this.registerStatusMessage =
        'Select a service/issue record before generating bill.';
      return;
    }

    const validItems = this.billItems.filter(
      (item) => item.name.trim().length > 0 && item.qty > 0,
    );

    if (validItems.length === 0) {
      this.registerStatusType = 'error';
      this.registerStatusMessage = 'Add at least one valid bill item.';
      return;
    }

    const payload = {
      ...this.billMeta,
      items: this.billItems,
      subtotal: this.getTotal(),
      taxAmount: this.getTotal() * 0.1,
      grandTotal: this.getTotal() * 1.1,
    };

    this.isRegisteringIssues = true;
    this.registerStatusMessage = '';
    this.registerStatusType = '';

    this.apiService
      .registerBillingItemsAsIssues({
        vehicle_id: selectedRecord.vehicle_id,
        service_id: selectedRecord.service_id,
        payment_method: this.billMeta.paymentType as
          | 'CASH'
          | 'CARD'
          | 'UPI'
          | 'NET_BANKING'
          | 'WALLET',
        place: this.billMeta.place,
        items: validItems,
      })
      .subscribe({
        next: (response) => {
          this.isRegisteringIssues = false;
          this.registerStatusType = 'success';
          this.registerStatusMessage =
            response?.message ||
            'Bill generated and items were registered to Issues table.';

          const generatedBill: GeneratedBill | undefined = response?.data?.bill;
          if (generatedBill) {
            this.downloadBillPDF(generatedBill, validItems);
          }

          this.loadBillingFormData();
        },
        error: (error) => {
          this.isRegisteringIssues = false;
          this.registerStatusType = 'error';
          this.registerStatusMessage =
            error?.error?.message ||
            'Bill generated locally, but failed to register items as issues.';
        },
      });
  }
}
