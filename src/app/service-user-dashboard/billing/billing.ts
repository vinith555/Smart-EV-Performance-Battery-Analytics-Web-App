import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billing',
  imports: [CommonModule,FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class Billing {
  billItems = [
  { name: '', qty: 1, rate: 0,tax:0 }
];

products = [
  { id: 1, name: 'Engine Service', price: 1500 },
  { id: 2, name: 'Oil Change', price: 800 },
  { id: 3, name: 'Trip Charge', price: 2000 }
];

addEmptyItem() {
  this.billItems.push({ name: '', qty: 1, rate: 0,tax: 0 });
}

removeItem(index: number) {
  this.billItems.splice(index, 1);
}

addFromTable(event: any) {
  const selected = this.products.find(p => p.id == event.target.value);
  if (selected) {
    this.billItems.push({
      name: selected.name,
      qty: 1,
      rate: selected.price,
      tax:0
    });
  }
}

getTotal() {
  return this.billItems.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );
}

generateBill() {
  console.log('Bill Generated:', this.billItems);
}
}
