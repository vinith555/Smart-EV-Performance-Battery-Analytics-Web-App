import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profilepage',
  imports: [CommonModule,FormsModule],
  templateUrl: './profilepage.html',
  styleUrl: './profilepage.css',
})
export class Profilepage {

  editProfileForm = false;

  constructor(private route:Router){}
  user = {
    name: 'Saranya Prasad',
    role: 'Admin',
    email: 'saranya.prasad@example.com',
    phone: '+91 9876543210',
    username: 'saranya.prasad',
    created: '01 Oct, 2023',
    lastLogin: '24 Apr, 2024',
    status: 'Active',
    bio: `I'm overseeing the EV monitoring system and user management at EcoCharge.`,
    linkedin: '',
    twitter: '',
    facebook: ''
  };

  notification:{msg:string,severity:"High"|"Medium"|"Low"}[] = [
      { msg: "Battery temperature exceeded safe limit at Station 3", severity: "High" },
  { msg: "Charging session interrupted due to voltage fluctuation", severity: "High" },
  { msg: "New firmware update available for Battery Pack A12", severity: "Medium" },
  { msg: "Charging station 5 is under maintenance", severity: "Medium" },
  { msg: "Vehicle BMS communication delay detected", severity: "Medium" },
  { msg: "Low battery health detected in Vehicle TN-09-EV-4582", severity: "High" },
  { msg: "Scheduled system diagnostic completed successfully", severity: "Low" },
  { msg: "New user registered in the EV monitoring system", severity: "Low" },
  { msg: "Charging efficiency dropped below 85% at Station 2", severity: "Medium" },
  { msg: "Backup power supply activated during grid outage", severity: "High" }
  ];

  changePassword(){
    this.route.navigate(['login']);
  }
  logOut(){
    this.route.navigate(['']);
  }

  

    updateProfile(form: any) {
      if (form.valid) {
        console.log("Updated User:", this.user);
        this.editProfileForm = false;
      }
}
}
