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
    const initialCollections: Collection[] = [
      {
        name: 'artikel',
        visible: true,
        documents: [],
        columns: [
          { name: 'Angebot', visible: true, type: 'boolean', order: 0 },
          { name: 'Artikelname', visible: true, type: 'string', order: 2 },
          { name: 'Bildpfad', visible: true, type: 'string', order: 3 },
          { name: 'Food', visible: true, type: 'boolean', order: 1 },
          { name: 'Markt', visible: true, type: 'string', order: 5 },
          { name: 'Preis', visible: true, type: 'number', order: 6 },
          { name: 'Produkt', visible: true, type: 'string', order: 4 },
          { name: 'Topangebot', visible: false, type: 'boolean', order: 7 },
          { name: 'Zusatzinfos', visible: false, type: 'array', order: 8 },
          { name: 'id', visible: false, type: 'string', order: 9 },
          { name: 'timestamp', visible: false, type: 'timestamp', order: 10 }
        ]
      },
      {
        name: 'einkaufszettel',
        visible: true,
        documents: [],
        columns: [
          { name: 'name', visible: true, type: 'string', order: 0 },
          { name: 'produktid', visible: true, type: 'array', order: 1 },
          { name: 'uid', visible: true, type: 'string', order: 2 }
        ]
      },
      {
        name: 'rezepte',
        visible: true,
        documents: [],
        columns: [
          { name: 'difficulty', visible: true, type: 'string', order: 0 },
          { name: 'id', visible: true, type: 'string', order: 1 },
          { name: 'image_path', visible: true, type: 'string', order: 2 },
          { name: 'image_urls', visible: true, type: 'array', order: 3 },
          { name: 'ingredients', visible: true, type: 'array', order: 4 },
          { name: 'nutrition', visible: true, type: 'map', order: 5 },
          { name: 'rating', visible: true, type: 'map', order: 6 },
          { name: 'source', visible: true, type: 'string', order: 7 },
          { name: 'source_url', visible: true, type: 'string', order: 8 },
          { name: 'steps', visible: true, type: 'array', order: 9 },
          { name: 'title', visible: true, type: 'string', order: 10 },
          { name: 'totalTime', visible: true, type: 'number', order: 11 }
        ]
      },
      {
        name: 'rezeptzettel',
        visible: true,
        documents: [],
        columns: [
          { name: 'name', visible: true, type: 'string', order: 0 },
          { name: 'produktid', visible: true, type: 'array', order: 1 },
          { name: 'uid', visible: true, type: 'string', order: 2 }
        ]
      },
      {
        name: 'users',
        visible: true,
        documents: [],
        columns: [
          { name: 'einkaufszettelID', visible: true, type: 'string', order: 0 },
          { name: 'likedRecipes', visible: true, type: 'array', order: 1 },
          { name: 'name', visible: true, type: 'string', order: 2 },
          { name: 'profileImageUrl', visible: true, type: 'string', order: 3 },
          { name: 'rezeptzettelID', visible: true, type: 'string', order: 4 },
          { name: 'uid', visible: true, type: 'string', order: 5 }
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
      map(collections => {
        const collection = collections.find(c => c.name === this.activeCollectionName.value) || collections[0];
        return {
          ...collection,
          columns: [...collection.columns].sort((a, b) => (a.order || 0) - (b.order || 0))
        };
      })
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

  reorderColumns(collectionName: string, startIndex: number, endIndex: number): void {
    const collections = this.collections.value;
    const updatedCollections = collections.map(collection => {
      if (collection.name === collectionName) {
        const columns = [...collection.columns];
        const [movedColumn] = columns.splice(startIndex, 1);
        columns.splice(endIndex, 0, movedColumn);

        // Update order values
        const updatedColumns = columns.map((col, index) => ({
          ...col,
          order: index
        }));

        return { ...collection, columns: updatedColumns };
      }
      return collection;
    });
    this.collections.next(updatedCollections);
  }

  deleteDocument(collectionName: string, docId: string) {
    return this.firestoreService.deleteDocument(collectionName, docId);
  }
}
