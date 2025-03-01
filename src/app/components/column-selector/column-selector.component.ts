// src/app/components/column-selector/column-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Column } from '../../models/collection.model';

@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [AsyncPipe, NgFor],
  template: `
    <div class="column-selector bg-white p-4 rounded shadow">
      <h3 class="text-lg font-semibold mb-2">Column Visibility</h3>

      <div class="columns-container">
        <div *ngFor="let column of columns$ | async; trackBy: trackByColumnName" class="column-item my-1 flex items-center">
          <input
            type="checkbox"
            [id]="'col-' + column.name"
            class="mr-2"
            [checked]="column.visible"
            (change)="toggleColumn(column.name)">
          <label [for]="'col-' + column.name" class="cursor-pointer">
            {{ column.name }}
          </label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .column-selector {
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class ColumnSelectorComponent implements OnInit {
  columns$!: Observable<Column[]>; // Use definite assignment assertion
  activeCollectionName$!: Observable<string>; // Use definite assignment assertion

  constructor(private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.activeCollectionName$ = this.dataManager.getActiveCollectionName();
    this.columns$ = this.dataManager.getActiveCollection().pipe(
      map(collection => collection.columns)
    );
  }

  toggleColumn(columnName: string): void {
    this.activeCollectionName$.subscribe(collectionName => {
      this.dataManager.toggleColumnVisibility(collectionName, columnName);
    }).unsubscribe();
  }

  trackByColumnName(index: number, column: Column): string {
    return column.name;
  }
}
