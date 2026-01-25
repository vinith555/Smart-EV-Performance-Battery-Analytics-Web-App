import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-generalhome',
  imports: [CommonModule],
  templateUrl: './generalhome.html',
  styleUrl: './generalhome.css',
})
export class Generalhome {

    vehicles:{img:string,name:string,des:string}[] = [
    {img:'/activa-e-right-side-view-9.avif',name:'MG ZS EV',des:'A stylish electric SUV with advanced technology.'},
    {img:'/windsor-ev-exterior-right-rear-three-quarter-3.avif',name:'Hyundai Kona Electric',des:'A versatile electric vehicle with great performance.'},  
  ];

}
