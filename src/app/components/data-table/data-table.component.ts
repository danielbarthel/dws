// src/app/components/data-table/data-table.component.ts
import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection, Column } from '../../models/collection.model';
import { CellEditorComponent } from '../cell-editor/cell-editor.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [AsyncPipe, CellEditorComponent],
  template: `
    <div class="data-table-container overflow-x-auto w-full">
      <table class="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr class="bg-gray-100 border-b">
            @for (column of visibleColumns$ | async; track column.name) {
              <th class="py-3 px-4 text-left font-semibold">{{ column.name }}</th>
            }
            <th class="py-3 px-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (doc of documents$ | async; track doc.docId) {
            <tr class="border-b hover:bg-gray-50">
              @for (column of visibleColumns$ | async; track column.name) {
                <td class="py-2 px-4">
                  <app-cell-editor
                    [value]="doc[column.name]"
                    [type]="column.type"
                    [docId]="doc.docId"
                    [fieldName]="column.name"
                    [collectionName]="(activeCollectionName$ | async) || ''"
                    (valueChanged)="updateCell($event)">
                  </app-cell-editor>
                </td>
              }
              <td class="py-2 px-4">
                <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                <button class="text-red-500 hover:text-red-700">Delete</button>
              </td>
            </tr>
          }
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
  collection$: Observable<Collection>;
  visibleColumns$: Observable<Column[]>;
  documents$: Observable<any[]>;
  activeCollectionName$: Observable<string>;

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
}
