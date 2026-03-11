import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { Map } from '../../map/map';
import { ApiService } from '../../services/api.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
};

interface Trip {
  tripId: string; //need to add the end date
  date: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: string;
  avgSpeed: number;
  fuel: number;
  cost: number;
  status: string;
  notes: string;
}

@Component({
  selector: 'app-userdashboard',
  imports: [NgApexchartsModule, CommonModule, FormsModule, Map],
  templateUrl: './userdashboard.html',
  styleUrl: './userdashboard.css',
})
export class Userdashboard implements OnInit {
  // Vehicle data from API
  vehicleData: any = null;
  vehicleStats: any = null;

  // Display properties
  evModel: string = 'Loading...';
  yearModel: string = '';
  registrationNumber: string = '';
  vehicleColour: string = '';
  batteryCapacity: number = 0;
  estimatedRange: number = 0;
  chargingTime: string = '';

  // Battery stats
  batteryPercentage: number = 0;
  batteryHealth: number = 0;
  temperature: number = 0;
  isCharging: boolean = false;
  kwh: number = 0;

  vehicleImage: string = '1.png';
  filter: boolean = false;
  pageSize = 5;
  index = 0;
  statistics!: Partial<ChartOptions>;
  isLoading: boolean = true;
  error: string = '';

  constructor(private apiService: ApiService) {
    this.statistics = this.statisticsChangeFunction([10, 30, 42, 12, 50]);
  }

  ngOnInit(): void {
    this.loadVehicleDetails();
    this.loadTripDetails();
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getVehicleImageById(
    vehicleId: number | string | null | undefined,
  ): string {
    const numericId = Number(vehicleId);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return '1.png';
    }

    const imageIndex = ((numericId - 1) % 5) + 1;
    return `${imageIndex}.png`;
  }

  loadTripDetails(): void {
    this.apiService.getTripDetails().subscribe({
      next: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          this.trips = response.data.map((trip: any) => ({
            tripId: String(trip.trip_id ?? ''),
            date: this.formatDate(trip.start_date),
            endDate: this.formatDate(trip.end_date),
            startLocation: trip.start_location ?? '',
            endLocation: trip.end_location ?? '',
            distance: Number(trip.distance ?? 0),
            duration: String(trip.duration ?? ''),
            avgSpeed: Number(trip.average_speed ?? 0),
            fuel: Number(trip.battery_used ?? 0),
            cost: Number(trip.cost ?? 0),
            status:
              String(trip.status ?? '').toUpperCase() === 'COMPLETED'
                ? 'Completed'
                : String(trip.status ?? '').toUpperCase() === 'ONGOING'
                  ? 'Ongoing'
                  : String(trip.status ?? '').toUpperCase() === 'CANCELLED'
                    ? 'Cancelled'
                    : String(trip.status ?? ''),
            notes: trip.notes ?? '',
          }));
          this.index = 0;
        }
      },
      error: (error) => {
        console.error('Error fetching trip details:', error);
      },
    });
  }

  loadVehicleDetails(): void {
    this.isLoading = true;
    this.apiService.getVehicleDetails().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Get first vehicle and its stats
          if (response.data.vehicle && response.data.vehicle.length > 0) {
            this.vehicleData = response.data.vehicle[0];
            this.evModel = this.vehicleData.vehicle_model || 'N/A';
            this.registrationNumber =
              this.vehicleData.registration_number || 'N/A';
            this.vehicleColour = this.vehicleData.vehicle_colour || 'N/A';
            this.vehicleImage = this.getVehicleImageById(
              this.vehicleData.vehicle_id,
            );

            // Extract year from created_at
            if (this.vehicleData.created_at) {
              const date = new Date(this.vehicleData.created_at);
              this.yearModel = date.getFullYear().toString();
            }
          }

          // Get vehicle stats
          if (
            response.data.vehicle_stats &&
            response.data.vehicle_stats.length > 0
          ) {
            this.vehicleStats = response.data.vehicle_stats[0];
            this.batteryPercentage = this.vehicleStats.battery_percentage || 0;
            this.batteryHealth = this.vehicleStats.battery_health || 0;
            this.temperature = this.vehicleStats.temperature || 0;
            this.batteryCapacity = this.vehicleStats.battery_capacity || 0;
            this.estimatedRange = this.vehicleStats.estimated_range || 0;
            this.isCharging = this.vehicleStats.is_charging || false;
            this.kwh = this.vehicleStats.total || 0;
            this.chargingTime = this.vehicleStats.charging_time || 'N/A';
          }

          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching vehicle details:', error);
        this.error = 'Failed to load vehicle details';
        this.isLoading = false;
      },
    });
  }
  statisticsChangeFunction(data: number[]): Partial<ChartOptions> {
    return {
      series: [
        {
          name: 'Energy Consumed (kwh)',
          data: data,
        },
      ],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false,
        },
      },
      stroke: {
        curve: 'smooth',
      },
      dataLabels: {
        enabled: false,
      },
      title: {
        text: 'Battery Usage',
        align: 'left',
      },
      xaxis: {
        categories: ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM'],
      },
    };
  }
  trips: Trip[] = [];

  filterValues = {
    tripId: '',
    date: '',
    endDate: '',
    startLocation: '',
    endLocation: '',
    distance: '',
    duration: '',
    avgSpeed: '',
    status: '',
  };

  get filteredTrips(): Trip[] {
    return this.trips.filter((trip) => {
      const matchesTripId =
        !this.filterValues.tripId ||
        trip.tripId
          .toString()
          .toLocaleLowerCase()
          .includes(this.filterValues.tripId.toLocaleLowerCase());

      const matchesDate =
        !this.filterValues.date ||
        new Date(trip.date).toDateString() ===
          new Date(this.filterValues.date).toDateString();

      const matchesEndDate =
        !this.filterValues.endDate ||
        new Date(trip.endDate).toDateString() ===
          new Date(this.filterValues.endDate).toDateString();

      const matchesStartLocation =
        !this.filterValues.startLocation ||
        trip.startLocation
          .toLowerCase()
          .includes(this.filterValues.startLocation.toLowerCase());

      const matchesEndLocation =
        !this.filterValues.endLocation ||
        trip.endLocation
          .toLowerCase()
          .includes(this.filterValues.endLocation.toLowerCase());

      const matchesDistance =
        !this.filterValues.distance ||
        trip.distance.toString().includes(this.filterValues.distance);

      const matchesDuration =
        !this.filterValues.duration ||
        trip.duration.toString().includes(this.filterValues.duration);

      const matchesAvgSpeed =
        !this.filterValues.avgSpeed ||
        trip.avgSpeed.toString().includes(this.filterValues.avgSpeed);

      const matchesStatus =
        !this.filterValues.status ||
        trip.status
          .toLowerCase()
          .includes(this.filterValues.status.toLowerCase());

      return (
        matchesTripId &&
        matchesDate &&
        matchesEndDate &&
        matchesStartLocation &&
        matchesEndLocation &&
        matchesDistance &&
        matchesDuration &&
        matchesAvgSpeed &&
        matchesStatus
      );
    });
  }

  clearFilters() {
    this.filterValues = {
      tripId: '',
      date: '',
      endDate: '',
      startLocation: '',
      endLocation: '',
      distance: '',
      duration: '',
      avgSpeed: '',
      status: '',
    };
  }

  get paginatedTrips(): Trip[] {
    return this.filteredTrips.slice(this.index, this.index + this.pageSize);
  }

  next() {
    if (this.index + this.pageSize < this.filteredTrips.length) {
      this.index += this.pageSize;
    }
  }

  previous() {
    if (this.index > 0) {
      this.index -= this.pageSize;
    }
  }

  onFilterChange() {
    this.index = 0;
  }
}
