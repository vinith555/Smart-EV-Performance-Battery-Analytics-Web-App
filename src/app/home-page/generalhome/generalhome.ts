import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-generalhome',
  imports: [CommonModule],
  templateUrl: './generalhome.html',
  styleUrl: './generalhome.css',
})
export class Generalhome {
   
  constructor(private route:Router){}

    vehicles:{img:string,name:string,des:string}[] = [
    {img:'',name:'User Dashboards',des:'A stylish electric vehicle UI Dashboard.'},
    {img:'',name:'Task Management',des:'A versatile easy task management system.'},  
  ];

  navigate(){
    this.route.navigate(['about'])
  }
}
