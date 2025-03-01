import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection, Column } from '../models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {
  private collections: BehaviorSubject<Collection[]> = new BehaviorSubject<Collection[]>([]);
  private activeCollectionName: BehaviorSubject<string> = new BehaviorSubject<string>('artikel');

  constructor(private firestoreService: FirestoreService) {
    this.initializeCollections();
  }

  private initializeCollections() {
    // Define initial collection structures
    const initialCollections: Collection[] = [
      {
        name: 'artikel',
        visible: true,
        documents: [],
        columns: [
          { name: 'Angebot', visible: true, type: 'boolean' },
          { name: 'Artikelname', visible: true, type: 'string' },
          { name: 'Bildpfad', visible: true, type: 'string' },
          { name: 'Food', visible: true, type: 'boolean' },
          { name: 'Markt', visible: true, type: 'string' },
          { name: 'Preis', visible: true, type: 'number' },
          { name: 'Produkt', visible: true, type: 'string' },
          { name: 'Topangebot', visible: true, type: 'boolean' },
          { name: 'Zusatzinfos', visible: true, type: 'array' },
          { name: 'id', visible: true, type: 'string' },
          { name: 'timestamp', visible: true, type: 'timestamp' }
        ]
      },
      {
        name: 'einkaufszettel',
        visible: true,
        documents: [],
        columns: [
          { name: 'name', visible: true, type: 'string' },
          { name: 'produktid', visible: true, type: 'array' },
          { name: 'uid', visible: true, type: 'string' }
        ]
      },
      {
        name: 'rezepte',
        visible: true,
        documents: [],
        columns: [
          { name: 'difficulty', visible: true, type: 'string' },
          { name: 'id', visible: true, type: 'string' },
          { name: 'image_path', visible: true, type: 'string' },
          { name: 'image_urls', visible: true, type: 'array' },
          { name: 'ingredients', visible: true, type: 'array' },
          { name: 'nutrition', visible: true, type: 'map' },
          { name: 'rating', visible: true, type: 'map' },
          { name: 'source', visible: true, type: 'string' },
          { name: 'source_url', visible: true, type: 'string' },
          { name: 'steps', visible: true, type: 'array' },
          { name: 'title', visible: true, type: 'string' },
          { name: 'totalTime', visible: true, type: 'number' }
        ]
      },
      {
        name: 'rezeptzettel',
        visible: true,
        documents: [],
        columns: [
          { name: 'name', visible: true, type: 'string' },
          { name: 'produktid', visible: true, type: 'array' },
          { name: 'uid', visible: true, type: 'string' }
        ]
      },
      {
        name: 'users',
        visible: true,
        documents: [],
        columns: [
          { name: 'einkaufszettelID', visible: true, type: 'string' },
          { name: 'likedRecipes', visible: true, type: 'array' },
          { name: 'name', visible: true, type: 'string' },
          { name: 'profileImageUrl', visible: true, type: 'string' },
          { name: 'rezeptzettelID', visible: true, type: 'string' },
          { name: 'uid', visible: true, type: 'string' }
        ]
      }
    ];

    this.collections.next(initialCollections);
    this.loadAllCollections();
  }

  private loadAllCollections() {
    const collections = this.collections.value;

    collections.forEach(collection => {
      this.firestoreService.getCollection(collection.name).subscribe(documents => {
        const updatedCollections = this.collections.value.map(c => {
          if (c.name === collection.name) {
            return { ...c, documents };
          }
          return c;
        });
        this.collections.next(updatedCollections);
      });
    });
  }

  getCollections(): Observable<Collection[]> {
    return this.collections.asObservable();
  }

  getActiveCollection(): Observable<Collection> {
    return this.collections.pipe(
      map(collections =>
        collections.find(c => c.name === this.activeCollectionName.value) || collections[0]
      )
    );
  }

  setActiveCollection(name: string) {
    this.activeCollectionName.next(name);
  }

  toggleColumnVisibility(collectionName: string, columnName: string) {
    const collections = this.collections.value;
    const updatedCollections = collections.map(collection => {
      if (collection.name === collectionName) {
        const updatedColumns = collection.columns.map(column => {
          if (column.name === columnName) {
            return { ...column, visible: !column.visible };
          }
          return column;
        });
        return { ...collection, columns: updatedColumns };
      }
      return collection;
    });
    this.collections.next(updatedCollections);
  }

  updateCell(collectionName: string, docId: string, fieldName: string, value: any) {
    return this.firestoreService.updateDocument(collectionName, docId, { [fieldName]: value });
  }

  getActiveCollectionName(): Observable<string> {
    return this.activeCollectionName.asObservable();
  }
}
