import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private createPaymenteUrl = `${ environment.apiUrl}/checkout-payment/create-payment-intent`;
  private confirmPaymenteUrl = `${ environment.apiUrl}/checkout-payment/confirm-payment-intent`;


  constructor(private http: HttpClient,) {
    // this.stripePromise = this.loadStripe();
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }


  async createPaymentIntentFunction(amount: any, currency: any, payload: any) {
    
    const authToken = this.getAuthToken();

    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': authToken ? authToken : ''
    // })

    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    };

    let requestParameters = { amount, currency, payload };
    // return this.http.post(this.createPaymenteUrl, requestParameters, { headers })

    try {
      const response = await fetch(this.createPaymenteUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestParameters),
      });
  
      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
      }
  
      // Parse and return the JSON response
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error in createPaymentIntentFunction:', error);
      throw error; // Re-throw the error for the calling function to handle
    }
  }


  async confirmPaymentIntentFunction(token: any, paymentIntentId: any) {
    
    const authToken = this.getAuthToken();

    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': authToken ? authToken : ''
    // })
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    };
    let requestParameters = { token, paymentIntentId };

    // return this.http.post(this.confirmPaymenteUrl, requestParameters, { headers })

    try {
      const response = await fetch(this.confirmPaymenteUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestParameters),
      });
  
      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        throw new Error(`HTTP error! cnfm Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
      }
  
      // Parse and return the JSON response
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error in confirmPaymentIntentFunction:', error);
      throw error; // Re-throw the error for the calling function to handle
    }
  }

}
