import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) {}

  // Get all documents from a collection
  getCollection(collectionName: string): Observable<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'docId' });
  }

  // Update a document
  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    return updateDoc(docRef, data);
  }

  // Add to array field
  async addToArray(collectionName: string, docId: string, fieldName: string, value: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    return updateDoc(docRef, {
      [fieldName]: arrayUnion(value)
    });
  }

  // Remove from array field
  async removeFromArray(collectionName: string, docId: string, fieldName: string, value: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    return updateDoc(docRef, {
      [fieldName]: arrayRemove(value)
    });
  }

  // Create new document
  async createDocument(collectionName: string, docId: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    return setDoc(docRef, data);
  }

  // Delete document
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, docId);
    return deleteDoc(docRef);
  }
}
