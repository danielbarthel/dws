import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection, Column } from '../models/collection.model';
import {PostgresService} from './postgres.service';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {
  private collections: BehaviorSubject<Collection[]> = new BehaviorSubject<Collection[]>([]);
  private activeCollectionName: BehaviorSubject<string> = new BehaviorSubject<string>('artikel');

  constructor(private postgresService: PostgresService) {
    this.initializeCollections();
  }

  private initializeCollections() {
    const initialCollections: Collection[] = [
      {
        name: 'artikel',
        visible: true,
        documents: [],
        columns: [
          { name: 'angebot', visible: true, type: 'boolean', order: 0 },
          { name: 'artikelname', visible: true, type: 'string', order: 3 },
          { name: 'bildpfad', visible: true, type: 'string', order: 2 },
          { name: 'food', visible: true, type: 'boolean', order: 1 },
          { name: 'markt', visible: true, type: 'string', order: 5 },
          { name: 'preis', visible: true, type: 'number', order: 6 },
          { name: 'produkt', visible: true, type: 'string', order: 4 },
          { name: 'topangebot', visible: false, type: 'boolean', order: 7 },
          { name: 'zusatzinfos', visible: false, type: 'array', order: 8 },
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
          // Change type to 'array' to match Zusatzinfos behavior
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
    console.log('Loading all collections');

    this.collections.value.forEach(collection => {
      this.postgresService.getCollection(collection.name).subscribe({
        next: (documents) => {
          console.log(`Loaded ${documents.length} documents for ${collection.name}`);

          const updatedCollections = this.collections.value.map(c => {
            if (c.name === collection.name) {
              return { ...c, documents };
            }
            return c;
          });
          this.collections.next(updatedCollections);
        },
        error: (error) => console.error(`Error loading ${collection.name}:`, error)
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

  // In DataManagerService
  async updateCell(collectionName: string, docId: string, fieldName: string, value: any): Promise<void> {
    try {
      if (!docId) {
        throw new Error('Document ID is required');
      }

      // Create update payload
      const updateData = { [fieldName]: value };

      // Update database
      await this.postgresService.updateDocument(collectionName, docId, updateData);

      // Update local state
      const collections = this.collections.value;
      const updatedCollections = collections.map(collection => {
        if (collection.name === collectionName) {
          const updatedDocuments = collection.documents.map(doc => {
            if (doc.id === docId) {
              return { ...doc, [fieldName]: value };
            }
            return doc;
          });
          return { ...collection, documents: updatedDocuments };
        }
        return collection;
      });
      this.collections.next(updatedCollections);
    } catch (error) {
      console.error('Error updating cell:', error);
      throw error;
    }
  }
  // In DataManagerService
  async addToArray(collectionName: string, docId: string, fieldName: string, value: any): Promise<void> {
    try {
      // First update database
      await this.postgresService.addToArray(collectionName, docId, fieldName, value);

      // Then update local state
      const collections = this.collections.value;
      const updatedCollections = collections.map(collection => {
        if (collection.name === collectionName) {
          const updatedDocuments = collection.documents.map(doc => {
            if (doc.id === docId) {
              const currentArray = Array.isArray(doc[fieldName]) ? doc[fieldName] : [];
              return { ...doc, [fieldName]: [...currentArray, value] };
            }
            return doc;
          });
          return { ...collection, documents: updatedDocuments };
        }
        return collection;
      });
      this.collections.next(updatedCollections);
    } catch (error) {
      console.error('Error adding to array:', error);
      throw error;
    }
  }

  async removeFromArray(collectionName: string, docId: string, fieldName: string, value: any): Promise<void> {
    try {
      // First update database
      await this.postgresService.removeFromArray(collectionName, docId, fieldName, value);

      // Then update local state
      const collections = this.collections.value;
      const updatedCollections = collections.map(collection => {
        if (collection.name === collectionName) {
          const updatedDocuments = collection.documents.map(doc => {
            if (doc.id === docId) {
              const currentArray = Array.isArray(doc[fieldName]) ? doc[fieldName] : [];
              return {
                ...doc,
                [fieldName]: currentArray.filter(item => item !== value)
              };
            }
            return doc;
          });
          return { ...collection, documents: updatedDocuments };
        }
        return collection;
      });
      this.collections.next(updatedCollections);
    } catch (error) {
      console.error('Error removing from array:', error);
      throw error;
    }
  }

  private capitalizeFirstLetter(field: string): string {
    return field.charAt(0).toUpperCase() + field.slice(1);
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
    return this.postgresService.deleteDocument(collectionName, docId);
  }
}
