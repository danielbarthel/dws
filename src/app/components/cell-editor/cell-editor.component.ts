import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, DatePipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-cell-editor',
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, DatePipe],
  template: `
    <div class="cell-editor">
      <!-- Image field -->
      <ng-container *ngIf="isImageField()">
        <div class="image-preview flex items-center justify-center">
          <img
            [src]="getFullImageUrl(value)"
            [alt]="fieldName"
            class="h-full w-auto object-contain rounded"
            onerror="this.src='assets/placeholder.png'"
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
            <div class="cursor-pointer text-blue-500 hover:underline" (click)="openArrayEditor()">
              Array [{{ value?.length || 0 }} items]
            </div>
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

  isEditing = false;

  startEditing(): void {
    this.isEditing = true;
    setTimeout(() => {
      const inputElement = document.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  }

  saveString(event: any): void {
    const newValue = event.target.value;
    if (this.value !== newValue) {
      this.emitChange(newValue);
    }
    this.isEditing = false;
  }

  saveNumber(event: any): void {
    const newValue = parseFloat(event.target.value);
    if (this.value !== newValue) {
      this.emitChange(newValue);
    }
    this.isEditing = false;
  }

  updateBooleanValue(event: any): void {
    const newValue = event.target.checked;
    this.emitChange(newValue);
  }

  openArrayEditor(): void {
    console.log('Opening array editor for', this.fieldName);
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

  isImageField(): boolean {
    return this.fieldName === 'Bildpfad' || this.fieldName === 'image_path';
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/disco-416210.appspot.com/o/';
    const encodedPath = path.replace(/\//g, '%2F');
    return `${baseUrl}${encodedPath}?alt=media`;
  }

  private emitChange(newValue: any): void {
    this.valueChanged.emit({
      docId: this.docId,
      fieldName: this.fieldName,
      value: newValue
    });
  }
}
