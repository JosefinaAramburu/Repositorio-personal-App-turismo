import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonLabel, IonIcon, IonItem, IonList, IonImg, IonSearchbar } from '@ionic/angular/standalone';


@Component({
  selector: 'app-quehacer',
  templateUrl: './quehacer.page.html',
  styleUrls: ['./quehacer.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonLabel, IonIcon, IonItem, IonList, IonImg, IonSearchbar]
})
export class QuehacerPage implements OnInit {


  constructor() { }


  ngOnInit() {
  }


}


