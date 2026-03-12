import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../services/loading.service';

interface Article {
  article_id: number;
  title: string;
  answer: string;
  category: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-helpsupport',
  imports: [CommonModule, FormsModule],
  templateUrl: './helpsupport.html',
  styleUrl: './helpsupport.css',
})
export class Helpsupport implements OnInit {
  searchText = '';
  articles: Article[] = [];
  showSupportForm = false;

  constructor(private loadingService: LoadingService) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.loadingService.show('Loading articles...');
    // Simulate loading delay (remove or adjust based on actual API calls)
    setTimeout(() => {
      // Load articles from CSV file
      const csvData = `article_id,title,answer,category
1,How to monitor EV battery health?,"Monitor your EV battery health through the Battery Dashboard. Check the battery percentage, health indicator (0-100%), and temperature readings updated in real-time. Set alerts for low battery levels and receive notifications when battery health drops below 80%. Visit the Vehicle Dashboard > Battery Stats to view detailed analytics and historical trends.",Battery
2,Managing charging stations,"Access the Charging Stations map from your dashboard. View nearby charging points, their availability, and charging speeds. You can reserve a station for up to 30 minutes. The system shows real-time availability and estimated charging time based on your vehicle's current battery level.",Charging
3,Understanding alerts & notifications,"Alerts are prioritized messages (Low, Medium, High) about your vehicle's status. Enable notifications in Settings > Preferences. Critical alerts will be highlighted in red. Check your notification center anytime - unread alerts show a badge count. Mark alerts as read or snooze them for later.",Alerts
4,How to reset user password?,"Click 'Forgot Password' on the login page. Enter your registered email address. You'll receive a password reset link valid for 24 hours. Click the link and create a new password (minimum 8 characters with uppercase, lowercase, and numbers). If you don't receive the email, check your spam folder or contact support.",Account
5,Trouble uploading vehicle logs,"Ensure your vehicle is connected to the app via Bluetooth or WiFi. Check your internet connection - logs require stable connectivity. Try uploading during off-peak hours. Maximum file size is 100MB. If issues persist, clear app cache (Settings > Storage > Clear Cache) and retry. Contact support if problem continues.",Vehicle
6,Download EV performance reports,"Go to Reports section from your dashboard. Select the date range and metrics (efficiency, distance, battery usage, etc.). Choose PDF or Excel format. Reports are generated within 2 minutes and automatically downloaded. You can also schedule weekly/monthly reports to your email.",Reports
7,System not updating live data,"Live data updates every 30 seconds when vehicle is connected. Check that your vehicle's IoT module is powered on and connected to WiFi. Toggle app connection off and on from Settings > Devices. Restart the app if data isn't updating. Ensure your subscription is active.",Technical
8,Managing user roles & access,"Only Admins can manage user roles. Go to Admin Panel > User Management. Select a user and change their role (Admin, Personal User, Service User). Different roles have different dashboard access. Changes take effect immediately after the user logs out and back in.",Admin
9,Payment & subscription issues,"Visit Settings > Billing to view your subscription. Failed payments show with a retry option. Update payment method in Billing Settings. Monthly plans auto-renew on your billing date. Contact support for refund requests within 30 days of purchase.",Billing
10,Connecting IoT device to dashboard,"Go to Settings > Connected Devices > Add Device. Select your vehicle model. Scan the QR code on your vehicle's IoT module or enter the device code manually. Your device will pair within 2 minutes. Once connected, live data will start syncing automatically.",IoT
11,Firmware update process,"The system auto-checks for updates weekly. When available, you'll see an 'Update Available' notification. Click to download (requires WiFi). Updates install automatically when vehicle is parked and plugged in. Don't turn off vehicle during update. Updates typically take 10-15 minutes.",Updates
12,Troubleshooting battery overheating,"High battery temperature indicates overheating - stop charging immediately and let it cool for 30 minutes. Park in shade if possible. Check Settings > Vehicle > Temperature to view current temp. If temp exceeds 65°C, a high-priority alert will be triggered. Contact service team if problem persists.",Safety`;

      this.articles = this.parseCSV(csvData);
      this.loadingService.hide();
    }, 1000); // 1 second delay to simulate loading
  }

  parseCSV(csv: string): Article[] {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const articles: Article[] = [];

    for (let i = 1; i < lines.length; i++) {
      const obj: any = {};
      const currentLine = lines[i];

      // Parse CSV considering quoted fields
      const regex = /("([^"]*)"|[^,]+)/g;
      const matches = currentLine.match(regex) || [];

      headers.forEach((header, index) => {
        let value = matches[index] || '';
        // Remove quotes if present
        value = value.replace(/^"|"$/g, '');
        obj[header.trim()] = value.trim();
      });

      articles.push({
        article_id: parseInt(obj.article_id),
        title: obj.title,
        answer: obj.answer,
        category: obj.category,
        expanded: false,
      });
    }

    return articles;
  }

  get searcharticle() {
    if (!this.searchText.trim()) {
      return this.articles;
    }

    return this.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        article.answer.toLowerCase().includes(this.searchText.toLowerCase()),
    );
  }

  toggleArticle(article: Article) {
    article.expanded = !article.expanded;
  }

  openSupportForm() {
    this.showSupportForm = true;
  }

  submitSupport(form: any) {
    if (form.valid) {
      this.showSupportForm = false;
      form.reset();
    }
  }
}
