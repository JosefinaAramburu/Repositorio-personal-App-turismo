import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonSelect, IonSelectOption,
  IonButton, IonItem, IonLabel, IonTextarea, IonList, IonIcon
} from '@ionic/angular/standalone';

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
  lugarSeleccionado = '';
  resenas: any[] = [];
  nuevaResena = { texto: '', puntuacion: 0 };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.lugarSeleccionado = params['lugar'] || 'Lugar no especificado';
    });

    // Ejemplo: reseñas iniciales
    this.resenas = [
      { usuario: 'María López', puntuacion: 5, texto: 'Hermoso lugar, muy limpio.', fecha: new Date('2025-09-15') },
      { usuario: 'Juan Pérez', puntuacion: 4, texto: 'Muy interesante, pero algo lleno.', fecha: new Date('2025-09-22') }
    ];
  }

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
