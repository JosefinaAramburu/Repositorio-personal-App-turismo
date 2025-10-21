import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonCard,
  IonIcon
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,  
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonCard,
    IonIcon,
    FormsModule
  ]
})
export class HomePage {
  pais: string = '';

  constructor(private navCtrl: NavController) {}

  buscarDestino() {
    console.log('Destino buscado:', this.pais);
  }

  irA(tab: string) {
    console.log('🔍 Navegando a:', tab);
    
    switch (tab) {
      case 'eventos':
        console.log('Eventos → /tabs/stats');
        this.navCtrl.navigateRoot('/tabs/stats');
        break;
      case 'lugares':
        console.log('Lugares → /tabs/capture');
        this.navCtrl.navigateRoot('/tabs/capture');
        break;
      case 'gastronomia':
        console.log('Gastronomia → /tabs/gastronomia');
        this.navCtrl.navigateRoot('/tabs/gastronomia');
        break;
      case 'recorridos':
        console.log('Recorridos → /tabs/recorridos');
        this.navCtrl.navigateRoot('/tabs/recorridos');
        break;
    }
  }
}