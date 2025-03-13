import { Component, OnInit } from '@angular/core';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import {BehaviorSubject, Observable, switchMap, tap} from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Collection, Column } from '../../models/collection.model';
import { CellEditorComponent } from '../cell-editor/cell-editor.component';
import {ServerScriptComponent} from '../server-skript/server-skript.component';
import {TerminalOutputComponent} from '../terminal-output/terminal-output.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [AsyncPipe, NgFor, CellEditorComponent, NgIf, ServerScriptComponent, TerminalOutputComponent],
  template: `
    <div class="data-table-container overflow-x-auto w-full">
      <div class="flex justify-between mb-4">
        <app-terminal-output></app-terminal-output>
        <app-server-skript></app-server-skript>
      </div>
      <table class="min-w-full bg-gray-800 shadow-xl rounded">
        <thead>
        <tr class="bg-gray-900 border-b border-gray-700">
          <th *ngFor="let column of visibleColumns$ | async; trackBy: trackByColumnName"
              class="py-3 px-4 text-left font-semibold text-gray-300">
            {{ column.name }}
          </th>
          <th class="py-3 px-4 text-left font-semibold text-gray-300">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let doc of displayedDocuments$ | async; trackBy: trackByDocId"
            class="border-b border-gray-700 hover:bg-gray-700">
          <td *ngFor="let column of visibleColumns$ | async; trackBy: trackByColumnName"
              class="py-2 px-4 text-gray-300">
            <app-cell-editor
              [value]="doc[column.name]"
              [type]="column.type"
              [docId]="doc.id"
              [fieldName]="column.name"
              [collectionName]="(activeCollectionName$ | async) || ''"
              (valueChanged)="updateCell($event)">
            </app-cell-editor>
          </td>
          <td class="py-2 px-4">
            <button
              class="text-red-400 hover:text-red-300 focus:outline-none"
              (click)="deleteDocument(doc.id)"
              title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <div class="flex justify-center py-4">
        <button
          *ngIf="(hasMoreDocuments$ | async)"
          (click)="loadMore()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200">
          Load More
        </button>
      </div>
    </div>
  `,
  styles: [`
    .data-table-container {
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #1f2937;
    }
    ::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  `]
})
export class DataTableComponent implements OnInit {
  private pageSize = 20;
  private currentPage = 1;
  private allDocuments: any[] = [];

  collection$!: Observable<Collection>;
  visibleColumns$!: Observable<Column[]>;
  displayedDocuments$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  hasMoreDocuments$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  activeCollectionName$!: Observable<string>;

  constructor(private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.activeCollectionName$ = this.dataManager.getActiveCollectionName();

    // switchMap verwenden, um auf Collection-Änderungen zu reagieren
    this.collection$ = this.activeCollectionName$.pipe(
      switchMap(() => this.dataManager.getActiveCollection()),
      tap(collection => console.log('Active collection:', collection))
    );

    this.visibleColumns$ = this.collection$.pipe(
      map(collection => collection.columns
        .filter(column => column.visible)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
      )
    );

    // Auf Collection-Änderungen reagieren
    this.collection$.subscribe(collection => {
      console.log('Documents:', collection.documents);
      this.allDocuments = collection.documents;
      this.updateDisplayedDocuments();
    });
  }

  private updateDisplayedDocuments(): void {
    const end = this.currentPage * this.pageSize;
    const documents = this.allDocuments.slice(0, end);
    this.displayedDocuments$.next(documents);
    this.hasMoreDocuments$.next(end < this.allDocuments.length);
  }

  loadMore(): void {
    this.currentPage++;
    this.updateDisplayedDocuments();
  }

  updateCell(event: { docId: string, fieldName: string, value: any }): void {
    this.activeCollectionName$.pipe(take(1)).subscribe(collectionName => {
      const fieldName = event.fieldName.toLowerCase(); // Convert to lowercase
      this.dataManager.updateCell(collectionName, event.docId, fieldName, event.value);
    });
  }

  trackByColumnName(index: number, column: Column): string {
    return column.name;
  }

  trackByDocId(index: number, doc: any): string {
    return doc.docId;
  }

  deleteDocument(docId: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.activeCollectionName$.pipe(take(1)).subscribe(collectionName => {
        this.dataManager.deleteDocument(collectionName, docId);
      });
    }
  }
}
