import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  steps:{title:string,image:string,description:string}[] = [
    {
    title: 'User Dashboard – Battery & Performance Overview',
    description: `
      The user dashboard provides a real-time overview of battery health,
      current charge level, temperature, and charge cycles. Users can monitor
      battery condition instantly and access service invoices with payment status.
      This centralized view ensures better battery awareness and smarter EV usage.
    `,
    image: 'Userdashboard.png'
  },
  {
    title: 'Vehicle Analytics & Charging Insights',
    description: `
      The vehicle information dashboard delivers detailed analytics including
      battery capacity, range, charging history, energy consumption statistics,
      and performance trends. Interactive visual graphs help users understand
      daily, monthly, and yearly energy usage for optimized charging decisions.
    `,
    image: 'userinfo.png'
  },
  {
    title: 'Service Worker Task Management System',
    description: `
      The service dashboard enables technicians to manage tasks efficiently.
      It tracks new tasks, in-progress work, blocked issues, and overdue jobs.
      Priority levels, SLA timing, and assignment tracking improve workflow
      transparency and service productivity.
    `,
    image: 'serviceuser.png'
  },
  {
    title: 'Smart Billing & Invoice Generation',
    description: `
      The billing module allows service staff to generate structured invoices
      with automated tax calculation, itemized billing, and payment tracking.
      It simplifies service record management while ensuring accurate and
      professional financial documentation.
    `,
    image: 'billing.png'
  }
  ];
}
