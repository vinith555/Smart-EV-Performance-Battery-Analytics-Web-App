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

@Component({
  selector: 'app-userdashboard',
  imports: [NgApexchartsModule],
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
}