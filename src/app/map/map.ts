import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map {
  private map!: L.Map;
  private readonly fallbackLocation: L.LatLngTuple = [20.5937, 78.9629];

  ngAfterViewInit(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'marker-icon-2x.png',
      iconUrl: 'marker-icon.png',
      shadowUrl: 'marker-shadow.png',
    });
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView(this.fallbackLocation, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.setCurrentLocation();
  }

  private setCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.addMarker(
        this.fallbackLocation,
        'Geolocation is not supported. Showing default location.',
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation: L.LatLngTuple = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        this.map.setView(currentLocation, 15);
        this.addMarker(currentLocation, 'You are here!');
      },
      () => {
        this.addMarker(
          this.fallbackLocation,
          'Unable to access current location. Showing default location.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  private addMarker(location: L.LatLngTuple, message: string): void {
    L.marker(location).addTo(this.map).bindPopup(message).openPopup();
  }
}
