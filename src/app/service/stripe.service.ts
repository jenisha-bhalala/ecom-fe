import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private createPaymenteUrl = `${ environment.apiUrl}/checkout-payment/create-payment-intent`;
  private confirmPaymenteUrl = `${ environment.apiUrl}/checkout-payment/confirm-payment-intent`;
  private subCheckoutPaymenteUrl = `${ environment.apiUrl}/checkout-payment/create-sub-checkout-session`;
  
  private portalSessionUrl = `${ environment.apiUrl}/checkout-payment/create-customer-portal-session`;


  constructor(private http: HttpClient,) {
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

// Method to create a one-time payment intent
  async createPaymentIntentFunction(amount: any, currency: any, payload: any) {
    
    const authToken = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    };

    let requestParameters = { amount, currency, payload };

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

  // Method to confirm one-time payment
  async confirmPaymentIntentFunction(token: any, paymentIntentId: any) {
    
    const authToken = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    };

    let requestParameters = { token, paymentIntentId };

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

  // METHOD to create a subscription payment intent
  async createCheckoutSub(userId: any,  priceId: string, loggedInUserEmail: any) {
    
    const authToken = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    };
    let requestParameters = { userId, priceId, loggedInUserEmail };

    try {
      const response = await fetch(this.subCheckoutPaymenteUrl, {
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

  // For Renewal OR Cancel the Subscription Plan
  async createCustomerPortalSession(customerId: string) {

    const authToken = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: authToken }),
    };

    let requestParameters = { customerId };

    try {
      const response = await fetch(this.portalSessionUrl, {
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

    // return this.http.post(this.portalSessionUrl, { customerId }, { headers });
  }



}
