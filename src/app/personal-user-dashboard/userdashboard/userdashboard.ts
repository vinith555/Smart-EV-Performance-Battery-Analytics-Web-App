import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {NgApexchartsModule} from 'ng-apexcharts';
import { ApexAxisChartSeries,ApexChart,ApexXAxis,ApexStroke,ApexDataLabels,ApexTitleSubtitle } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
};

interface Trip {
  tripId: string;
  vehicleNo: string;
  driver: string;
  startLocation: string;
  endLocation: string;
  distance: number; // km
  duration: string; // hh:mm
  status: 'Completed' | 'Ongoing' | 'Cancelled';
}

@Component({
  selector: 'app-userdashboard',
  imports: [NgApexchartsModule,CommonModule],
  templateUrl: './userdashboard.html',
  styleUrl: './userdashboard.css',
})
export class Userdashboard {
  evModel:string = 'Tesla Model S';
  yearModel:number = 2022;
  vehicleImage:string = '10815869.png';

  statistics!: Partial<ChartOptions>;

  constructor() {
    this.statistics = { 
      series: [
        {
          name: "Energy Consumed (kwh)",
          data: [10, 15, 8, 12, 20, 18,]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false
        },
      },
      stroke: {
        curve: 'smooth'
      },
      dataLabels: {
        enabled: false
      },
      title: {
        text: 'Battery Usage',
        align: 'left'
      },
      xaxis: {
        categories: ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM']
      }
    };
  }

    trips: Trip[] = [
    {
      tripId: 'TRIP-001',
      vehicleNo: 'MH12 AB 1234',
      driver: 'John Doe',
      startLocation: 'Mumbai',
      endLocation: 'Pune',
      distance: 150,
      duration: '3h 20m',
      status: 'Completed',
    },
    {
      tripId: 'TRIP-002',
      vehicleNo: 'MH14 CD 5678',
      driver: 'Amit Sharma',
      startLocation: 'Delhi',
      endLocation: 'Gurgaon',
      distance: 42,
      duration: '1h 10m',
      status: 'Ongoing',
    },
    {
      tripId: 'TRIP-003',
      vehicleNo: 'KA01 EF 9012',
      driver: 'Ravi Kumar',
      startLocation: 'Bangalore',
      endLocation: 'Mysore',
      distance: 145,
      duration: '3h 5m',
      status: 'Cancelled',
    },
    {
      tripId: 'TRIP-004',
      vehicleNo: 'TN09 GH 3456',
      driver: 'Suresh',
      startLocation: 'Chennai',
      endLocation: 'Vellore',
      distance: 140,
      duration: '2h 50m',
      status: 'Completed',
    },
    {
      tripId: 'TRIP-004',
      vehicleNo: 'TN09 GH 3456',
      driver: 'Suresh',
      startLocation: 'Chennai',
      endLocation: 'Vellore',
      distance: 140,
      duration: '2h 50m',
      status: 'Completed',
    },{
      tripId: 'TRIP-004',
      vehicleNo: 'TN09 GH 3456',
      driver: 'Suresh',
      startLocation: 'Chennai',
      endLocation: 'Vellore',
      distance: 140,
      duration: '2h 50m',
      status: 'Completed',
    },
  ];

   pageSize = 5;
   index = 0;

  get paginatedTrips(): Trip[] {
    return this.trips.slice(this.index, this.index + this.pageSize);
  }

  next() {
    if (this.index + this.pageSize < this.trips.length) {
      this.index += this.pageSize;
    }
  }

  previous() {
    if (this.index > 0) {
      this.index -= this.pageSize;
    }
  }
}