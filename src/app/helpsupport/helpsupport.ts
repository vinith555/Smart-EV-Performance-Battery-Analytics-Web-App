import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-helpsupport',
  imports: [CommonModule,FormsModule],
  templateUrl: './helpsupport.html',
  styleUrl: './helpsupport.css',
})
export class Helpsupport {
  searchText = '';

  articles = [
    { title: 'How to monitor EV battery health?' },
    { title: 'Managing charging stations' },
    { title: 'Understanding alerts & notifications' },
    { title: 'How to reset user password?' },
    { title: 'Trouble uploading vehicle logs' },
    { title: 'Download EV performance reports' },
    { title: 'System not updating live data' },
    { title: 'Managing user roles & access' },
    { title: 'Payment & subscription issues' },
    { title: 'Connecting IoT device to dashboard' },
    { title: 'Firmware update process' },
    { title: 'Troubleshooting battery overheating' }
  ];

  get searcharticle(){
    if (!this.searchText.trim()) {
        return this.articles;
      }

    return this.articles.filter(article =>
      article.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  showSupportForm = false;

openSupportForm() {
  this.showSupportForm = true;
}

submitSupport(form: any) {
  if (form.valid) {
    console.log("Support Ticket Submitted:", form.value);
    this.showSupportForm = false;
    form.reset();
  }
}
}
