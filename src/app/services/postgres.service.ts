import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArtikelDocument, EinkaufszettelDocument, RezepteDocument, RezeptzettelDocument, UserDocument } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class PostgresService {
  private apiUrl = 'http://192.168.1.111:8000/api'; // Adjust to your API endpoint

  constructor(private http: HttpClient) {}

  // Generic collection getter
  getCollection(collectionName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${collectionName}`);
  }

  updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    // Create the update payload in the correct format
    const updatePayload = {
      data: data
    };

    return this.http.patch<void>(
      `${this.apiUrl}/${collectionName}/${docId}`,
      updatePayload
    ).toPromise();
  }

  // Delete document
  deleteDocument(collectionName: string, docId: string): Promise<void> {
    return this.http.delete<void>(`${this.apiUrl}/${collectionName}/${docId}`).toPromise();
  }

  // Array operations
  addToArray(collectionName: string, docId: string, fieldName: string, value: any): Promise<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${collectionName}/${docId}/array/${fieldName}`,
      { value }
    ).toPromise();
  }

  removeFromArray(collectionName: string, docId: string, fieldName: string, value: any): Promise<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${collectionName}/${docId}/array/${fieldName}/${value}`
    ).toPromise();
  }
}
