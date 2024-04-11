import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const urlApi = environment.urlApi

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${urlApi}auth`

  constructor( private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password});
  }

  logout(): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/logout`, {});
  }

}