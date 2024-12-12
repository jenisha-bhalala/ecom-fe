import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CartResponse } from '../cart.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient) { }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
  

  private cartUrl = `${ environment.apiUrl}/cart`;
  private productUrl = `${ environment.apiUrl}/products/search`;

  addItemToCart(productId: string, quantity: number = 1) {

    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : '' // Send as-is
    });
    
    return this.http.post(this.cartUrl,  { productId, quantity }, { headers });
  }

  getCart() {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : '' // Send as-is
    });

    return this.http.get<CartResponse>(this.cartUrl, { headers });
  }

  searchProducts(query: string) {
  console.log('qqqq sp',  query);

    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : '' // Send as-is
    });
    
    const params = new HttpParams().set('q', query);

    return this.http.get<any[]>(`${this.productUrl}`, { params, headers });
  }

  changeQuantity(id: number, quantity: number): Observable<any> {

    console.log('ppppppppppppppppp id ==>',id,'quan ==>',quantity);
    
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : '' // Send as-is
    });

    return this.http.put(`${this.cartUrl}/${id}`,  { quantity }, { headers });

  }

  deleteItemFromCart(id: number): Observable<any> {

    console.log('ppppppppppppppppp id ==>',id);
    
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : '' // Send as-is
    });

    return this.http.delete(`${this.cartUrl}/${id}`, { headers });

  }
}
