import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Resena {
  texto: string;
  fecha: string;
}

@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HealthPage implements OnInit {
  lugarSeleccionado: string = 'Lugar no especificado';
  resenas: Resena[] = [
    { texto: 'Hermoso lugar, muy limpio.', fecha: '14/09/2025' },
    { texto: 'Muy interesante, pero algo lleno.', fecha: '21/09/2025' },
  ];

  nuevaResena: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.lugarSeleccionado = params['lugar'] || 'Lugar no especificado';
    });
  }

  agregarResena() {
    if (this.nuevaResena.trim()) {
      const fecha = new Date().toLocaleDateString('es-AR');
      this.resenas.push({ texto: this.nuevaResena, fecha });
      this.nuevaResena = '';
    }
  }
}