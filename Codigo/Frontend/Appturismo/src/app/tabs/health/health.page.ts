import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSelect, IonSelectOption, IonButton, IonItem, IonLabel, IonTextarea, IonList, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonSelect, IonSelectOption, IonButton,
    IonItem, IonLabel, IonTextarea, IonList, IonIcon,
    CommonModule, FormsModule
  ]
})
export class HealthPage implements OnInit {

  resenas = [
    { usuario: 'María López', puntuacion: 5, texto: 'Hermoso lugar, muy limpio y con buena atención.', fecha: new Date('2025-09-15') },
    { usuario: 'Juan Pérez', puntuacion: 4, texto: 'El evento fue genial, pero el acceso era un poco complicado.', fecha: new Date('2025-09-22') },
    { usuario: 'Lucía Fernández', puntuacion: 3, texto: 'Buena comida, aunque tardaron en atendernos.', fecha: new Date('2025-09-28') }
  ];

  nuevaResena = { texto: '', puntuacion: 0 };

  constructor() {}

  ngOnInit() {}

  getStars(puntuacion: number) {
    return Array(puntuacion).fill(0);
  }

  agregarResena() {
    if (this.nuevaResena.texto && this.nuevaResena.puntuacion) {
      const nueva = {
        usuario: 'Usuario actual',
        texto: this.nuevaResena.texto,
        puntuacion: this.nuevaResena.puntuacion,
        fecha: new Date()
      };
      this.resenas.unshift(nueva);
      this.nuevaResena = { texto: '', puntuacion: 0 };
    } else {
      alert('Completá todos los campos antes de enviar tu reseña.');
    }
  }
}
