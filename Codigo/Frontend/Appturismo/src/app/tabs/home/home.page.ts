import { Component } from '@angular/core';
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
    // En el futuro podés conectar esto con Supabase
  }

  irA(tab: string) {
    switch (tab) {
      case 'eventos':
        this.navCtrl.navigateForward('/tabs/stats');
        break;
      case 'lugares':
        this.navCtrl.navigateForward('/tabs/capture');
        break;
      case 'gastronomia':
        this.navCtrl.navigateForward('/tabs/gastronomia');
        break;
      case 'recorridos':
        this.navCtrl.navigateForward('/tabs/recorridos');
        break;
    }
  }
}
