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
  allVehicles: any[] = []; // Store all vehicles
  selectedVehicleId: any = null; // Track selected vehicle

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
  isSwitchingVehicle: boolean = false;
  error: string = '';

  constructor(private apiService: ApiService) {
    this.statistics = this.statisticsChangeFunction([10, 30, 42, 12, 50]);
  }

  ngOnInit(): void {
    // Load vehicle ID from localStorage first if available
    this.loadVehicleIdFromStorage();
    this.loadVehicleDetails();
  }

  private loadVehicleIdFromStorage(): void {
    const storedVehicleId = localStorage.getItem('selectedVehicleId');
    if (storedVehicleId) {
      this.selectedVehicleId = Number(storedVehicleId);
    }
  }

  private saveVehicleIdToStorage(vehicleId: any): void {
    localStorage.setItem('selectedVehicleId', String(vehicleId));
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
    this.apiService.getTripDetails(this.selectedVehicleId).subscribe({
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
        this.isSwitchingVehicle = false;
      },
      error: (error) => {
        console.error('Error fetching trip details:', error);
        this.isSwitchingVehicle = false;
      },
    });
  }

  loadVehicleDetails(): void {
    this.isLoading = true;
    this.apiService.getVehicleDetails().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Store all vehicles
          if (response.data.vehicle && response.data.vehicle.length > 0) {
            this.allVehicles = response.data.vehicle;

            // Set first vehicle as default if none selected
            if (!this.selectedVehicleId) {
              this.selectedVehicleId = this.allVehicles[0].vehicle_id;
              this.saveVehicleIdToStorage(this.selectedVehicleId);
            }

            // Load the selected vehicle data
            this.loadSelectedVehicleData(response.data);

            // Now load trip details for the selected vehicle
            this.loadTripDetails();
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

  loadSelectedVehicleData(data: any): void {
    // Find selected vehicle from allVehicles
    this.vehicleData = this.allVehicles.find(
      (v) => v.vehicle_id === this.selectedVehicleId,
    );

    if (this.vehicleData) {
      this.evModel = this.vehicleData.vehicle_model || 'N/A';
      this.registrationNumber = this.vehicleData.registration_number || 'N/A';
      this.vehicleColour = this.vehicleData.vehicle_colour || 'N/A';
      this.vehicleImage = this.getVehicleImageById(this.vehicleData.vehicle_id);

      // Extract year from created_at
      if (this.vehicleData.created_at) {
        const date = new Date(this.vehicleData.created_at);
        this.yearModel = date.getFullYear().toString();
      }
    }

    // Get vehicle stats for selected vehicle
    if (data.vehicle_stats && data.vehicle_stats.length > 0) {
      this.vehicleStats =
        data.vehicle_stats.find(
          (vs: any) => vs.vehicle_id === this.selectedVehicleId,
        ) || data.vehicle_stats[0];

      this.batteryHealth = this.vehicleStats.battery_health || 0;
      this.temperature = this.vehicleStats.temperature || 0;
      this.batteryCapacity = this.vehicleStats.battery_capacity || 0;
      this.estimatedRange = this.vehicleStats.estimated_range || 0;
      this.isCharging = this.vehicleStats.is_charging || false;
      this.kwh = this.vehicleStats.total || 0;
      this.chargingTime = this.vehicleStats.charging_time || 'N/A';
    }
  }

  onVehicleChange(vehicleId: any): void {
    // Convert to number if it's a string
    const vehicleIdNum =
      typeof vehicleId === 'string' ? Number(vehicleId) : vehicleId;

    this.selectedVehicleId = vehicleIdNum;
    this.saveVehicleIdToStorage(vehicleIdNum);
    this.isSwitchingVehicle = true;

    // Immediately update display data from existing allVehicles array
    if (this.allVehicles && this.allVehicles.length > 0) {
      const selectedVehicle = this.allVehicles.find(
        (v) => v.vehicle_id === vehicleIdNum,
      );

      if (selectedVehicle) {
        this.evModel = selectedVehicle.vehicle_model || 'N/A';
        this.registrationNumber = selectedVehicle.registration_number || 'N/A';
        this.vehicleColour = selectedVehicle.vehicle_colour || 'N/A';
        this.vehicleImage = this.getVehicleImageById(
          selectedVehicle.vehicle_id,
        );

        if (selectedVehicle.created_at) {
          const date = new Date(selectedVehicle.created_at);
          this.yearModel = date.getFullYear().toString();
        }
      }
    }

    // Reload trip details for the selected vehicle
    this.loadTripDetails();
  }

  retryLoadVehicleDetails(): void {
    this.loadVehicleDetails();
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
