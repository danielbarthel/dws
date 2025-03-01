import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgFor, AsyncPipe, NgIf, CurrencyPipe} from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { BehaviorSubject, map, switchMap } from 'rxjs';

interface ProductInfo {
  id: string;
  Artikelname: string;
  Bildpfad: string;
  Preis: number;
}

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
          <div *ngFor="let item of products$ | async" class="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
            <img [src]="getFullImageUrl(item.Bildpfad)"
                 class="w-12 h-12 object-contain rounded"
                 onerror="this.src='assets/placeholder.png'"
                 [alt]="item.Artikelname">
            <div class="flex-1">
              <div class="text-gray-200">{{ item.Artikelname }}</div>
              <div class="text-gray-400">{{ item.Preis | currency:'EUR':'symbol':'1.2-2' }}</div>
            </div>
          </div>
        </ng-container>

        <ng-template #defaultArray>
          <div *ngFor="let item of items" class="text-gray-300 p-2 hover:bg-gray-700 rounded">
            {{ item }}
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
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
export class ArrayDialogComponent {
  @Input() title: string = '';
  @Input() position: { x: number, y: number } = { x: 0, y: 0 };
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
    switchMap(ids => this.firestoreService.getCollection('artikel').pipe(
      map(articles => articles
        .filter(article => ids.includes(article.docId))
        .map(article => ({
          id: article.docId,
          Artikelname: article.Artikelname,
          Bildpfad: article.Bildpfad,
          Preis: article.Preis
        } as ProductInfo))
      )
    ))
  );

  constructor(private firestoreService: FirestoreService) {}

  close(): void {
    this.closed.emit();
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/disco-416210.appspot.com/o/';
    const encodedPath = path.replace(/\//g, '%2F');
    return `${baseUrl}${encodedPath}?alt=media`;
  }
}
