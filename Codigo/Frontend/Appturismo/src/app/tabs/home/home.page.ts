import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage {
  contadores = {
    eventos: 12,
    lugares: 25,
    gastronomia: 18,
    recorridos: 5
  };

  constructor(private navCtrl: NavController) {}

  navegarAEventos() {
    this.navCtrl.navigateForward('/tabs/home/eventos');
  }

  navegarALugares() {
    this.navCtrl.navigateForward('/tabs/capture'); // Ya existe
  }

  navegarAGastronomia() {
    this.navCtrl.navigateForward('/tabs/profile'); // Adaptaremos profile
  }

  navegarARecorridos() {
    this.navCtrl.navigateForward('/tabs/stats'); // Adaptaremos stats
  }
}
