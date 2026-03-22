import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

interface EvonMessage {
  role: 'user' | 'evon';
  text: string;
  createdAt: Date;
  isError?: boolean;
}

@Component({
  selector: 'app-evon-page',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './evon-page.html',
  styleUrls: ['./evon-page.css'],
})
export class EvonPage implements AfterViewInit {
  @ViewChild('messagesWrap')
  private messagesWrap?: ElementRef<HTMLDivElement>;

  userName = 'Admin';
  userRole = 'ADMIN';

  evonPrompt = '';
  isEvonLoading = false;
  chatMessages: EvonMessage[] = [
    {
      role: 'evon',
      text: 'Hello, I am Evon. Ask me database analytics questions and I will answer with live insights.',
      createdAt: new Date(),
    },
  ];

  readonly quickPrompts: string[] = [
    'How many active users are there?',
    'How many overdue bills are there?',
    'How many unresolved issues are there?',
    'How many active vehicles are there?',
    'What is the average battery health?',
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
  ) {
    this.loadUser();
  }

  ngAfterViewInit(): void {
    this.scrollMessagesToBottom();
  }

  private scrollMessagesToBottom() {
    requestAnimationFrame(() => {
      const container = this.messagesWrap?.nativeElement;
      if (!container) {
        return;
      }
      container.scrollTop = container.scrollHeight;
    });
  }

  loadUser() {
    this.apiService.getUserDetail().subscribe({
      next: (response) => {
        if (response?.success && response?.data) {
          this.userName = response.data.name || 'Admin';
          this.userRole = response.data.role || 'ADMIN';
        }
      },
      error: () => {
        this.userName = 'Admin';
      },
    });
  }

  askEvonWithPrompt(prompt: string) {
    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt || this.isEvonLoading) {
      return;
    }

    this.chatMessages.push({
      role: 'user',
      text: cleanedPrompt,
      createdAt: new Date(),
    });
    this.scrollMessagesToBottom();

    this.evonPrompt = '';
    this.isEvonLoading = true;

    this.apiService.askEvon(cleanedPrompt).subscribe({
      next: (response) => {
        const answer =
          response?.data?.answer ||
          'I could not generate a response for that query right now.';

        this.chatMessages.push({
          role: 'evon',
          text: answer,
          createdAt: new Date(),
        });
        this.isEvonLoading = false;
        this.scrollMessagesToBottom();
      },
      error: (error) => {
        const answer =
          error?.error?.message ||
          'I ran into an error while querying the database. Please try again.';

        this.chatMessages.push({
          role: 'evon',
          text: answer,
          createdAt: new Date(),
          isError: true,
        });
        this.isEvonLoading = false;
        this.scrollMessagesToBottom();
      },
    });

    this.scrollMessagesToBottom();
  }

  sendEvonPrompt() {
    this.askEvonWithPrompt(this.evonPrompt);
  }

  sendQuickPrompt(prompt: string) {
    this.askEvonWithPrompt(prompt);
  }

  logout() {
    this.loadingService.show('Logging out...');
    this.authService.logout().subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loadingService.hide();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
      },
    });
  }
}
