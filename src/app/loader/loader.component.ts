import { Component } from '@angular/core';
import { LocalService } from '../services/local.service';
@Component({
  selector: 'app-loader',
  template:`
  <div class="overlay" *ngIf="local.isloader">
    <div class="imagen"></div>
  </div>`,
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent{
  constructor(public local: LocalService) { 
  }
}
