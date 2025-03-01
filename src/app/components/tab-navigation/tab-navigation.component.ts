// src/app/components/tab-navigation/tab-navigation.component.ts
import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable } from 'rxjs';
import { Collection } from '../../models/collection.model';

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="tabs-container bg-gray-100 p-2 rounded shadow-sm">
      <div class="flex space-x-2">
        @for (collection of collections$ | async; track collection.name) {
          <button
            class="tab-btn py-2 px-4 rounded-t transition-colors duration-200"
            [class.bg-white]="(activeCollectionName$ | async) === collection.name"
            [class.text-blue-600]="(activeCollectionName$ | async) === collection.name"
            [class.border-b-2]="(activeCollectionName$ | async) === collection.name"
            [class.border-blue-600]="(activeCollectionName$ | async) === collection.name"
            [class.bg-gray-200]="(activeCollectionName$ | async) !== collection.name"
            (click)="selectCollection(collection.name)">
            {{ collection.name }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .tab-btn {
      font-weight: 500;
    }
    .tab-btn:hover:not(.active) {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `]
})
export class TabNavigationComponent implements OnInit {
  collections$: Observable<Collection[]>;
  activeCollectionName$: Observable<string>;

  constructor(private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.collections$ = this.dataManager.getCollections();
    this.activeCollectionName$ = this.dataManager.getActiveCollectionName();
  }

  selectCollection(name: string): void {
    this.dataManager.setActiveCollection(name);
  }
}
