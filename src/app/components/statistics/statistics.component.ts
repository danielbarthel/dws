// src/app/components/statistics/statistics.component.ts
import { Component, OnInit } from '@angular/core';
import {AsyncPipe, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { Observable, map } from 'rxjs';
import { Collection } from '../../models/collection.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgSwitch, NgSwitchCase],
  template: `
    <div *ngIf="(activeCollection$ | async) as activeCollection"
         class="statistics bg-gray-800 p-4 rounded shadow-md mt-4">
      <h3 class="text-lg font-semibold mb-2 text-gray-200">Statistics</h3>

      <ng-container [ngSwitch]="activeCollection.name">
        <ng-container *ngSwitchCase="'artikel'">
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
        </ng-container>

        <ng-container *ngSwitchCase="'einkaufszettel'">
          <div class="space-y-4">
            <div class="stat-item">
              <span class="text-gray-400">Anzahl Einkaufszettel:</span>
              <span class="text-gray-200">{{ collectionCount$ | async }}</span>
            </div>
          </div>
        </ng-container>

        <ng-container *ngSwitchCase="'rezepte'">
          <div class="space-y-4">
            <div class="stat-item">
              <span class="text-gray-400">Anzahl Rezepte:</span>
              <span class="text-gray-200">{{ collectionCount$ | async }}</span>
            </div>
            <div class="stat-item">
              <span class="text-gray-400">Mit Bewertungen:</span>
              <span class="text-gray-200">{{ ratedRecipesCount$ | async }}</span>
            </div>
          </div>
        </ng-container>

        <ng-container *ngSwitchCase="'rezeptzettel'">
          <div class="space-y-4">
            <div class="stat-item">
              <span class="text-gray-400">Anzahl Rezeptzettel:</span>
              <span class="text-gray-200">{{ collectionCount$ | async }}</span>
            </div>
          </div>
        </ng-container>

        <ng-container *ngSwitchCase="'users'">
          <div class="space-y-4">
            <div class="stat-item">
              <span class="text-gray-400">Anzahl Nutzer:</span>
              <span class="text-gray-200">{{ collectionCount$ | async }}</span>
            </div>
            <div class="stat-item">
              <span class="text-gray-400">Mit Profilbild:</span>
              <span class="text-gray-200">{{ usersWithImageCount$ | async }}</span>
            </div>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `
})
export class StatisticsComponent implements OnInit {
  activeCollection$: Observable<Collection>;
  collectionCount$: Observable<number>;

  // Artikel stats
  reweCount$!: Observable<number>;
  pennyCount$!: Observable<number>;
  reweOfferCount$!: Observable<number>;
  pennyOfferCount$!: Observable<number>;
  foodCount$!: Observable<number>;
  foodWithProductCount$!: Observable<number>;

  // Rezepte stats
  ratedRecipesCount$!: Observable<number>;

  // Users stats
  usersWithImageCount$!: Observable<number>;

  constructor(private dataManager: DataManagerService) {
    this.activeCollection$ = this.dataManager.getActiveCollection();
    this.collectionCount$ = this.activeCollection$.pipe(
      map(collection => collection.documents.length)
    );

    // Initialize all stats with default values
    this.initStats();
  }

  private initStats(): void {
    // Artikel stats
    this.reweCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'artikel' ?
        collection.documents.filter(doc => doc.Markt === 'Rewe').length : 0)
    );

    this.pennyCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'artikel' ?
        collection.documents.filter(doc => doc.Markt === 'Penny').length : 0)
    );

    this.reweOfferCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'artikel' ?
        collection.documents.filter(doc => doc.Markt === 'Rewe' && doc.Angebot).length : 0)
    );

    this.pennyOfferCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'artikel' ?
        collection.documents.filter(doc => doc.Markt === 'Penny' && doc.Angebot).length : 0)
    );

    this.foodCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'artikel' ?
        collection.documents.filter(doc => doc.Food).length : 0)
    );

    this.foodWithProductCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'artikel' ?
        collection.documents.filter(doc =>
          doc.Food && doc.Produkt && doc.Produkt !== '' && doc.Produkt !== 'test'
        ).length : 0)
    );

    // Rezepte stats
    this.ratedRecipesCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'rezepte' ?
        collection.documents.filter(doc => doc.rating?.ratingCount > 0).length : 0)
    );

    // Users stats
    this.usersWithImageCount$ = this.activeCollection$.pipe(
      map(collection => collection.name === 'users' ?
        collection.documents.filter(doc => doc.profileImageUrl && doc.profileImageUrl !== '').length : 0)
    );
  }

  ngOnInit(): void {}
}
