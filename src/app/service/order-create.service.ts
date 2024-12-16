import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderCreateService {

  private orderUrl = `${ environment.apiUrl}/orders`;


  constructor(private http: HttpClient) { }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getOrderDetails(id: any): Observable<any> {

    console.log('ppppppppppppppppp id ==>',id);
    
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : '' // Send as-is
    });

    return this.http.get(`${this.orderUrl}/${id}`, { headers });

  }

  
}
