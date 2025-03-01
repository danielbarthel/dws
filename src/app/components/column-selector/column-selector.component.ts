import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { Column } from '../../models/collection.model';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [AsyncPipe, NgFor, DragDropModule],
  template: `
    <div class="column-selector bg-gray-800 p-4 rounded shadow-md">
      <h3 class="text-lg font-semibold mb-2 text-gray-200">Column Visibility</h3>

      <div class="columns-container max-h-[300px] overflow-y-auto" cdkDropList (cdkDropListDropped)="drop($event)">
        <div *ngFor="let column of columns$ | async; trackBy: trackByColumnName"
             class="column-item my-1 flex items-center p-2 bg-gray-700 rounded cursor-move"
             cdkDrag>
          <div class="flex items-center w-full">
            <span class="drag-handle mr-2 text-gray-400">⋮⋮</span>
            <input
              type="checkbox"
              [id]="'col-' + column.name"
              class="mr-2"
              [checked]="column.visible"
              (change)="toggleColumn(column.name)">
            <label [for]="'col-' + column.name" class="cursor-pointer text-gray-300 truncate">
              {{ column.name }}
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .column-item {
      transition: background-color 0.2s;
    }
    .column-item:hover {
      background-color: #374151;
    }
    .drag-handle {
      cursor: move;
    }
    .cdk-drag-preview {
      background-color: #374151;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .cdk-drag-placeholder {
      opacity: 0.5;
    }
    .cdk-drag-animating {
      transition: transform 250ms;
    }
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #1f2937;
    }
    ::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  `]
})
export class ColumnSelectorComponent implements OnInit {
  columns$!: Observable<Column[]>;
  activeCollectionName$!: Observable<string>;

  constructor(private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.activeCollectionName$ = this.dataManager.getActiveCollectionName();

    // Benutze switchMap um auf Änderungen des aktiven Collections zu reagieren
    this.columns$ = this.activeCollectionName$.pipe(
      switchMap(() => this.dataManager.getActiveCollection()),
      map(collection => collection.columns.sort((a, b) => (a.order || 0) - (b.order || 0)))
    );
  }

  toggleColumn(columnName: string): void {
    this.activeCollectionName$.pipe(take(1)).subscribe(collectionName => {
      this.dataManager.toggleColumnVisibility(collectionName, columnName);
    });
  }

  drop(event: CdkDragDrop<Column[]>) {
    if (event.previousIndex !== event.currentIndex) {
      this.activeCollectionName$.pipe(take(1)).subscribe(collectionName => {
        this.dataManager.reorderColumns(collectionName, event.previousIndex, event.currentIndex);
      });
    }
  }

  trackByColumnName(index: number, column: Column): string {
    return column.name;
  }
}
