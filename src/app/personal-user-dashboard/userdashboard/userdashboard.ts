import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
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
  tripId: string;   //need to add the end date
  date: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: string; 
  avgSpeed: number;
  fuel:number;
  cost:number;
  status: 'Completed' | 'Ongoing' | 'Cancelled';
  notes:string;
}

@Component({
  selector: 'app-userdashboard',
  imports: [NgApexchartsModule,CommonModule,FormsModule],
  templateUrl: './userdashboard.html',
  styleUrl: './userdashboard.css',
})
export class Userdashboard {
  evModel:string = 'Tesla Model S';
  yearModel:number = 2022;
  vehicleImage:string = '10815869.png';
  filter:boolean = false;
  tripForm:boolean = false;
  actionForm:boolean = false;
  viewBox:boolean = false;
  pageSize = 5;
  index = 0;
  indexAc:number = -1;
  indexView:number = -1;
  statistics!: Partial<ChartOptions>;

  constructor() {
    this.statistics = this.statisticsChangeFunction([10,30,42,12,50]);
  }
  statisticsChangeFunction(data:number[]):Partial<ChartOptions> {
      return { 
      series: [
        {
          name: "Energy Consumed (kwh)",
          data: data
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
    tripId: "TRIP001",
    date: "2026-01-05",
    startLocation: "Chennai",
    endLocation: "Bangalore",
    distance: 346,
    duration: "6h 30m",
    avgSpeed: 53,
    fuel: 24,
    cost: 2800,
    status: "Completed",
    notes: "Smooth highway drive"
  },
  {
    tripId: "TRIP002",
    date: "2026-01-10",
    startLocation: "Coimbatore",
    endLocation: "Ooty",
    distance: 85,
    duration: "3h 15m",
    avgSpeed: 26,
    fuel: 8,
    cost: 1200,
    status: "Completed",
    notes: "Hilly road with heavy traffic"
  },
  {
    tripId: "TRIP003",
    date: "2026-01-15",
    startLocation: "Madurai",
    endLocation: "Rameswaram",
    distance: 170,
    duration: "4h",
    avgSpeed: 42,
    fuel: 12,
    cost: 1500,
    status: "Completed",
    notes: "Pleasant coastal drive"
  },
  {
    tripId: "TRIP004",
    date: "2026-02-01",
    startLocation: "Salem",
    endLocation: "Trichy",
    distance: 140,
    duration: "3h",
    avgSpeed: 46,
    fuel: 10,
    cost: 1100,
    status: "Ongoing",
    notes: "Minor traffic near city limits"
  },
  {
    tripId: "TRIP005",
    date: "2026-02-03",
    startLocation: "Erode",
    endLocation: "Chennai",
    distance: 400,
    duration: "7h 20m",
    avgSpeed: 55,
    fuel: 28,
    cost: 3200,
    status: "Cancelled",
    notes: "Cancelled due to vehicle issue"
  },
  {
    tripId: "TRIP006",
    date: "2026-02-04",
    startLocation: "Tirunelveli",
    endLocation: "Kanyakumari",
    distance: 90,
    duration: "2h 10m",
    avgSpeed: 41,
    fuel: 7,
    cost: 900,
    status: "Completed",
    notes: "Short and scenic trip"
  }
  ];

  

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
  tripData(f:NgForm){
    console.log(f.value);
  }
  
  tripAction(index:number){
    this.indexAc = index;
    this.actionForm = !this.actionForm;
  }
  tripUpdatedData(f:NgForm){
    console.log(f.value);
  }
  view(index:number){
    this.viewBox = true
    this.indexView = index;
  }

}