import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isLoading$ | async as isLoading"
      [hidden]="!isLoading"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fade-in"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-slide-up"
      >
        <!-- Spinner -->
        <div class="relative w-16 h-16">
          <div
            class="absolute inset-0 border-4 border-gray-200 border-t-[#00712D] rounded-full animate-spin"
          ></div>
        </div>

        <!-- Loading Text -->
        <p class="text-lg font-semibold text-gray-700">
          {{ loadingMessage$ | async }}
        </p>

        <!-- Progress Dot Animation -->
        <div class="flex gap-2">
          <span
            class="w-2 h-2 bg-[#00712D] rounded-full animate-bounce"
            [style.animation-delay]="'0s'"
          ></span>
          <span
            class="w-2 h-2 bg-[#00712D] rounded-full animate-bounce"
            [style.animation-delay]="'0.1s'"
          ></span>
          <span
            class="w-2 h-2 bg-[#00712D] rounded-full animate-bounce"
            [style.animation-delay]="'0.2s'"
          ></span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-8px);
        }
      }

      .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }

      .animate-slide-up {
        animation: slideUp 0.4s ease-out;
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      .animate-bounce {
        animation: bounce 1.4s ease-in-out infinite;
      }
    `,
  ],
})
export class GlobalLoaderComponent implements OnInit {
  isLoading$;
  loadingMessage$;

  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.isLoading();
    this.loadingMessage$ = this.loadingService.getMessage();
  }

  ngOnInit(): void {}
}
