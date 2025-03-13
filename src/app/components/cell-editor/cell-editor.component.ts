import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, DatePipe, JsonPipe } from '@angular/common';
import {ArrayDialogComponent} from '../array-dialog/array-dialog.component';

@Component({
  selector: 'app-cell-editor',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, DatePipe, ArrayDialogComponent],
  template: `
    <div class="cell-editor">
      <!-- Image field -->
      <ng-container *ngIf="isImageField()">
        <div class="image-preview flex items-center justify-center">
          <img
            [src]="getFullImageUrl(value)"
            [alt]="fieldName"
            class="h-full w-auto object-contain rounded"
          >
        </div>
      </ng-container>

      <!-- All other fields -->
      <ng-container *ngIf="!isImageField()">
        <div [ngSwitch]="type">
          <!-- Boolean field -->
          <ng-container *ngSwitchCase="'boolean'">
            <input
              type="checkbox"
              [checked]="value"
              (change)="updateBooleanValue($event)">
          </ng-container>

          <!-- String field -->
          <ng-container *ngSwitchCase="'string'">
            <div class="relative">
              <div
                class="cursor-pointer w-full truncate max-w-xs"
                (click)="startEditing()"
                *ngIf="!isEditing">
                {{ value }}
              </div>
              <input
                *ngIf="isEditing"
                type="text"
                class="w-full border p-1 rounded"
                [value]="value"
                (blur)="saveString($event)"
                (keyup.enter)="saveString($event)"
                #inputField>
            </div>
          </ng-container>

          <!-- Number field -->
          <ng-container *ngSwitchCase="'number'">
            <div class="relative">
              <div
                class="cursor-pointer"
                (click)="startEditing()"
                *ngIf="!isEditing">
                {{ value }}
              </div>
              <input
                *ngIf="isEditing"
                type="number"
                class="w-full border p-1 rounded"
                [value]="value"
                (blur)="saveNumber($event)"
                (keyup.enter)="saveNumber($event)"
                #inputField>
            </div>
          </ng-container>

          <!-- Timestamp field -->
          <ng-container *ngSwitchCase="'timestamp'">
            <div class="text-gray-600">
              {{ value?.toDate() | date:'medium' }}
            </div>
          </ng-container>

          <!-- Array field -->
          <ng-container *ngSwitchCase="'array'">
            <div class="cursor-pointer text-blue-500 hover:text-blue-400"
                 (click)="toggleArrayDialog($event)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <app-array-dialog
              *ngIf="showArrayDialog"
              [title]="fieldName"
              [items]="value || []"
              [position]="dialogPosition"
              (closed)="toggleArrayDialog()">
            </app-array-dialog>
          </ng-container>

          <!-- Map field -->
          <ng-container *ngSwitchCase="'map'">
            <div class="cursor-pointer text-blue-500 hover:underline" (click)="openMapEditor()">
              Object {{ '{...}' }}
            </div>
          </ng-container>

          <!-- Default display -->
          <ng-container *ngSwitchDefault>
            <div class="truncate max-w-xs">{{ displayValue() }}</div>
          </ng-container>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .cell-editor {
      min-height: 24px;
    }
    .image-preview {
      height: 80px;
      width: 80px;
    }
    .image-preview img {
      max-width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `]
})
export class CellEditorComponent {
  @Input() value: any;
  @Input() type: string = '';
  @Input() docId: string = '';
  @Input() fieldName: string = '';
  @Input() collectionName: string = '';

  @Output() valueChanged = new EventEmitter<{docId: string, fieldName: string, value: any}>();

  showArrayDialog = false;
  isEditing = false;
  dialogPosition = { x: 0, y: 0 };

  startEditing(): void {
    this.isEditing = true;
    setTimeout(() => {
      const inputElement = document.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  }

  // In CellEditorComponent
  updateBooleanValue(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.emitChange(value);
  }

  saveString(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.emitChange(value);
    this.isEditing = false;
  }

  saveNumber(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(value)) {
      this.emitChange(value);
    }
    this.isEditing = false;
  }

  private emitChange(newValue: any): void {
    if (!this.docId) {
      console.error('No document ID available for update');
      return;
    }

    this.valueChanged.emit({
      docId: this.docId,
      fieldName: this.fieldName,
      value: newValue
    });
  }

  openMapEditor(): void {
    console.log('Opening map editor for', this.fieldName);
  }

  displayValue(): string {
    if (this.value === null || this.value === undefined) {
      return '';
    }
    if (typeof this.value === 'object') {
      return JSON.stringify(this.value).substring(0, 30) + '...';
    }
    return String(this.value);
  }

  // In CellEditorComponent
  isImageField(): boolean {
    // Anpassung der Feldnamen auf Kleinbuchstaben
    return this.fieldName.toLowerCase() === 'bildpfad' ||
      this.fieldName.toLowerCase() === 'image_path';
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    // Remove leading /images/ if present
    const cleanPath = path.replace(/^\/images\//, '');
    return `http://192.168.1.111:8000/images/${cleanPath}`;
  }

  toggleArrayDialog(event?: MouseEvent): void {
    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.dialogPosition = {
        x: rect.left,
        y: rect.bottom + 5
      };
    }
    this.showArrayDialog = !this.showArrayDialog;
  }
}
