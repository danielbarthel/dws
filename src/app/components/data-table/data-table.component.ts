// src/app/components/data-table/data-table.component.ts
import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection, Column } from '../../models/collection.model';
import { CellEditorComponent } from '../cell-editor/cell-editor.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [AsyncPipe, NgFor, CellEditorComponent],
  template: `
    <div class="data-table-container overflow-x-auto w-full">
      <table class="min-w-full bg-white shadow-md rounded">
        <thead>
        <tr class="bg-gray-100 border-b">
          <th *ngFor="let column of visibleColumns$ | async; trackBy: trackByColumnName" class="py-3 px-4 text-left font-semibold">
            {{ column.name }}
          </th>
          <th class="py-3 px-4 text-left font-semibold">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let doc of documents$ | async; trackBy: trackByDocId" class="border-b hover:bg-gray-50">
          <td *ngFor="let column of visibleColumns$ | async; trackBy: trackByColumnName" class="py-2 px-4">
            <app-cell-editor
              [value]="doc[column.name]"
              [type]="column.type"
              [docId]="doc.docId"
              [fieldName]="column.name"
              [collectionName]="(activeCollectionName$ | async) || ''"
              (valueChanged)="updateCell($event)">
            </app-cell-editor>
          </td>
          <td class="py-2 px-4">
            <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
            <button class="text-red-500 hover:text-red-700">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .data-table-container {
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }
  `]
})
export class DataTableComponent implements OnInit {
  collection$!: Observable<Collection>; // Use definite assignment assertion
  visibleColumns$!: Observable<Column[]>; // Use definite assignment assertion
  documents$!: Observable<any[]>; // Use definite assignment assertion
  activeCollectionName$!: Observable<string>; // Use definite assignment assertion

  constructor(private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.collection$ = this.dataManager.getActiveCollection();
    this.activeCollectionName$ = this.dataManager.getActiveCollectionName();

    this.visibleColumns$ = this.collection$.pipe(
      map(collection => collection.columns.filter(column => column.visible))
    );

    this.documents$ = this.collection$.pipe(
      map(collection => collection.documents)
    );
  }

  updateCell(event: { docId: string, fieldName: string, value: any }): void {
    this.activeCollectionName$.subscribe(collectionName => {
      this.dataManager.updateCell(collectionName, event.docId, event.fieldName, event.value);
    }).unsubscribe();
  }

  trackByColumnName(index: number, column: Column): string {
    return column.name;
  }

  trackByDocId(index: number, doc: any): string {
    return doc.docId;
  }
}
