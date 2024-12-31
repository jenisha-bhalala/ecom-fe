import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShippingAddressService {

  private addressUrl = `${ environment.apiUrl}/users/address`;
  private createOrderUrl = `${ environment.apiUrl}/orders`;


  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  async uploadAddress(address: any) {

    const token = this.getAuthToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : ''
    })

    
    return this.http.post(this.addressUrl, address, { headers })
  }

  async confirmOrder(addressId: number, netAmount: any, paymentMethod: any) {

    const token = this.getAuthToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : ''
    })

    const formattedPaymentMethod = paymentMethod.toUpperCase();

    return this.http.post(this.createOrderUrl, { addressId, netAmount, paymentMethod: formattedPaymentMethod }, { headers })
  }

}
