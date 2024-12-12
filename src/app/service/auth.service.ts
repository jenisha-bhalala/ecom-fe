import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';


export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  private storeAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
  


  loginUser(email: string, password: string): Observable<any> {

    const requestParameters = '';
    const url = `${environment.apiUrl}/auth/login`;
    const body = { email, password };

    let t = this.http.post(url, body, { observe: 'response' }).pipe(
      tap((response: any) => {
        console.log('response:', response);

        const authHeader = response.headers.get('Authorization');
        // if (authHeader && authHeader.startsWith('Bearer ')) { 

        //   const token = authHeader.split(' ')[1];
        //   console.log('token:', token);
        //   if(token) {
        //     console.log('login successful, token:', token);
            
        //     this.storeAuthToken(token)
        //   } else {
        //     console.error('No token found in the Authorization header');
        //   }
        // }


        const token = response.body.token;
        if(token) {
              console.log('login successful, token:', token);
              
              this.storeAuthToken(token)
            }

      })
    );

    return t;

  }


  signupUser(email: string, name: string, password: string): Observable<any> {

    const requestParameters = '';
    const url = `${environment.apiUrl}/auth/signup`;
    const body = { email, name, password };

    let t = this.http.post(url, body, { observe: 'response' }).pipe(
      tap((response) => {
        const token = response.headers.get('Authorization');
        if(token) {
          console.log('Signup successful, token: ', token);
          
          this.storeAuthToken(token)
        }
      })
    );

    return t;

  }

  logoutUser() {

  }

  // listProducts(): Observable<any> {

  //   const token = this.getAuthToken();
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': token ? `Bearer ${token}` : 'No Token'
  //   })
    
  //   const requestParameters = '';

    

  //     const result =  this.http.get(`${this.apiUrl}/products`, {headers}).pipe(

  //       catchError(error => {
  //         console.error('Error fetching products:', error);
  //         return throwError(error);
  //       })

  //     );
        
  //     return result;
  // }

  listProducts(page: number, pageSize: number): Observable<any> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : '' // Send as-is
    });
  
    return this.http.get(`${this.apiUrl}/products?page=${page}&pageSize=${pageSize}`, { headers });
  }
  
  
  
}
