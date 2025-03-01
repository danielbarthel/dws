import {Component, EventEmitter, Input, Output} from "@angular/core";
import {NgFor} from '@angular/common';

// src/app/components/array-dialog/array-dialog.component.ts
@Component({
  selector: 'app-array-dialog',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="fixed inset-0" (click)="close()">
      <div
        class="absolute bg-gray-800 rounded-lg p-4 shadow-xl max-w-md w-[300px] max-h-[400px] flex flex-col border border-gray-700"
        [style.top.px]="position.y"
        [style.left.px]="position.x"
        (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-semibold text-gray-200">{{ title }}</h3>
          <button
            class="text-gray-400 hover:text-gray-200"
            (click)="close()">
            ✕
          </button>
        </div>

        <div class="overflow-y-auto flex-1">
          <ul class="space-y-2">
            <li *ngFor="let item of items; let i = index"
                class="text-gray-300 p-2 bg-gray-700 rounded">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fixed {
      position: fixed;
      z-index: 1000;
    }
    .absolute {
      position: absolute;
      z-index: 1001;
    }
  `]
})
export class ArrayDialogComponent {
  @Input() title: string = '';
  @Input() items: any[] = [];
  @Input() position = { x: 0, y: 0 };
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}
