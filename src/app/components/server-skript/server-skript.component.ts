import { Component } from '@angular/core';
import { ScrapeService } from '../../services/scrape.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-server-skript',
  standalone: true,
  template: `
    <button
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
      [class.opacity-50]="isLoading"
      [disabled]="isLoading"
      (click)="startScraping()">
      <span *ngIf="!isLoading">Start Scraping</span>
      <span *ngIf="isLoading">
        Scraping... <span class="animate-pulse">•••</span>
      </span>
    </button>
  `,
  imports: [NgIf]
})
export class ServerScriptComponent {
  isLoading = false;

  constructor(private scrapeService: ScrapeService) {}

  startScraping() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.scrapeService.startScraping().subscribe({
      next: (response) => {
        console.log('Scraping started:', response);
      },
      error: (error) => {
        console.error('Error:', error);
        if (error.status === 422) {
          console.error('Server error:', error.error?.message || 'Invalid request format');
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
