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
    this.map = L.map('map').setView([20.5937, 78.9629], 5); // Example: India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker example
    L.marker([20.5937, 78.9629])
      .addTo(this.map)
      .bindPopup('Your Vehicle is Here!')
      .openPopup();
  }
}
