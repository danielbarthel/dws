// src/app/components/statistics/statistics.component.ts
import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable, map } from 'rxjs';
import { Collection } from '../../models/collection.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  template: `
    <div *ngIf="(activeCollection$ | async)?.name === 'artikel'"
         class="statistics bg-gray-800 p-4 rounded shadow-md mt-4">
      <h3 class="text-lg font-semibold mb-2 text-gray-200">Statistics</h3>

      <div class="space-y-4">
        <div>
          <div class="stat-item">
            <span class="text-gray-400">Rewe Artikel:</span>
            <span class="text-gray-200">{{ reweCount$ | async }}</span>
          </div>
          <div class="stat-sub-item">
            <span class="text-gray-500">davon im Angebot:</span>
            <span class="text-gray-400">{{ reweOfferCount$ | async }}</span>
          </div>
        </div>

        <div>
          <div class="stat-item">
            <span class="text-gray-400">Penny Artikel:</span>
            <span class="text-gray-200">{{ pennyCount$ | async }}</span>
          </div>
          <div class="stat-sub-item">
            <span class="text-gray-500">davon im Angebot:</span>
            <span class="text-gray-400">{{ pennyOfferCount$ | async }}</span>
          </div>
        </div>

        <div>
          <div class="stat-item">
            <span class="text-gray-400">Food Artikel:</span>
            <span class="text-gray-200">{{ foodCount$ | async }}</span>
          </div>
          <div class="stat-sub-item">
            <span class="text-gray-500">davon mit Produktnamen:</span>
            <span class="text-gray-400">{{ foodWithProductCount$ | async }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatisticsComponent implements OnInit {
  activeCollection$!: Observable<Collection>;
  reweCount$!: Observable<number>;
  pennyCount$!: Observable<number>;
  reweOfferCount$!: Observable<number>;
  pennyOfferCount$!: Observable<number>;
  foodCount$!: Observable<number>;
  foodWithProductCount$!: Observable<number>;

  constructor(private dataManager: DataManagerService) {}

  ngOnInit(): void {
    this.activeCollection$ = this.dataManager.getActiveCollection();

    this.reweCount$ = this.activeCollection$.pipe(
      map(collection => collection.documents.filter(doc => doc.Markt === 'Rewe').length)
    );

    this.pennyCount$ = this.activeCollection$.pipe(
      map(collection => collection.documents.filter(doc => doc.Markt === 'Penny').length)
    );

    this.reweOfferCount$ = this.activeCollection$.pipe(
      map(collection => collection.documents.filter(doc =>
        doc.Markt === 'Rewe' && doc.Angebot === true
      ).length)
    );

    this.pennyOfferCount$ = this.activeCollection$.pipe(
      map(collection => collection.documents.filter(doc =>
        doc.Markt === 'Penny' && doc.Angebot === true
      ).length)
    );

    this.foodCount$ = this.activeCollection$.pipe(
      map(collection => collection.documents.filter(doc => doc.Food === true).length)
    );

    this.foodWithProductCount$ = this.activeCollection$.pipe(
      map(collection => collection.documents.filter(doc =>
        doc.Food === true &&
        doc.Produkt &&
        doc.Produkt !== '' &&
        doc.Produkt !== 'test'
      ).length)
    );
  }
}
