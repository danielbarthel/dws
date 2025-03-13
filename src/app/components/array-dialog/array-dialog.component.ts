// In ArrayDialogComponent
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, AsyncPipe, NgIf, CurrencyPipe } from '@angular/common';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { PostgresService } from '../../services/postgres.service';
import { DataManagerService } from '../../services/data-manager.service';

@Component({
  selector: 'app-array-dialog',
  standalone: true,
  imports: [NgFor, AsyncPipe, NgIf, CurrencyPipe],
  template: `
    <div class="fixed z-50 bg-gray-800 rounded shadow-lg p-4 border border-gray-700"
         [style.left.px]="position.x"
         [style.top.px]="position.y">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-200">{{ title }}</h3>
        <button class="text-gray-400 hover:text-gray-200" (click)="close()">✕</button>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <ng-container *ngIf="title === 'produktid'; else defaultArray">
          <div *ngFor="let item of products$ | async" class="flex items-center justify-between gap-2 p-2 hover:bg-gray-700 rounded">
            <div class="flex items-center gap-2">
              <img [src]="getFullImageUrl(item.Bildpfad)"
                   class="w-12 h-12 object-contain rounded"
                   [alt]="item.Artikelname">
              <div class="flex-1">
                <div class="text-gray-200">{{ item.Artikelname }}</div>
                <div class="text-gray-400">{{ item.Preis | currency:'EUR':'symbol':'1.2-2' }}</div>
              </div>
            </div>
            <button
              class="text-red-400 hover:text-red-300"
              (click)="removeItem(item.id)">
              ✕
            </button>
          </div>
        </ng-container>

        <ng-template #defaultArray>
          <div *ngFor="let item of items" class="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
            <span class="text-gray-300">{{ item }}</span>
            <button
              class="text-red-400 hover:text-red-300"
              (click)="removeItem(item)">
              ✕
            </button>
          </div>
        </ng-template>

        <div class="mt-4 pt-4 border-t border-gray-700">
          <input
            #newItemInput
            type="text"
            class="w-full bg-gray-700 text-gray-200 p-2 rounded"
            placeholder="Add new item..."
            (keyup.enter)="addItem(newItemInput.value); newItemInput.value = ''">
        </div>
      </div>
    </div>
  `
})
export class ArrayDialogComponent {
  @Input() title: string = '';
  @Input() position: { x: number, y: number } = { x: 0, y: 0 };
  @Input() docId: string = '';
  @Input() set items(value: any[]) {
    this._items = value;
    if (this.title === 'produktid') {
      this.productIds.next(value || []);
    }
  }
  get items(): any[] {
    return this._items;
  }
  @Output() closed = new EventEmitter<void>();

  private _items: any[] = [];
  private productIds = new BehaviorSubject<string[]>([]);
  products$ = this.productIds.pipe(
    switchMap(ids => this.postgresService.getCollection('artikel').pipe(
      map(articles => articles
        .filter(article => ids.includes(article.id))
        .map(article => ({
          id: article.id,
          Artikelname: article.Artikelname,
          Bildpfad: article.Bildpfad,
          Preis: article.Preis
        }))
      )
    ))
  );

  constructor(
    private postgresService: PostgresService,
    private dataManager: DataManagerService
  ) {}

  async addItem(value: string): Promise<void> {
    if (!value.trim()) return;

    try {
      const collectionName = this.getCollectionName();
      await this.dataManager.addToArray(collectionName, this.docId, this.title, value);
      if (this.title === 'produktid') {
        this.productIds.next([...this._items, value]);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  async removeItem(value: string): Promise<void> {
    try {
      const collectionName = this.getCollectionName();
      await this.dataManager.removeFromArray(collectionName, this.docId, this.title, value);
      if (this.title === 'produktid') {
        this.productIds.next(this._items.filter(id => id !== value));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  private getCollectionName(): string {
    return window.location.pathname.split('/').pop() || 'artikel';
  }

  close(): void {
    this.closed.emit();
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    const cleanPath = path.replace(/^\/images\//, '');
    return `http://localhost:8000/images/${cleanPath}`;
  }
}
