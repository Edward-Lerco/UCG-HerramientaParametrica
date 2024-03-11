import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DatosFormulario, Respuesta } from '../pages/home/home.component'

const urlApi = environment.urlApi

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }


  getData(body: DatosFormulario){
    return this.http.post<Respuesta>(`${urlApi}califica/get-calculadora-ucg`,body)
  }
}
