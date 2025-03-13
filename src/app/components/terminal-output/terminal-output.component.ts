import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { ScrapeService } from '../../services/scrape.service';

@Component({
  selector: 'app-terminal-output',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="terminal-container bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
      <div *ngFor="let line of terminalOutput" class="terminal-line">
        <span class="text-gray-500">$</span> {{ line }}
      </div>
    </div>
  `,
  styles: [`
    .terminal-container {
      font-family: 'Courier New', Courier, monospace;
    }
    .terminal-line {
      white-space: pre-wrap;
      word-break: break-all;
      line-height: 1.4;
    }
  `]
})
export class TerminalOutputComponent implements OnInit {
  terminalOutput: string[] = [];

  constructor(private scrapeService: ScrapeService) {}

  ngOnInit() {
    this.subscribeToTerminalOutput();
  }

  private subscribeToTerminalOutput() {
    this.scrapeService.getTerminalOutput().subscribe({
      next: (output) => {
        this.terminalOutput.push(output);
      },
      error: (error) => {
        console.error('Terminal output error:', error);
      }
    });
  }
}
