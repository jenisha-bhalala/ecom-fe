import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private countriesUrl = 'https://countriesnow.space/api/v0.1/countries';
  private statesByCountryUrl = 'https://countriesnow.space/api/v0.1/countries/states';
  private citiesByStateUrl = 'https://countriesnow.space/api/v0.1/countries/state/cities';
  private apiLocation = `${ environment.apiUrl}/locations`;

  constructor(private http: HttpClient) { }

  apiCountries(): Observable<any> {
    console.log('api country Service➡️➡️');
    return this.http.get(`${this.apiLocation}/countries`);
  }

  apiStates(countryCode: string): Observable<any> {
    console.log('api state Service➡️➡️ countryName', countryCode);
    return this.http.get(`${this.apiLocation}/states?countryId=${countryCode}`);
  }

  apiCities(countryCode: string, stateCode: string): Observable<any> {
    console.log('api city Service➡️➡️');
    return this.http.get(`${this.apiLocation}/cities?countryId=${countryCode}&stateId=${stateCode}`);
  }

  getStatesByCountry(countryName: string): Observable<any> {
    return this.http.post(this.statesByCountryUrl, { country: countryName });
  }

  getCitiesByState(countryName: string, stateName: string): Observable<any> {
    return this.http.post(this.citiesByStateUrl, { country: countryName, state: stateName });
  }
}
