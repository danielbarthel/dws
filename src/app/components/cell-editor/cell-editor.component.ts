// src/app/components/cell-editor/cell-editor.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf, DatePipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-cell-editor',
  standalone: true,
  imports: [NgSwitch, NgIf, DatePipe],
  template: `
    <div [ngSwitch]="type" class="cell-editor">
      <!-- Boolean field -->
      @case ('boolean') {
        <input
          type="checkbox"
          [checked]="value"
          (change)="updateBooleanValue($event)">
      }

      <!-- String field -->
      @case ('string') {
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
      }

      <!-- Number field -->
      @case ('number') {
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
      }

      <!-- Timestamp field -->
      @case ('timestamp') {
        <div class="text-gray-600">
          {{ value?.toDate() | date:'medium' }}
        </div>
      }

      <!-- Array field -->
      @case ('array') {
        <div class="cursor-pointer text-blue-500 hover:underline" (click)="openArrayEditor()">
          Array [{{ value?.length || 0 }} items]
        </div>
      }

      <!-- Map field -->
      @case ('map') {
        <div class="cursor-pointer text-blue-500 hover:underline" (click)="openMapEditor()">
          Object {...}
        </div>
      }

      <!-- Default display -->
      @default {
        <div class="truncate max-w-xs">{{ displayValue() }}</div>
      }
    </div>
  `,
  styles: [`
    .cell-editor {
      min-height: 24px;
    }
  `]
})
export class CellEditorComponent {
  @Input() value: any;
  @Input() type: string;
  @Input() docId: string;
  @Input() fieldName: string;
  @Input() collectionName: string;

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
    // In einer echten App würde hier ein Modal oder ein Popup-Editor für Array-Elemente geöffnet werden
    console.log('Opening array editor for', this.fieldName);
  }

  openMapEditor(): void {
    // In einer echten App würde hier ein Modal oder ein Popup-Editor für Objekt-Eigenschaften geöffnet werden
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

  private emitChange(newValue: any): void {
    this.valueChanged.emit({
      docId: this.docId,
      fieldName: this.fieldName,
      value: newValue
    });
  }
}
