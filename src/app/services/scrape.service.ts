import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrapeService {
  private apiUrl = 'http://192.168.1.111:8000/api';

  constructor(private http: HttpClient) {}

  startScraping(): Observable<any> {
    // No additional headers needed for FastAPI
    return this.http.post(`${this.apiUrl}/scrape`, {}, {
    headers: new HttpHeaders(
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
  }

  getTerminalOutput(): Observable<string> {
    const headers = new HttpHeaders()
      .set('Accept', 'text/event-stream');

    return this.http.get(`${this.apiUrl}/terminal-output`, {
      headers,
      responseType: 'text'
    });
  }
}
