import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardContent, 
  IonCardTitle, 
  IonCardHeader, 
  IonLabel, 
  IonIcon, 
  IonItem, 
  IonList, 
  IonImg, 
  IonSearchbar 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonCard, 
    IonCardContent, 
    IonCardTitle, 
    IonCardHeader, 
    IonLabel, 
    IonIcon, 
    IonItem, 
    IonList, 
    IonImg, 
    IonSearchbar
  ]
})
export class HomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
