import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderCreateService {

  private createOrderUrl = `${ environment.apiUrl}/orders`;


  constructor(private http: HttpClient) { }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  
}
