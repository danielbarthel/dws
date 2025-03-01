// src/app/components/tab-navigation/tab-navigation.component.ts
import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable } from 'rxjs';
import { Collection } from '../../models/collection.model';

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [AsyncPipe, NgFor],
  template: `
    <div class="tabs-container bg-gray-800 p-2 rounded shadow-md">
      <div class="flex space-x-2">
        <button
          *ngFor="let collection of collections$ | async; trackBy: trackByCollectionName"
          class="tab-btn py-2 px-4 rounded-t transition-colors duration-200 text-gray-300"
          [class.bg-gray-700]="(activeCollectionName$ | async) === collection.name"
          [class.text-blue-400]="(activeCollectionName$ | async) === collection.name"
          [class.border-b-2]="(activeCollectionName$ | async) === collection.name"
          [class.border-blue-400]="(activeCollectionName$ | async) === collection.name"
          [class.bg-gray-800]="(activeCollectionName$ | async) !== collection.name"
          (click)="selectCollection(collection.name)">
          {{ collection.name }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tab-btn {
      font-weight: 500;
    }
    .tab-btn:hover:not(.active) {
      background-color: rgba(255, 255, 255, 0.05);
    }
  `]
})
export class TabNavigationComponent implements OnInit {
  collections$!: Observable<Collection[]>; // Use definite assignment assertion
  activeCollectionName$!: Observable<string>; // Use definite assignment assertion

  constructor(private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.collections$ = this.dataManager.getCollections();
    this.activeCollectionName$ = this.dataManager.getActiveCollectionName();
  }

  selectCollection(name: string): void {
    this.dataManager.setActiveCollection(name);
  }

  trackByCollectionName(index: number, collection: Collection): string {
    return collection.name;
  }
}
